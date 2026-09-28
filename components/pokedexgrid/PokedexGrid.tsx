'use client'

import {useWindowVirtualizer} from '@tanstack/react-virtual'
import Link from 'next/link'
import {useEffect, useMemo, useRef, useState} from 'react'
import PokedexIcon from '../pokedexicon/PokedexIcon'
import {useSiteI18n} from '../sitei18n/SiteI18nProvider'
import {withSiteLocalePath} from '@/lib/locales'

type PokedexGridProps = {
  pokedex: {
    number: number | null
    path: string
    title: string
    url: string
  }[]
}

const rowHeight = 124
const rowGap = 48

function getColumnCount(width: number): number {
  if (width < 592) return 2 // mobile
  if (width < 720) return 3 // tablet
  if (width < 976) return 4 // tablet
  return 6 // desktop
}

const PokedexGrid: React.FC<PokedexGridProps> = ({pokedex}) => {
  const {locale} = useSiteI18n()
  const gridRef = useRef<HTMLDivElement>(null)
  const [gridWidth, setGridWidth] = useState(0)


  useEffect(() => {
    const observer = new ResizeObserver(entries => {
      setGridWidth(entries[0].contentRect.width)
    })

    const currentGrid = gridRef.current
    if (currentGrid) {
      observer.observe(currentGrid)
    }

    return () => {
      if (currentGrid) {
        observer.unobserve(currentGrid)
      }
    }
  }, [])

  const columns = useMemo(() => getColumnCount(gridWidth), [gridWidth])
  const rowCount = Math.ceil(pokedex.length / columns)

  const virtualizer = useWindowVirtualizer({
    count: rowCount,
    estimateSize: () => rowHeight + rowGap,
    overscan: 6
  })

  useEffect(() => {
    virtualizer.measure()
  }, [virtualizer, rowCount])

  return (
    <div
      className="relative w-full"
      ref={gridRef}
      style={{height: virtualizer.getTotalSize() - rowGap}}
    >
      {gridWidth !== 0 &&
        virtualizer.getVirtualItems().map(virtualRow => {
          const rowStartIndex = virtualRow.index * columns
          const rowEndIndex = Math.min(rowStartIndex + columns, pokedex.length)

          return (
            <div
              key={virtualRow.key}
              className={`absolute left-0 top-0 flex w-full flex-wrap justify-center gap-12 lg:gap-x-6 lg:gap-y-12 pb-[${rowGap}px]`}
              style={{
                height: rowHeight + rowGap,
                transform: `translateY(${virtualRow.start}px)`
              }}
            >
              {pokedex.slice(rowStartIndex, rowEndIndex).map(p => (
                <Link
                  key={p.path}
                  href={withSiteLocalePath(p.url, locale)}
                  className="group flex flex-col items-center gap-4 text-center w-1/3 sm:w-1/4 md:w-1/5 lg:w-1/7"
                >
                  <div className="flex flex-col items-center gap-4 z-1">
                    <span
                      data-slot="avatar"
                      className="relative flex size-8 shrink-0 h-16 w-16 transition-all"
                    >
                      {p.number && (
                        <PokedexIcon
                          aria-label={p.title}
                          number={p.number}
                          width={64}
                          height={64}
                          className="group-hover:scale-140 transition-transform duration-300 ease-in-out"
                        />
                      )}
                    </span>
                    <div className="flex flex-col">
                      <p className="text-foreground text-base font-semibold">
                        {p.title}
                      </p>
                      <p className="text-muted-foreground text-sm">
                        #{p.number}
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )
        })}
    </div>
  )
}

export default PokedexGrid
