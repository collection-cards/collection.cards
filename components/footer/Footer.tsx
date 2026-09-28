import {Footer as FooterSchema} from '@/alinea/schemas/Footer'
import {cms} from '@/cms'
import {Discord} from '@/icons/Discord'
import {GitHub} from '@/icons/GitHub'
import {Logo} from '@/icons/Logo'
import {Reddit} from '@/icons/Reddit'
import {getMessages} from '@/lib/i18n'
import {LocaleTag, withLocalePreferences} from '@/lib/locales'
import {getPreferredCardLanguage} from '@/lib/siteLocale.server'
import {cn} from '@/lib/utils'
import {RichText} from 'alinea/ui'
import Link from 'next/link'
import Container from '../container/Container'

const fetchFooterData = async (locale: LocaleTag) =>
  await cms.first({
    workspace: 'main',
    root: 'general',
    preferredLocale: locale,
    type: FooterSchema
  })

const getColumnsClassName = (numColumns: number) => {
  switch (numColumns) {
    case 1:
      return 'grid-cols-1'
    case 2:
      return 'grid-cols-1 md:grid-cols-2'
    case 3:
      return 'grid-cols-1 md:grid-cols-3'
    case 4:
      return 'grid-cols-1 sm:grid-cols-2 md:grid-cols-4'
    default:
      return 'grid-cols-1 md:grid-cols-3'
  }
}

const Footer: React.FC<{locale: LocaleTag}> = async ({locale}) => {
  const footerData = await fetchFooterData(locale)
  const messages = getMessages(locale)
  const cardLanguage = await getPreferredCardLanguage()
  if (!footerData) return null

  return (
    <footer
      className="bg-background text-sm pb-8 pt-24"
      role="contentinfo"
      aria-label={messages.siteFooter}
    >
      <Container className="flex flex-col gap-8 items-center md:items-start">
        <div
          className={cn(
            'grid gap-12 text-center items-center lg:items-start lg:gap-6 lg:text-left w-full justify-items-center lg:justify-items-stretch',
            getColumnsClassName(footerData.columns.length + 1)
          )}
        >
          <Logo
            width="50"
            className="self-end"
            aria-label="collection.cards logo"
          />
          {footerData.columns.map(column => (
            <div
              className="flex flex-col gap-4 justify-between"
              key={column._id}
            >
              <div className="flex flex-col gap-4">
                <h2 className="text-foreground text-base font-medium">
                  {column.title}
                </h2>
                <nav
                  className="flex gap-4 justify-center lg:justify-start content-center flex-col"
                  aria-label={`${column.title} links`}
                >
                  {column.items.map(item => {
                    switch (item._type) {
                      case 'Icons':
                        return (
                          <div
                            key={item._id}
                            className="flex gap-4 justify-center lg:justify-start content-center w-full flex-row"
                          >
                            {item.links.map(iconLink => {
                              const href = iconLink.href || '#'
                              const iconType = iconLink.fields.icon
                              let IconComponent
                              switch (iconType) {
                                case 'discord':
                                  IconComponent = Discord
                                  break
                                case 'github':
                                  IconComponent = GitHub
                                  break
                                case 'reddit':
                                  IconComponent = Reddit
                                  break
                                default:
                                  return null
                              }
                              return (
                                <Link
                                  key={iconLink._id}
                                  href={href}
                                  target="_blank"
                                  aria-label={
                                    iconType === 'github'
                                      ? 'GitHub'
                                      : iconType === 'discord'
                                        ? 'Discord'
                                        : 'Reddit'
                                  }
                                  rel="noopener noreferrer"
                                  className="text-muted-foreground hover:text-foreground transition-colors"
                                >
                                  <IconComponent width={24} />
                                </Link>
                              )
                            })}
                          </div>
                        )
                      case 'Link':
                        return (
                          <Link
                            key={item._id}
                            href={withLocalePreferences(
                              item.link?.href || '#',
                              locale,
                              cardLanguage
                            )}
                            target={
                              item.link?._type === 'url'
                                ? item.link.target
                                : undefined
                            }
                            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                          >
                            {item.link?.fields.title ||
                              item.link?.title ||
                              'Untitled'}
                          </Link>
                        )
                      case 'Text':
                        return (
                          <div
                            key={item._id}
                            className="text-sm text-muted-foreground [&_a]:font-medium [&_a]:text-foreground [&_a:hover]:underline"
                          >
                            <RichText doc={item.text} />
                          </div>
                        )
                      default:
                        return null
                    }
                  })}
                </nav>
              </div>
            </div>
          ))}
        </div>
        <div
          data-orientation="horizontal"
          role="presentation"
          data-slot="separator"
          className="bg-border shrink-0 data-[orientation=horizontal]:h-px data-[orientation=horizontal]:w-full data-[orientation=vertical]:h-full data-[orientation=vertical]:w-px"
        />
        <div className="flex flex-col gap-12 text-center lg:flex-row lg:items-end lg:justify-between lg:text-left w-full lg:items-start">
          <div className="text-muted-foreground text-center lg:text-left leading-relaxed order-2 lg:order-1">
            <p>{footerData.copyright}</p>
            <RichText doc={footerData.disclaimer} />
          </div>
          <nav
            className="order-1 flex flex-col items-center gap-2 text-center lg:order-2 lg:flex-row lg:items-start lg:gap-8 lg:text-left"
            aria-label={messages.legalLinks}
          >
            {footerData.legal_links.map(link => (
              <Link
                key={link._id}
                className="text-muted-foreground hover:text-foreground text-center transition-colors md:text-left whitespace-nowrap"
                href={withLocalePreferences(link.href, locale, cardLanguage)}
              >
                {link.title}
              </Link>
            ))}
          </nav>
        </div>
      </Container>
    </footer>
  )
}

export default Footer
