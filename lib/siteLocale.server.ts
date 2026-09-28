import {cookies, headers} from 'next/headers'
import {
  defaultLocale,
  isSiteLocale,
  cardLanguageCookie,
  LocaleTag,
  normalizeLocale,
  siteLocaleCookie
} from './locales'

export async function getSiteLocale(): Promise<LocaleTag> {
  const headerStore = await headers()
  const requestLocale = normalizeLocale(headerStore.get('x-site-locale'))
  if (requestLocale && isSiteLocale(requestLocale)) return requestLocale
  const cookieStore = await cookies()
  const cookieLocale = normalizeLocale(cookieStore.get(siteLocaleCookie)?.value)
  return cookieLocale && isSiteLocale(cookieLocale) ? cookieLocale : defaultLocale
}

export async function getPreferredCardLanguage(): Promise<LocaleTag> {
  const headerStore = await headers()
  const requestCardLanguage = normalizeLocale(headerStore.get('x-card-language'))
  if (requestCardLanguage) return requestCardLanguage

  const cookieStore = await cookies()
  return (
    normalizeLocale(cookieStore.get(cardLanguageCookie)?.value) ?? defaultLocale
  )
}
