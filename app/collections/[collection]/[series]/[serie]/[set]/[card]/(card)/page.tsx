import {PokemonCard} from '@/alinea/schemas/PokemonCard'
import {PokemonCollection} from '@/alinea/schemas/PokemonCollection'
import {PokemonSerie} from '@/alinea/schemas/PokemonSerie'
import {PokemonSeries} from '@/alinea/schemas/PokemonSeries'
import {PokemonSet} from '@/alinea/schemas/PokemonSet'
import {cms} from '@/cms'
import CardGrid from '@/components/cardgrid/CardGrid'
import Container from '@/components/container/Container'
import {Title} from '@/components/title/Title'
import {fetchPokemonCards} from '@/server/fetchPokemonCards'
import {Query} from 'alinea'
import {notFound} from 'next/navigation'
import {getSiteLocale} from '@/lib/siteLocale.server'
import {withSiteLocalePath} from '@/lib/locales'
import LanguageSwitcher from '@/components/languageswitcher/LanguageSwitcher'
import type {Metadata} from 'next'
import {cache} from 'react'

const fetchCardData = cache(async (url: string) => {
  const data = await cms.first({
    type: PokemonCard,
    filter: {
      _status: 'published',
      _url: url
    }
  })

  if (!data) return null

  const cards = await fetchPokemonCards([data._id])
  const languages = data.printingKey
    ? await cms.find({
        type: PokemonCard,
        filter: {printingKey: data.printingKey, _status: 'published'},
        select: {
          href: Query.url,
          language: PokemonCard.language,
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

type CardParams = {
  collection: string
  series: string
  serie: string
  set: string
  card: string
}

export async function generateMetadata({
  params
}: {
  params: Promise<CardParams>
}): Promise<Metadata> {
  const {collection, series, serie, set, card} = await params
  const data = await fetchCardData(
    `/collections/${collection}/${series}/${serie}/${set}/${card}`
  )
  if (!data) return {}
  const siteLocale = await getSiteLocale()
  return {
    title: `${data.title} #${data.number} | collection.cards`,
    alternates: {
      canonical: withSiteLocalePath(
        `/collections/${collection}/${series}/${serie}/${set}/${card}`,
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
                  set: Query.path,
                  card: Query.children({
                    type: PokemonCard,
                    select: {
                      card: Query.path
                    }
                  })
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
        seri.set.flatMap(set =>
          set.card.map(card => ({
            collection: col.collection,
            series: ser.series,
            serie: seri.serie,
            set: set.set,
            card: card.card
          }))
        )
      )
    )
  )
}

export default async function Card({
  params
}: {
  params: Promise<CardParams>
}) {
  const {collection, series, serie, set, card} = await params
  const cardData = await fetchCardData(
    `/collections/${collection}/${series}/${serie}/${set}/${card}`
  )
  if (!cardData) return notFound()

  return (
    <Container>
      <div lang={cardData.language || undefined}>
        <Title.H1>
          {cardData.title} ({cardData.number})
        </Title.H1>
      </div>
      <div className="pb-8">
        <LanguageSwitcher
          currentLanguage={cardData.language}
          options={cardData.languages}
        />
      </div>
      <div lang={cardData.language || undefined}>
        <CardGrid cards={cardData.cards} />
      </div>
    </Container>
  )
}
