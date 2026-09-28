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
  localeLabel,
  LocaleTag,
  siteLocaleCookie,
  supportedSiteLocales,
  withSiteLocalePath
} from '@/lib/locales'
import {Languages} from 'lucide-react'
import {usePathname} from 'next/navigation'

export default function SiteLanguageSwitcher() {
  const {locale, messages} = useSiteI18n()
  const pathname = usePathname()

  const changeLocale = (nextLocale: LocaleTag) => {
    document.cookie = `${siteLocaleCookie}=${nextLocale}; Path=/; Max-Age=31536000; SameSite=Lax`
    document.documentElement.lang = nextLocale
    const search = typeof window !== 'undefined' ? window.location.search : ''
    window.location.assign(`${withSiteLocalePath(pathname, nextLocale)}${search}`)
  }

  return (
    <div className="flex items-center gap-2">
      <span className="hidden text-xs text-muted-foreground xl:inline">
        {messages.siteLanguage}
      </span>
      <Select
        value={locale}
        onValueChange={value => changeLocale(value as LocaleTag)}
      >
        <SelectTrigger
          size="sm"
          className="min-w-10 bg-background md:min-w-44"
          aria-label={messages.selectSiteLanguage}
          title={messages.siteLanguage}
        >
          <Languages aria-hidden="true" />
          <span className="hidden md:inline">
            <SelectValue placeholder={messages.selectSiteLanguage} />
          </span>
        </SelectTrigger>
        <SelectContent align="end">
          {supportedSiteLocales.map(option => (
            <SelectItem key={option.tag} value={option.tag}>
              {localeLabel(option.tag)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
