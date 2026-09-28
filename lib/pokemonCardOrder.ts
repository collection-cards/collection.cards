type PokemonCardOrderItem = {
  collectorNumber?: string | null
  number?: string | null
  printingKey?: string | null
}

type IndexedCard<T> = {
  card: T
  groupKey: string
  index: number
}

const naturalCollator = new Intl.Collator('en', {
  numeric: true,
  sensitivity: 'base'
})

function getCardGroupKey(card: PokemonCardOrderItem): string {
  const printingKey = card.printingKey?.trim()
  const printingSeparator = printingKey?.lastIndexOf(':') ?? -1

  if (printingKey && printingSeparator > 0) {
    return `printing:${printingKey.slice(0, printingSeparator).toLowerCase()}`
  }

  const collectorNumber = card.collectorNumber?.trim()
  const collectorSeparator = collectorNumber?.lastIndexOf('/') ?? -1

  if (collectorNumber && collectorSeparator > 0) {
    return `collector:${collectorNumber
      .slice(collectorSeparator + 1)
      .toLowerCase()}`
  }

  return 'default'
}

function getCardSortValue(card: PokemonCardOrderItem): string {
  return card.collectorNumber?.trim() || card.number?.trim() || ''
}

/**
 * Keeps a set and its subsets together without interleaving equal card
 * numbers. The largest group is treated as the main set, while smaller
 * subsets follow it. Cards remain numerically ordered inside each group.
 */
export function sortPokemonCardsBySubset<T extends PokemonCardOrderItem>(
  cards: T[]
): T[] {
  const indexedCards: IndexedCard<T>[] = cards.map((card, index) => ({
    card,
    groupKey: getCardGroupKey(card),
    index
  }))

  const groups = new Map<string, {count: number; firstIndex: number}>()
  for (const {groupKey, index} of indexedCards) {
    const group = groups.get(groupKey)
    if (group) {
      group.count += 1
    } else {
      groups.set(groupKey, {count: 1, firstIndex: index})
    }
  }

  return indexedCards
    .sort((a, b) => {
      const groupA = groups.get(a.groupKey)!
      const groupB = groups.get(b.groupKey)!

      const groupSizeComparison = groupB.count - groupA.count
      if (groupSizeComparison !== 0) return groupSizeComparison

      if (a.groupKey !== b.groupKey) {
        return groupA.firstIndex - groupB.firstIndex
      }

      const cardNumberComparison = naturalCollator.compare(
        getCardSortValue(a.card),
        getCardSortValue(b.card)
      )
      if (cardNumberComparison !== 0) return cardNumberComparison

      return a.index - b.index
    })
    .map(({card}) => card)
}
