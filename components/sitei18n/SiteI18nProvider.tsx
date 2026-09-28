'use client'

import {getMessages, SiteMessages} from '@/lib/i18n'
import {defaultLocale, LocaleTag} from '@/lib/locales'
import {createContext, PropsWithChildren, useContext, useMemo} from 'react'

type SiteI18nContextValue = {
  locale: LocaleTag
  messages: SiteMessages
}

const SiteI18nContext = createContext<SiteI18nContextValue>({
  locale: defaultLocale,
  messages: getMessages(defaultLocale)
})

export function SiteI18nProvider({
  children,
  locale
}: PropsWithChildren<{locale: LocaleTag}>) {
  const value = useMemo(
    () => ({locale, messages: getMessages(locale)}),
    [locale]
  )

  return (
    <SiteI18nContext.Provider value={value}>
      {children}
    </SiteI18nContext.Provider>
  )
}

export function useSiteI18n() {
  return useContext(SiteI18nContext)
}
