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
import SetSymbol from '@/components/setsymbol/SetSymbol'
import LanguageSwitcher from '@/components/languageswitcher/LanguageSwitcher'
import {getMessages} from '@/lib/i18n'
import {sortPokemonCardsBySubset} from '@/lib/pokemonCardOrder'
import {getSiteLocale} from '@/lib/siteLocale.server'
import {withSiteLocalePath} from '@/lib/locales'
import {notFound} from 'next/navigation'
import type {Metadata} from 'next'
import {cache, Suspense} from 'react'

const fetchSetData = cache(async (url: string) => {
  const data = await cms.first({
    type: PokemonSet,
    select: {
      ...PokemonSet,
      _id: Query.id,
      cards: Query.children({
        type: PokemonCard,
        select: {
          id: Query.id,
          collectorNumber: PokemonCard.collectorNumber,
          number: PokemonCard.number,
          printingKey: PokemonCard.printingKey
        }
      })
    },
    filter: {
      _status: 'published',
      _url: url
    }
  })

  if (!data) return null

  const cardIds = sortPokemonCardsBySubset(data.cards).map(card => card.id)
  const cards = await fetchPokemonCards(cardIds, data.language || 'en-US')

  const languages = data.sourceSetKey
    ? await cms.find({
        type: PokemonSet,
        filter: {sourceSetKey: data.sourceSetKey, _status: 'published'},
        select: {
          href: Query.url,
          language: PokemonSet.language,
          title: Query.title
        }
      })
    : []

  return {
    ...data,
    cards,
    languages
  }
})

type SetParams = {
  collection: string
  series: string
  serie: string
  set: string
}

export async function generateMetadata({
  params
}: {
  params: Promise<SetParams>
}): Promise<Metadata> {
  const {collection, series, serie, set} = await params
  const data = await fetchSetData(
    `/collections/${collection}/${series}/${serie}/${set}`
  )
  if (!data) return {}
  const siteLocale = await getSiteLocale()
  return {
    title: `${data.title} | collection.cards`,
    alternates: {
      canonical: withSiteLocalePath(
        `/collections/${collection}/${series}/${serie}/${set}`,
        siteLocale
      ),
      languages: Object.fromEntries(
        data.languages
          .filter(option => option.language)
          .map(option => [
            option.language!,
            withSiteLocalePath(option.href, siteLocale)
          ])
      )
    }
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
  params: Promise<SetParams>
}) {
  const {collection, series, serie, set} = await params
  const setData = await fetchSetData(
    `/collections/${collection}/${series}/${serie}/${set}`
  )
  if (!setData) return notFound()
  const siteLocale = await getSiteLocale()
  const messages = getMessages(siteLocale)

  return (
    <Container>
      <div className="flex gap-4 pb-5 items-start justify-between">
        <div>
          <Title.H1>{setData.title}</Title.H1>
          {setData.sourceSetKey && (
            <p className="font-mono text-sm uppercase tracking-wide text-muted-foreground">
              {messages.setId}:{' '}
              {setData.sourceSetKey}
            </p>
          )}
        </div>
        <SetSymbol
          code={setData.ptcgoCode}
          symbol={setData.symbol?.[0] || undefined}
          title={setData.title}
        />
      </div>
      <div className="pb-8">
        <LanguageSwitcher
          currentLanguage={setData.language}
          options={setData.languages}
        />
      </div>
      {setData.cards.length === 0 ? (
        <NoResults
          contribute={true}
          title={messages.emptySetTitle}
          description={messages.emptySetDescription}
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
