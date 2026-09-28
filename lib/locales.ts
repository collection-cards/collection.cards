export const locales = {
  'en-US': {
    tag: 'en-US',
    route: 'en',
    aliases: ['en-us', 'en_us', 'us'],
    label: 'English',
    nativeLabel: 'English',
    shortLabel: 'EN'
  },
  'pt-BR': {
    tag: 'pt-BR',
    route: 'pt-br',
    aliases: ['pt', 'pt_br', 'br'],
    label: 'Portuguese (Brazil)',
    nativeLabel: 'Português (Brasil)',
    shortLabel: 'PT-BR'
  },
  'fr-FR': {
    tag: 'fr-FR',
    route: 'fr',
    aliases: ['fr-fr', 'fr_fr'],
    label: 'French (France)',
    nativeLabel: 'Français (France)',
    shortLabel: 'FR'
  },
  'it-IT': {
    tag: 'it-IT',
    route: 'it',
    aliases: ['it-it', 'it_it'],
    label: 'Italian (Italy)',
    nativeLabel: 'Italiano (Italia)',
    shortLabel: 'IT'
  },
  'de-DE': {
    tag: 'de-DE',
    route: 'de',
    aliases: ['de-de', 'de_de'],
    label: 'German (Germany)',
    nativeLabel: 'Deutsch (Deutschland)',
    shortLabel: 'DE'
  },
  'es-ES': {
    tag: 'es-ES',
    route: 'es',
    aliases: ['es-es', 'es_es'],
    label: 'Spanish (Spain)',
    nativeLabel: 'Español (España)',
    shortLabel: 'ES'
  },
  'es-419': {
    tag: 'es-419',
    route: 'es-419',
    aliases: ['es_419', 'es-latam'],
    label: 'Spanish (Latin America)',
    nativeLabel: 'Español (Latinoamérica)',
    shortLabel: 'ES-419'
  }
} as const

export type LocaleTag = keyof typeof locales
export type LocaleDefinition = (typeof locales)[LocaleTag]

export const defaultLocale: LocaleTag = 'en-US'
export const siteLocaleCookie = 'collection-cards-site-locale'
export const cardLanguageCookie = 'collection-cards-card-language'

export const supportedCardLocales = Object.values(locales)
export const availableCardLocales = [locales['en-US'], locales['pt-BR']] as const
export const supportedSiteLocales = [locales['en-US'], locales['pt-BR']] as const

export function cardLanguageFromPath(pathname: string): LocaleDefinition | null {
  const segments = pathname.split('/').filter(Boolean)
  if (segments.length && siteLocaleFromRoute(segments[0])) {
    segments.shift()
  }
  if (
    segments[0] === 'collections' &&
    segments[1] === 'pokemon' &&
    segments[2]
  ) {
    return localeFromRoute(segments[2])
  }
  return null
}


export function normalizeLocale(value?: string | null): LocaleTag | null {
  if (!value) return null
  const normalized = value.trim().toLowerCase()
  return (
    supportedCardLocales.find(
      locale =>
        locale.tag.toLowerCase() === normalized ||
        locale.route === normalized ||
        (locale.aliases as readonly string[]).includes(normalized)
    )?.tag ?? null
  )
}

export function isSiteLocale(value?: string | null): value is LocaleTag {
  const normalized = normalizeLocale(value)
  return supportedSiteLocales.some(locale => locale.tag === normalized)
}

export function siteLocaleFromRoute(value?: string | null) {
  const locale = localeFromRoute(value)
  return locale && isSiteLocale(locale.tag) ? locale : null
}

export function localeFromRoute(value?: string | null) {
  const tag = normalizeLocale(value)
  return tag ? locales[tag] : null
}

export function localeLabel(value?: string | null) {
  const tag = normalizeLocale(value)
  return tag ? locales[tag].nativeLabel : value || 'Default'
}

export function stripSiteLocaleFromPath(pathname: string) {
  const segments = pathname.split('/').filter(Boolean)
  if (segments.length && siteLocaleFromRoute(segments[0])) segments.shift()
  return `/${segments.join('/')}`
}

export function withSiteLocalePath(pathname: string, locale: LocaleTag) {
  const path = stripSiteLocaleFromPath(pathname)
  return `/${locales[locale].route}${path === '/' ? '' : path}`
}

export function withLocalePreferences(
  href: string,
  siteLocale: LocaleTag,
  cardLocale?: LocaleTag | null
) {
  if (!href.startsWith('/') || href.startsWith('//')) return href
  let path = stripSiteLocaleFromPath(href)
  if (cardLocale) {
    const segments = path.split('/').filter(Boolean)
    if (
      segments[0] === 'collections' &&
      segments[1] === 'pokemon' &&
      localeFromRoute(segments[2])
    ) {
      segments[2] = locales[cardLocale].route
      path = `/${segments.join('/')}`
    }
  }
  return withSiteLocalePath(path, siteLocale)
}
