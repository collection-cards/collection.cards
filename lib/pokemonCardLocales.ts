export type LocalizedCardIdentity = {
  _id: string
  printingKey?: string | null
  language?: string | null
}

/**
 * Collapse localized CMS rows into physical printings while preferring the
 * requested language. Input order is preserved for stable galleries.
 */
export function selectPreferredCardEditions<T extends LocalizedCardIdentity>(
  cards: T[],
  preferredLanguage: string
): T[] {
  const cardsByPrinting = new Map<string, T>()

  for (const card of cards) {
    const key = card.printingKey?.trim() || card._id
    const current = cardsByPrinting.get(key)
    if (!current || card.language === preferredLanguage) {
      cardsByPrinting.set(key, card)
    }
  }

  return [...cardsByPrinting.values()]
}
