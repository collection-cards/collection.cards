/**
 * Local catalog policy for Malie exports whose upstream index metadata is
 * incomplete or whose files are auxiliary feeds rather than standalone sets.
 */

const LOCALIZED_NAMES: Record<string, Record<string, string>> = {
  'en-US': {
    'me5-5': 'Mega Evolution — 30th Celebration',
    'me5-5m': 'Mega Evolution — 30th Celebration: RGB Mini Set',
    mebsp: 'Mega Evolution — Black Star Promos',
    mee: 'Mega Evolution — Energy',
    svbsp: 'Scarlet & Violet — Black Star Promos',
    sve: 'Scarlet & Violet — Energy'
  },
  'pt-BR': {
    'me5-5': 'Megaevolução — Celebração de 30 Anos',
    'me5-5m': 'Megaevolução — Celebração de 30 Anos: Mini Set RGB',
    mebsp: 'Megaevolução — Cartas Promocionais Estrela Preta',
    mee: 'Megaevolução — Energia',
    svbsp: 'Escarlate e Violeta — Cartas Promocionais Estrela Preta',
    sve: 'Escarlate e Violeta — Energia'
  }
}

const AUXILIARY_EXPORTS: Record<string, string> = {
  'me5-5c': 'exportação auxiliar vazia; não representa uma coleção',
  mealt: 'artes alternativas que pertencem a outras coleções',
  svalt: 'artes alternativas que pertencem a outras coleções'
}

export type LocalizedSetMetadata = {
  description?: string
  heroUrl?: string
  logoUrl?: string
  symbolUrl?: string
}

const LOCALIZED_SET_METADATA: Record<
  string,
  Record<string, LocalizedSetMetadata>
> = {
  'en-US': {
    'me5-5': {
      heroUrl:
        'https://www.pokemon.com/static-assets/content-assets/cms2/img/trading-card-game/series/me_series/30th/30th-banner.png',
      logoUrl:
        'https://www.pokemon.com/static-assets/content-assets/cms2/img/trading-card-game/series/me_series/30th/30th_logo_169_en.png',
      symbolUrl:
        'https://www.pokemon.com/static-assets/content-assets/cms2/img/trading-card-game/_symbols/expansion_symbol_38x38/30th_symbol_38x38.png'
    }
  },
  'pt-BR': {
    'me5-5': {
      description:
        'Celebre três décadas de Pokémon Estampas Ilustradas com cartas especiais, Pokémon favoritos dos fãs e 30 ilustrações diferentes de Pikachu para colecionar.',
      heroUrl:
        'https://mcdn.pokemon.com/pokemon-prod/image/upload/c_limit,w_1920/f_auto/v1/live/pcom-cms/static-assets/cms3/br/img/trading-card-game/tiles/30th/launch/30th-launch-169-br.png',
      logoUrl:
        'https://www.pokemon.com/static-assets/content-assets/cms2-pt-br/img/trading-card-game/series/me_series/30th/30th_logo_169_br.png',
      symbolUrl:
        'https://www.pokemon.com/static-assets/content-assets/cms2/img/trading-card-game/_symbols/expansion_symbol_38x38/30th_symbol_38x38.png'
    }
  }
}

export function malieSetName(
  language: string,
  key: string,
  upstreamName: string
): string {
  return LOCALIZED_NAMES[language]?.[key] ?? upstreamName
}

export function malieExclusionReason(key: string): string | undefined {
  return AUXILIARY_EXPORTS[key]
}

export function malieSetMetadata(
  language: string,
  key: string
): LocalizedSetMetadata | undefined {
  return LOCALIZED_SET_METADATA[language]?.[key]
}
