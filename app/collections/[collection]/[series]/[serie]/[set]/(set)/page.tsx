import {PokemonCard} from '@/alinea/schemas/PokemonCard'
import {PokemonCollection} from '@/alinea/schemas/PokemonCollection'
import {PokemonSerie} from '@/alinea/schemas/PokemonSerie'
import {PokemonSeries} from '@/alinea/schemas/PokemonSeries'
import {PokemonSet} from '@/alinea/schemas/PokemonSet'
import {cms} from '@/cms'
import CardGrid from '@/components/cardgrid/CardGrid'
import Container from '@/components/container/Container'
import NoResults from '@/components/noresults/NoResults'
import PokemonSetOverview from '@/components/pokemonsetoverview/PokemonSetOverview'
import {Title} from '@/components/title/Title'
import {fetchPokemonCards} from '@/server/fetchPokemonCards'
import {Query} from 'alinea'
import Image from 'next/image'
import {notFound} from 'next/navigation'
import {Suspense} from 'react'

const fetchSetData = async (url: string) => {
  const data = await cms.first({
    type: PokemonSet,
    select: {
      ...PokemonSet,
      _id: Query.id,
      cards: Query.children({
        type: PokemonCard,
        select: {id: Query.id},
        orderBy: {asc: PokemonCard.number}
      })
    },
    filter: {
      _status: 'published',
      _url: url
    }
  })

  if (!data) return null

  const cardIds = data?.cards.map(card => card.id) || []
  const cards = await fetchPokemonCards(cardIds)

  return {
    ...data,
    cards
  }
}

export async function generateStaticParams() {
  const data = await cms.find({
    type: PokemonCollection,
    select: {
      collection: Query.path,
      series: Query.children({
        type: PokemonSeries,
        select: {
          series: Query.path,
          serie: Query.children({
            type: PokemonSerie,
            select: {
              serie: Query.path,
              set: Query.children({
                type: PokemonSet,
                select: {
                  set: Query.path
                }
              })
            }
          })
        }
      })
    }
  })

  return data.flatMap(col =>
    col.series.flatMap(ser =>
      ser.serie.flatMap(seri =>
        seri.set.map(set => ({
          collection: col.collection,
          series: ser.series,
          serie: seri.serie,
          set: set.set
        }))
      )
    )
  )
}

export default async function Set({
  params
}: {
  params: Promise<{
    collection: string
    series: string
    serie: string
    set: string
  }>
}) {
  const {collection, series, serie, set} = await params
  const setData = await fetchSetData(
    `/collections/${collection}/${series}/${serie}/${set}`
  )
  if (!setData) return notFound()

  const symbol = setData.symbol?.[0] || undefined

  return (
    <Container>
      <div className="flex gap-4 pb-5 items-start justify-between">
        <Title.H1>{setData.title}</Title.H1>
        {symbol && (
          <div className="relative w-8 h-8">
            <Image
              alt={setData.title}
              src={`/media${symbol?.src}`}
              fill={true}
              sizes="32px"
              style={{
                objectFit: 'contain',
                objectPosition: symbol?.focus
                  ? `${symbol.focus.x * 100}% ${symbol.focus.y * 100}%`
                  : undefined
              }}
            />
          </div>
        )}
      </div>
      {setData.cards.length === 0 ? (
        <NoResults
          contribute={true}
          title="This set is just getting started"
          description={`No cards have been added yet.\nBe the first to contribute and help the community grow.`}
        />
      ) : collection === 'pokemon' ? (
        <Suspense>
          <PokemonSetOverview
            cards={setData.cards}
            logo={setData.logo}
            setId={setData._id}
          />
        </Suspense>
      ) : (
        <CardGrid cards={setData.cards} />
      )}
    </Container>
  )
}
