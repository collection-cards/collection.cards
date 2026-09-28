import {PokemonCard} from '@/alinea/schemas/PokemonCard'
import {cms} from '@/cms'
import {CardGridProps} from '@/components/cardgrid/CardGrid'
import {blurDataURL} from '@/lib/blurDataURL'
import {selectPreferredCardEditions} from '@/lib/pokemonCardLocales'
import {Query} from 'alinea'

export const fetchPokemonCards = async (
  pokemonCardIds: string[],
  preferredLanguage = 'en-US',
  {expandVariants = true}: {expandVariants?: boolean} = {}
): Promise<CardGridProps['cards']> => {
  const localizedCards = (
    await cms.find({
      type: PokemonCard,
      select: {
        ...PokemonCard,
        _id: Query.id,
        parents: Query.parents({
          select: {
            _type: Query.type,
            title: Query.title,
            url: Query.url
          }
        })
      },
      filter: {
        _id: {in: pokemonCardIds}
      }
    })
  ).sort(
    (a, b) => pokemonCardIds.indexOf(a._id) - pokemonCardIds.indexOf(b._id)
  )

  // Locale editions are separate CMS rows but represent one physical
  // printing. Keep one row per canonical printing and prefer the requested
  // language, falling back deterministically to the first available edition.
  const cardsData = selectPreferredCardEditions(
    localizedCards,
    preferredLanguage
  )

  const cards = [] as CardGridProps['cards']

  cardsData.forEach(data => {
    if (!data) return

    const basicInfo: CardGridProps['cards'][number] = {
      blurDataURL: blurDataURL(data.card?.thumbHash),
      cardtype: data.cardtype,
      edgeColor: data.edgeColor,
      energy: data.energy,
      focus: data.card?.focus,
      glowColor:
        data.energy || data.subtype
          ? `var(--${data.energy || data.subtype})`
          : undefined,
      hp: data.hp,
      id: data._id,
      illustrator: data.illustrator,
      pokemon: data.pokemon,
      printingId: data._id,
      src: data.card ? `/media${data.card?.src}` : undefined,
      title: data.title,
      variant: 'normal',
      // details for PokemonCardDetailsProps:
      isEx: data.isEx,
      isFullArt: data.isFullArt,
      isTrainerGallery: data.isTrainerGallery,
      number: data.number,
      collectorNumber: data.collectorNumber,
      regulationMark: data.regulationMark,
      weakness: data.weakness,
      resistance: data.resistance,
      retreat: data.retreat,
      rulesText: data.rulesText,
      rarity: data.rarity,
      serie: {
        title:
          data.parents.find(parent => parent._type === 'PokemonSerie')?.title ||
          '',
        url:
          data.parents.find(parent => parent._type === 'PokemonSerie')?.url ||
          ''
      },
      set: {
        title:
          data.parents.find(parent => parent._type === 'PokemonSet')?.title ||
          '',
        url:
          data.parents.find(parent => parent._type === 'PokemonSet')?.url || ''
      }
    }

    // Overview pages such as illustrators represent card printings, not every
    // finish. Keep a single card there so reverse-holo variants do not look
    // like duplicate language editions.
    if (!expandVariants || !data.variants || data.variants.length === 0) {
      cards.push(basicInfo)
      return
    }

    // add the variants
    data.variants.forEach(variant => {
      cards.push({
        ...basicInfo,
        id: variant._id,
        foil: variant.foil?.src || undefined,
        mask: variant.mask?.src || undefined,
        pattern: variant.pattern || undefined,
        src:
          variant.variant === 'reverse_holofoil' && data.reverseCard?.src
            ? `/media${data.reverseCard?.src}`
            : basicInfo.src,
        title: `${basicInfo.title}`,
        variant: variant.variant || 'normal'
      })
    })
  })

  return cards
}
