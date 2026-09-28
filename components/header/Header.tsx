import {Header as HeaderSchema} from '@/alinea/schemas/Header'
import {cms} from '@/cms'
import {Logo} from '@/icons/Logo'
import {getMessages} from '@/lib/i18n'
import {
  locales,
  LocaleTag,
  withLocalePreferences,
  withSiteLocalePath
} from '@/lib/locales'
import {getPreferredCardLanguage} from '@/lib/siteLocale.server'
import {cn} from '@/lib/utils'
import {LogInIcon} from 'lucide-react'
import Link from 'next/link'
import {Fragment} from 'react/jsx-runtime'
import ComingSoon from '../comingsoon/ComingSoon'
import SiteLanguageSwitcher from '../languageswitcher/SiteLanguageSwitcher'
import CardLanguagePreferenceSwitcher from '../languageswitcher/CardLanguagePreferenceSwitcher'
import ThemeToggle from '../toggles/ThemeToggle'
import {Button} from '../ui/button'

const fetchHeaderData = async (locale: LocaleTag) =>
  await cms.first({
    workspace: 'main',
    root: 'general',
    preferredLocale: locale,
    type: HeaderSchema
  })

const Header: React.FC<{locale: LocaleTag}> = async ({locale}) => {
  const headerData = await fetchHeaderData(locale)
  const messages = getMessages(locale)
  const cardLanguage = await getPreferredCardLanguage()
  const links = headerData?.links?.length
    ? headerData.links
    : [
        {
          _id: 'fallback-home',
          href: '/',
          title: messages.home,
          fields: {hideOnMobile: true, asButton: false}
        },
        {
          _id: 'fallback-illustrators',
          href: '/illustrators',
          title: messages.illustrators,
          fields: {hideOnMobile: false, asButton: false}
        },
        {
          _id: 'fallback-pokemon',
          href: `/collections/pokemon/${locales[cardLanguage].route}`,
          title: 'Pokémon',
          fields: {hideOnMobile: false, asButton: false}
        }
      ]

  return (
    <header>
      <nav className="border-border bg-background h-16 border-b shadow-sm lg:block">
        <div className="container mx-auto flex h-full items-center justify-between px-6">
          <div className="flex items-center gap-x-4">
            <Link href={withSiteLocalePath('/', locale)} title="collection.cards">
              <Logo width="32" />
            </Link>
          </div>
          <div className="flex items-center gap-x-4">
            <div className="flex items-center gap-x-1">
              {links.map(link => {
                const Component = link.fields.asButton ? Button : Fragment
                const target = 'target' in link ? link.target : undefined
                return (
                  <Component
                    key={link._id}
                    {...(link.fields.asButton ? {asChild: true} : {})}
                  >
                    <Link
                      key={link._id}
                      className={cn(
                        'font-medium text-sm text-muted-foreground hover:bg-primary/5 hover:text-foreground px-2 py-1 md:px-3 md:py-2 rounded-md',
                        link.fields.hideOnMobile ? 'hidden md:inline' : ''
                      )}
                      href={withLocalePreferences(link.href, locale, cardLanguage)}
                      target={target}
                      rel={
                        target === '_blank' ? 'noopener noreferrer' : undefined
                      }
                    >
                      {('title' in link.fields
                        ? link.fields.title
                        : undefined) || link.title}
                    </Link>
                  </Component>
                )
              })}
            </div>
          </div>
          <div className="flex items-center gap-x-2 md:gap-x-4">
            <SiteLanguageSwitcher />
            <CardLanguagePreferenceSwitcher language={cardLanguage} />
            <ThemeToggle />
            <ComingSoon text={messages.comingSoon}>
              <Button className="cursor-pointer" aria-labelledby="loginlabel">
                <LogInIcon />
                <span className="hidden md:inline" id="loginlabel">
                  {messages.login}
                </span>
              </Button>
            </ComingSoon>
          </div>
        </div>
      </nav>
    </header>
  )
}

export default Header
