'use client'

import {ChevronRight} from 'lucide-react'
import Link from 'next/link'
import {Fragment, memo} from 'react'
import {useSiteI18n} from '../sitei18n/SiteI18nProvider'
import {withSiteLocalePath} from '@/lib/locales'

type EvolutionsProps = {
  evolvesFrom?: {title: string; path: string}[] | null
  evolvesTo?: {title: string; path: string}[] | null
  evolvesAfterTo?: {title: string; path: string}[] | null
  currentPokemonTitle: string
}

const Evolutions: React.FC<EvolutionsProps> = ({
  evolvesFrom,
  evolvesTo,
  evolvesAfterTo,
  currentPokemonTitle
}) => {
  const {locale, messages} = useSiteI18n()
  const isEvolvingFrom = evolvesFrom && evolvesFrom.length > 0
  const isEvolvingTo = evolvesTo && evolvesTo.length > 0
  const isEvolvingAfterTo = evolvesAfterTo && evolvesAfterTo.length > 0

  if (!isEvolvingFrom && !isEvolvingTo) return null

  return (
    <div className="flex flex-col gap-1 sm:ml-auto w-full sm:w-auto text-left sm:text-right">
      <p className="font-normal text-xs text-muted-foreground">
        {messages.evolution}
      </p>
      <ol className="flex flex-wrap items-center gap-1.5 text-sm sm:justify-end">
        {isEvolvingFrom &&
          evolvesFrom.map((from, index) => {
            if (!from || !from.path) return null
            return (
              <Fragment key={index}>
                <li className="inline-flex items-center gap-1.5">
                  <Link
                    href={withSiteLocalePath(from.path, locale)}
                    className="transition-colors hover:text-muted-foreground"
                  >
                    {from.title}
                  </Link>
                </li>
                <li
                  aria-hidden="true"
                  role="presentation"
                  className="text-muted-foreground"
                >
                  <ChevronRight
                    className="lucide lucide-chevron-right"
                    size={16}
                  />
                </li>
              </Fragment>
            )
          })}
        <span className="text-muted-foreground">{currentPokemonTitle}</span>
        {isEvolvingTo && (
          <li
            aria-hidden="true"
            role="presentation"
            className="text-muted-foreground"
          >
            <ChevronRight className="lucide lucide-chevron-right" size={16} />
          </li>
        )}
        {isEvolvingTo && (
          <li className="flex flex-wrap gap-x-1">
            {evolvesTo.map((to, index) => {
              return (
                <span
                  key={to.path}
                  className="text-muted-foreground whitespace-nowrap"
                >
                  <Link
                    href={withSiteLocalePath(to.path, locale)}
                    className="transition-colors text-foreground hover:text-muted-foreground"
                  >
                    {to.title}
                  </Link>
                  {index < evolvesTo.length - 1
                    ? index < evolvesTo.length - 2
                      ? ', '
                      : ` ${messages.and} `
                    : ''}
                </span>
              )
            })}
          </li>
        )}
        {isEvolvingAfterTo && (
          <li
            aria-hidden="true"
            role="presentation"
            className="text-muted-foreground"
          >
            <ChevronRight className="lucide lucide-chevron-right" size={16} />
          </li>
        )}
        {isEvolvingAfterTo && (
          <li className="flex flex-wrap gap-x-1">
            {evolvesAfterTo.map((to, index) => {
              return (
                <span
                  key={to.path}
                  className="text-muted-foreground whitespace-nowrap"
                >
                  <Link
                    href={withSiteLocalePath(to.path, locale)}
                    className="transition-colors text-foreground hover:text-muted-foreground"
                  >
                    {to.title}
                  </Link>
                  {index < evolvesAfterTo.length - 1
                    ? index < evolvesAfterTo.length - 2
                      ? ', '
                      : ` ${messages.and} `
                    : ''}
                </span>
              )
            })}
          </li>
        )}
      </ol>
    </div>
  )
}

export default memo(Evolutions)
