import {IllustratorCardsOverviewBlock as IllustratorCardsOverviewBlockSchema} from '@/alinea/blocks/illustratorcardsoverview/IllustratorCardsOverviewBlock.schema'
import {PokemonCard} from '@/alinea/schemas/PokemonCard'
import {cms} from '@/cms'
import CardGrid, {CardGridProps} from '@/components/cardgrid/CardGrid'
import NoResults from '@/components/noresults/NoResults'
import {fetchPokemonCards} from '@/server/fetchPokemonCards'
import {Query} from 'alinea'
import {getMessages} from '@/lib/i18n'
import {
  getPreferredCardLanguage,
  getSiteLocale
} from '@/lib/siteLocale.server'

const fetchIllustratorCards = async (
  illustratorId: string,
  preferredLanguage: string
): Promise<CardGridProps['cards']> => {
  const illustratorCardIds = await cms.find({
    type: PokemonCard,
    select: {
      id: Query.id
    },
    filter: {
      illustrator: {has: {_entry: {in: [illustratorId]}}},
      language: preferredLanguage
    },
    orderBy: {asc: Query.id}
  })

  return await fetchPokemonCards(
    illustratorCardIds.map(pc => pc.id),
    preferredLanguage,
    {expandVariants: false}
  )
}

const IllustratorCardsOverviewBlock: React.FC<
  IllustratorCardsOverviewBlockSchema
> = async ({illustratorId}) => {
  const preferredLanguage = await getPreferredCardLanguage()
  const cardsData = await fetchIllustratorCards(
    illustratorId,
    preferredLanguage
  )
  const messages = getMessages(await getSiteLocale())

  if (!cardsData || cardsData.length === 0)
    return (
      <NoResults
        contribute={true}
        title={messages.illustratorNoCards}
        description={messages.illustratorNoCardsDescription}
      />
    )

  return (
    <div>
      <div lang={preferredLanguage}>
        <CardGrid cards={cardsData} />
      </div>
    </div>
  )
}

export default IllustratorCardsOverviewBlock
