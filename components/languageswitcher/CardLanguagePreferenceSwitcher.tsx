'use client'

import {useSiteI18n} from '@/components/sitei18n/SiteI18nProvider'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import {
  availableCardLocales,
  cardLanguageCookie,
  localeLabel,
  LocaleTag,
  locales,
  siteLocaleFromRoute,
  withSiteLocalePath
} from '@/lib/locales'
import {GalleryVerticalEnd} from 'lucide-react'
import {usePathname, useRouter} from 'next/navigation'
import {useTransition} from 'react'
import {useCardLanguageRoute} from './CardLanguageContext'

export default function CardLanguagePreferenceSwitcher({
  language
}: {
  language: LocaleTag
}) {
  const {locale, messages} = useSiteI18n()
  const {route} = useCardLanguageRoute()
  const router = useRouter()
  const pathname = usePathname()
  const [isPending, startTransition] = useTransition()

  const changeLanguage = (nextLanguage: LocaleTag) => {
    document.cookie = `${cardLanguageCookie}=${nextLanguage}; Path=/; Max-Age=31536000; SameSite=Lax`
    const search = typeof window !== 'undefined' ? window.location.search : ''

    const equivalentPage = route?.options.find(
      option => option.language === nextLanguage
    )
    if (equivalentPage) {
      window.location.assign(
        `${withSiteLocalePath(equivalentPage.href, locale)}${search}`
      )
      return
    }

    const segments = pathname.split('/').filter(Boolean)
    if (segments.length && siteLocaleFromRoute(segments[0])) {
      segments.shift()
    }
    const isPokemonCatalogue =
      segments[0] === 'collections' && segments[1] === 'pokemon'

    if (isPokemonCatalogue) {
      window.location.assign(
        `${withSiteLocalePath(
          `/collections/pokemon/${locales[nextLanguage].route}`,
          locale
        )}${search}`
      )
      return
    }

    startTransition(() => router.refresh())
  }

  return (
    <div className="flex items-center gap-2">
      <span className="hidden text-xs text-muted-foreground xl:inline">
        {messages.cardLanguage}
      </span>
      <Select
        value={route?.currentLanguage ?? language}
        onValueChange={value => changeLanguage(value as LocaleTag)}
        disabled={isPending}
      >
        <SelectTrigger
          size="sm"
          className="min-w-10 bg-background md:min-w-44"
          aria-label={messages.selectCardLanguage}
          title={messages.cardLanguage}
        >
          <GalleryVerticalEnd aria-hidden="true" />
          <span className="hidden md:inline">
            <SelectValue placeholder={messages.selectCardLanguage} />
          </span>
        </SelectTrigger>
        <SelectContent align="end">
          {availableCardLocales.map(option => (
            <SelectItem key={option.tag} value={option.tag}>
              {localeLabel(option.tag)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
