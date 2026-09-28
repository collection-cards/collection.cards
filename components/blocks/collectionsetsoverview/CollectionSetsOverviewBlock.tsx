import {CollectionSetsOverviewBlock as CollectionSetsOverviewBlockSchema} from '@/alinea/blocks/collectionsetsoverview/CollectionSetsOverviewBlock.schema'
import {PokemonCard} from '@/alinea/schemas/PokemonCard'
import {PokemonSet} from '@/alinea/schemas/PokemonSet'
import {cms} from '@/cms'
import SetCard from '@/components/setcard/SetCard'
import {formatDate} from '@/lib/formatDate'
import {getSiteLocale} from '@/lib/siteLocale.server'
import {withSiteLocalePath} from '@/lib/locales'
import {Query} from 'alinea'
import {Entry} from 'alinea/core'

const fetchSetsData = async (setIds: string[]) => {
  return await cms.find({
    id: {in: setIds},
    type: PokemonSet,
    select: {
      ...PokemonSet,
      id: Query.id,
      url: Entry.url,
      cards: Query.children({
        type: PokemonCard,
        select: {
          variants: PokemonCard.variants
        }
      }),
      parents: Query.parents({
        select: {
          title: Query.title
        }
      })
    },
    filter: {
      _status: 'published'
    },
    orderBy: {desc: PokemonSet.releaseDate}
  })
}

const CollectionSetsOverviewBlock: React.FC<
  CollectionSetsOverviewBlockSchema
> = async ({setIds}) => {
  const setsData = await fetchSetsData(
    (setIds as {_entry: string}[]).map(set => set._entry)
  )
  if (!setsData || setsData.length === 0) return null
  const siteLocale = await getSiteLocale()

  return (
    <div>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 items-stretch">
        {setsData.map((set, index) => {
          const numberOfTotalCards = set.cards.reduce(
            (total, card) => total + (card.variants?.length || 1),
            0
          )
          return (
            <SetCard
              date={formatDate(set.releaseDate, siteLocale)}
              key={set.id}
              href={withSiteLocalePath(set.url, siteLocale)}
              image={set.heroImage}
              logo={set.logo}
              numberOfTotalCards={numberOfTotalCards}
              language={set.language}
              priority={index < 5}
              ptcgoCode={set.ptcgoCode}
              sourceSetKey={set.sourceSetKey}
              subTitle={set.parents[set.parents.length - 1]?.title || ''}
              symbol={set.symbol?.[0] || undefined}
              text={set.cta_description}
              title={set.title}
            />
          )
        })}
      </div>
    </div>
  )
}

export default CollectionSetsOverviewBlock
