'use client'

import {
  cardLanguageCookie,
  normalizeLocale
} from '@/lib/locales'
import {useEffect, useMemo} from 'react'
import {useCardLanguageRoute} from './CardLanguageContext'

type LanguageOption = {
  href: string
  language?: string | null
  title: string
}

export default function LanguageSwitcher({
  currentLanguage,
  options
}: {
  currentLanguage?: string | null
  options: LanguageOption[]
}) {
  const {registerRoute} = useCardLanguageRoute()
  const uniqueOptions = useMemo(
    () =>
      options.filter(
        (option, index) =>
          options.findIndex(
            candidate =>
              normalizeLocale(candidate.language) ===
              normalizeLocale(option.language)
          ) === index
      ),
    [options]
  )
  const current = normalizeLocale(currentLanguage) ?? undefined

  useEffect(() => {
    if (!current) return
    document.cookie = `${cardLanguageCookie}=${current}; Path=/; Max-Age=31536000; SameSite=Lax`
  }, [current])

  useEffect(() => {
    if (!current) return
    return registerRoute({
      currentLanguage: current,
      options: uniqueOptions.flatMap(option => {
        const language = normalizeLocale(option.language)
        return language ? [{...option, language}] : []
      })
    })
  }, [current, registerRoute, uniqueOptions])

  return null
}
