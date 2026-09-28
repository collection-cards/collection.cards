import {PokemonCard} from '@/alinea/schemas/PokemonCard'
import {PokemonCollection} from '@/alinea/schemas/PokemonCollection'
import {PokemonSet} from '@/alinea/schemas/PokemonSet'
import {cms} from '@/cms'
import Blocks from '@/components/blocks/Blocks'
import Container from '@/components/container/Container'
import SetCard from '@/components/setcard/SetCard'
import {Title} from '@/components/title/Title'
import {formatDate} from '@/lib/formatDate'
import {
  getPreferredCardLanguage,
  getSiteLocale
} from '@/lib/siteLocale.server'
import {Query} from 'alinea'
import {Entry} from 'alinea/core'
import {notFound} from 'next/navigation'
import {withSiteLocalePath} from '@/lib/locales'
import LanguageSwitcher from '@/components/languageswitcher/LanguageSwitcher'


const fetchCollectionData = async (collection: string, locale: string) => {
  const catalog = await cms.first({
    root: 'pages',
    type: PokemonCollection,
    filter: {
      _status: 'published',
      path: collection
    },
    select: {
      title: Query.title,
      blocks: PokemonCollection.blocks,
      sets: Query.children({
        depth: 3,
        type: PokemonSet,
        select: {
          ...PokemonSet,
          id: Query.id,
          parents: Query.parents({
            select: {
              _type: Query.type,
              title: Query.title
            }
          }),
          url: Entry.url,
          cards: Query.children({
            type: PokemonCard,
            select: {
              variants: PokemonCard.variants
            }
          })
        },
        filter: {
          _status: 'published'
        },
        orderBy: {desc: PokemonSet.releaseDate}
      })
    }
  })
  if (!catalog) return null

  const localized = await cms.first({
    root: 'site',
    preferredLocale: locale,
    type: PokemonCollection,
    filter: {path: collection},
    select: {
      title: Query.title,
      blocks: PokemonCollection.blocks
    }
  })

  return {
    ...catalog,
    title: localized?.title ?? catalog.title,
    blocks: localized?.blocks ?? catalog.blocks
  }
}

export async function generateStaticParams() {
  return await cms.find({
    type: PokemonCollection,
    select: {
      collection: Query.path
    }
  })
}

export default async function Collection({
  params
}: {
  params: Promise<{collection: string}>
}) {
  const {collection} = await params
  const siteLocale = await getSiteLocale()
  const collectionData = await fetchCollectionData(collection, siteLocale)
  if (!collectionData) notFound()
  const preferredCardLanguage = await getPreferredCardLanguage()

  const canonicalSets = new Map<
    string,
    (typeof collectionData.sets)[number]
  >()
  for (const set of collectionData.sets) {
    const key = set.sourceSetKey || set.id
    const current = canonicalSets.get(key)
    const currentIsPreferred = current?.language === preferredCardLanguage
    const candidateIsPreferred = set.language === preferredCardLanguage

    if (!current) {
      canonicalSets.set(key, set)
    } else if (candidateIsPreferred && !currentIsPreferred) {
      canonicalSets.set(key, set)
    } else if (!candidateIsPreferred && currentIsPreferred) {
      // Keep preferred current
    } else if (set.cards.length > current.cards.length) {
      canonicalSets.set(key, set)
    }
  }
  const sets = [...canonicalSets.values()]

  return (
    <Container>
      <Title.H1>{collectionData.title}</Title.H1>
      <LanguageSwitcher currentLanguage={preferredCardLanguage} options={[]} />
      <Blocks blocks={collectionData.blocks} />
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        {sets.map((set, index) => {
          const numberOfTotalCards = set.cards.reduce(
            (total, card) => total + (card.variants?.length || 1),
            0
          )
          return (
            <SetCard
              date={formatDate(set.releaseDate, siteLocale)}
              key={set.sourceSetKey || set.id}
              href={withSiteLocalePath(set.url, siteLocale)}
              image={set.heroImage}
              logo={set.logo}
              numberOfTotalCards={numberOfTotalCards}
              language={set.language}
              priority={index < 5}
              ptcgoCode={set.ptcgoCode}
              sourceSetKey={set.sourceSetKey}
              subTitle={
                set.parents.find(p => p._type === 'PokemonSerie')?.title || ''
              }
              symbol={set.symbol?.[0] || undefined}
              text={set.cta_description}
              title={set.title}
            />
          )
        })}
      </div>
    </Container>
  )
}
