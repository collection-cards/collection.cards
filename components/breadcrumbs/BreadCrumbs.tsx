import {HomeIcon} from 'lucide-react'

import {cms} from '@/cms'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator
} from '@/components/ui/breadcrumb'
import {Query} from 'alinea'
import Link from 'next/link'
import {Fragment} from 'react/jsx-runtime'
import Container from '../container/Container'
import {getMessages} from '@/lib/i18n'
import {withSiteLocalePath} from '@/lib/locales'
import {getSiteLocale} from '@/lib/siteLocale.server'

type breadcrumbsProps = {className?: string; path: string}

const fetchBreadCrumbsData = async (url: string) =>
  await cms.first({
    select: {
      title: Query.title,
      breadcrumbs: Query.parents({
        select: {
          url: Query.url,
          title: Query.title
        }
      })
    },
    filter: {
      _url: url
    }
  })

const BreadCrumbs: React.FC<breadcrumbsProps> = async ({className, path}) => {
  const data = await fetchBreadCrumbsData(path)
  if (!data || !data.breadcrumbs) return null
  const locale = await getSiteLocale()
  const messages = getMessages(locale)
  const localizedLabels: Record<string, string> = {
    Home: messages.home,
    Collections: messages.collections,
    Illustrators: messages.illustrators,
    Pokedex: messages.pokedex,
    'Pokédex': messages.pokedex
  }
  const label = (title: string) => localizedLabels[title] ?? title

  return (
    <Container className={className}>
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild={true}>
              <Link href={withSiteLocalePath('/', locale)}>
                <HomeIcon size={16} aria-hidden="true" />
                <span className="sr-only">{messages.home}</span>
              </Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          {data.breadcrumbs.map(crumb => (
            <Fragment key={crumb.url}>
              <BreadcrumbItem>
                <BreadcrumbLink asChild={true}>
                  <Link href={withSiteLocalePath(crumb.url, locale)}>
                    {label(crumb.title)}
                  </Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
            </Fragment>
          ))}
          <BreadcrumbItem>
            <BreadcrumbPage>{label(data.title)}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
    </Container>
  )
}

export default BreadCrumbs
