'use client'

import {PokemonCard} from '@/alinea/schemas/PokemonCard'
import {Energy, energy as energyList, getEnergyIcon} from '@/consts/energy'
import {holofoilPatterns, reverseHolofoilPatterns} from '@/consts/pattern'
import {variant, variantPattern} from '@/consts/variant'
import {EntryLink} from 'alinea'
import {AnimatePresence, motion} from 'framer-motion'
import {CatIcon, ChevronRight, PaletteIcon, Sparkles} from 'lucide-react'
import Link from 'next/link'
import {createElement, useState} from 'react'
import ComingSoon from '../comingsoon/ComingSoon'
import {useSiteI18n} from '../sitei18n/SiteI18nProvider'
import {withSiteLocalePath} from '@/lib/locales'
import {Title} from '../title/Title'
import {Button} from '../ui/button'
import {Label} from '../ui/label'

export type PokemonCardDetailsProps = {
  collectorNumber?: string | null
  energy: Energy | null
  id: string
  illustrator?: EntryLink<undefined>
  number: string
  pattern?: keyof typeof reverseHolofoilPatterns | keyof typeof holofoilPatterns
  pokemon: PokemonCard['pokemon']
  printingId?: string
  regulationMark?: string | null
  resistance?: string | null
  retreat?: number | null
  rulesText?: PokemonCard['rulesText']
  serie: {title: string; url: string}
  set: {title: string; url: string}
  title: string
  variant: keyof typeof variant
  weakness?: string | null
}

export default function PokemonCardDetails({
  nextHandler,
  prevHandler,
  collectorNumber,
  energy,
  id,
  illustrator,
  number,
  pattern,
  pokemon,
  regulationMark,
  resistance,
  retreat,
  rulesText,
  serie,
  set,
  title,
  variant,
  weakness
}: PokemonCardDetailsProps & {
  nextHandler?: () => void
  prevHandler?: () => void
}) {
  const {messages, locale} = useSiteI18n()
  const [direction, setDirection] = useState<number>(0)

  const handleNext = () => {
    setDirection(1)
    nextHandler?.()
  }

  const handlePrev = () => {
    setDirection(-1)
    prevHandler?.()
  }

  const variants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 50 : -50,
      opacity: 0
    }),
    center: {
      x: 0,
      opacity: 1
    },
    exit: (direction: number) => ({
      x: direction > 0 ? -50 : 50,
      opacity: 0
    })
  }

  return (
    <div className="relative overflow-hidden h-full flex flex-col justify-between">
      <AnimatePresence initial={false} custom={direction} mode="wait">
        <motion.div
          key={id}
          custom={direction}
          variants={variants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{
            x: {type: 'spring', stiffness: 800, damping: 60},
            opacity: {duration: 0.15},
            duration: 0.15,
            ease: 'easeOut'
          }}
        >
          <div className="flex flex-col gap-1 pb-4">
            <Title.H2 className="pb-0">
              {title}{' '}
              <span className="ml-2 text-gray-400 dark:text-gray-300/75 font-normal text-sm">
                # {number}
              </span>
            </Title.H2>
            <ol className="flex flex-wrap items-center gap-1.5 text-sm break-words">
              <li>
                <Link
                  href={withSiteLocalePath(serie.url, locale)}
                  className="transition-colors text-sm hover:text-muted-foreground"
                >
                  {serie.title}
                </Link>
              </li>
              <li
                aria-hidden="true"
                role="presentation"
                className="text-muted-foreground"
              >
                <ChevronRight size={16} />
              </li>
              <li>
                <Link
                  href={withSiteLocalePath(set.url, locale)}
                  className="transition-colors text-sm hover:text-muted-foreground"
                >
                  {set.title}
                </Link>
              </li>
            </ol>
          </div>
          <p>
            <Label>
              <Sparkles
                className="inline-block mr-2 mb-1"
                size={16}
                aria-label={messages.variantLabel}
              />
              {variantPattern[variant]}
              {pattern && (
                <span className="ml-1.5 text-gray-400 dark:text-gray-300/75 font-normal text-sm italic">
                  {variantPattern[pattern]}
                </span>
              )}
            </Label>
          </p>
          {energy && (
            <p>
              <Label>
                <EnergyIcon energy={energy} />
                {energyList[energy]}
              </Label>
            </p>
          )}
          {pokemon && (
            <p>
              <Label>
                <CatIcon
                  className="inline-block mr-2 mb-1"
                  size={16}
                  aria-label="Pokédex"
                />
                <Link
                  href={withSiteLocalePath(pokemon.href, locale)}
                  className="transition-colors hover:text-muted-foreground"
                >
                  {pokemon.title}
                </Link>
              </Label>
            </p>
          )}
          {illustrator && (
            <p>
              <Label>
                <PaletteIcon
                  className="inline-block mr-2 mb-1"
                  size={16}
                  aria-label={messages.illustrator}
                />
                <Link
                  href={withSiteLocalePath(illustrator.href, locale)}
                  className="transition-colors hover:text-muted-foreground"
                >
                  {illustrator.title}
                </Link>
              </Label>
            </p>
          )}
          {(collectorNumber || regulationMark) && (
            <p className="text-sm text-muted-foreground">
              {[collectorNumber, regulationMark && `${messages.regulation} ${regulationMark}`]
                .filter(Boolean)
                .join(' · ')}
            </p>
          )}
          {(weakness || resistance || retreat != null) && (
            <p className="text-sm text-muted-foreground">
              {[
                weakness && `${messages.weakness}: ${weakness}`,
                resistance && `${messages.resistance}: ${resistance}`,
                retreat !== null && retreat !== undefined
                  ? `${messages.retreat}: ${retreat}`
                  : null
              ]
                .filter(Boolean)
                .join(' · ')}
            </p>
          )}
          {rulesText && rulesText.length > 0 && (
            <div className="mt-4 flex flex-col gap-3 text-sm">
              {rulesText.map(entry => (
                <section key={entry._id}>
                  {(entry.name || entry.damage) && (
                    <p className="font-medium">
                      {[entry.energyCost, entry.name, entry.damage]
                        .filter(Boolean)
                        .join(' · ')}
                    </p>
                  )}
                  {entry.text && (
                    <p className="text-muted-foreground">{entry.text}</p>
                  )}
                </section>
              ))}
            </div>
          )}
          <ComingSoon text={messages.comingSoon}>
            <Button className="mt-4 cursor-pointer">
              {messages.addToCollection}
            </Button>
          </ComingSoon>
        </motion.div>
      </AnimatePresence>

      <div className="flex gap-2 mt-4">
        <Button
          className="m-0 cursor-pointer"
          onClick={handlePrev}
          disabled={!prevHandler}
          variant={'outline'}
        >
          {messages.previous}
        </Button>
        <Button
          className="m-0 cursor-pointer"
          onClick={handleNext}
          disabled={!nextHandler}
          variant={'outline'}
        >
          {messages.next}
        </Button>
      </div>
    </div>
  )
}

const EnergyIcon = ({energy}: {energy: Energy}) => {
  const Icon = getEnergyIcon(energy)
  return createElement(Icon, {
    className: 'inline-block mr-2 mb-1 w-[16px] h-[16px]'
  })
}
