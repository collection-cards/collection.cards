'use client'

import {Badge} from '@/components/ui/badge'
import {useSiteI18n} from '@/components/sitei18n/SiteI18nProvider'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader
} from '@/components/ui/card'
import IcOutlineCalendarMonth from '@/icons/IcOutlineCalendarMonth'
import IcOutlineNumbers from '@/icons/IcOutlineNumbers'
import {blurDataURL} from '@/lib/blurDataURL'
import {getCardCountLabel} from '@/lib/i18n'
import {ImageLink, TextDoc} from 'alinea'
import {RichText} from 'alinea/ui'
import Image from 'next/image'
import Link from 'next/link'
import {useState} from 'react'
import SetSymbol from '../setsymbol/SetSymbol'
import {Title} from '../title/Title'

type SetCardProps = {
  date?: string | null
  href: string
  image?: ImageLink<undefined>
  logo?: ImageLink<undefined>
  numberOfTotalCards: number
  language?: string | null
  priority: boolean
  ptcgoCode?: string | null
  sourceSetKey?: string | null
  subTitle: string
  symbol?: ImageLink<undefined>
  text: TextDoc
  title: string
}

const SLOT_HEIGHT_BELOW_XL = 220
const SLOT_HEIGHT_XL = 600
const XL_SLOT_WIDTH = 264
const HOVER_SCALE = 1.2

const SetCard: React.FC<SetCardProps> = ({
  date,
  href,
  image,
  logo,
  numberOfTotalCards,
  priority,
  ptcgoCode,
  sourceSetKey,
  subTitle,
  symbol,
  text,
  title
}) => {
  const {locale, messages} = useSiteI18n()
  const [heroFailed, setHeroFailed] = useState(false)
  const [logoFailed, setLogoFailed] = useState(false)
  const usesHero = Boolean(image?.src && !heroFailed)
  const visual = usesHero ? image : logoFailed ? undefined : logo
  const aspectRatio =
    visual?.width && visual?.height ? visual.width / visual.height : 1
  const subXlWidth = Math.ceil(SLOT_HEIGHT_BELOW_XL * aspectRatio * HOVER_SCALE)
  const xlWidth = Math.ceil(
    Math.max(XL_SLOT_WIDTH, SLOT_HEIGHT_XL * aspectRatio) * HOVER_SCALE
  )
  const sizes = [
    `(min-width: 1280px) ${xlWidth}px`,
    `(min-width: 640px) max(60vw, ${subXlWidth}px)`,
    `max(120vw, ${subXlWidth}px)`
  ].join(', ')

  return (
    <Link href={href} className="group h-full">
      <Card className="py-0 gap-0 overflow-hidden xl:flex-row shadow-none transition-shadow duration-300 h-full group-hover:shadow-md">
        {visual?.src && (
          <CardContent
            className={`relative min-h-55 max-xl:max-h-55 xl:w-66 overflow-hidden ${
              usesHero ? '' : 'bg-muted/40 p-8'
            }`}
          >
            <Image
              className={
                usesHero
                  ? 'group-hover:scale-120 transition-transform duration-300 ease-in-out'
                  : 'p-8 group-hover:scale-105 transition-transform duration-300 ease-in-out'
              }
              alt={title}
              blurDataURL={
                visual?.thumbHash ? blurDataURL(visual.thumbHash) : undefined
              }
              src={`/media${visual.src}`}
              fill={true}
              placeholder="blur"
              onError={() => {
                if (usesHero) setHeroFailed(true)
                else setLogoFailed(true)
              }}
              fetchPriority={priority ? 'high' : 'auto'}
              preload={priority}
              sizes={sizes}
              style={{
                backgroundColor: visual?.averageColor,
                objectFit: usesHero ? 'cover' : 'contain',
                transform: usesHero ? 'scale(1.2)' : undefined,
                transformOrigin: visual?.focus
                  ? `${visual.focus.x * 100}% ${visual.focus.y * 100}%`
                  : undefined,
                objectPosition: visual?.focus
                  ? `${visual.focus.x * 100}% ${visual.focus.y * 100}%`
                  : undefined
              }}
            />
          </CardContent>
        )}
        <div className="flex grow-1 flex-col justify-between">
          <CardHeader className="gap-5 pt-6 pb-5">
            <div>
              <div className="flex items-center justify-between gap-2">
                <Title.H2 className="pb-0" data-slot="card-title">
                  {title}
                </Title.H2>
                <SetSymbol code={ptcgoCode} symbol={symbol} title={title} />
              </div>
              <div className="text-muted-foreground italic">{subTitle}</div>
              {sourceSetKey && (
                <div className="mt-2 font-mono text-xs uppercase tracking-wide text-muted-foreground">
                  {messages.setId}:{' '}
                  {sourceSetKey}
                </div>
              )}
            </div>
            <CardDescription className="text-base">
              <RichText doc={text} />
            </CardDescription>
          </CardHeader>
          <CardFooter className="mx-6 gap-3 border-t border-dashed px-0 !pt-5 pb-6">
            {date && (
              <Badge
                variant="outline"
                className="rounded-full p-1 pr-2 text-muted-foreground"
              >
                <div className="size-6 rounded-full flex items-center justify-center text-muted-foreground bg-primary/10 mr-1">
                  <IcOutlineCalendarMonth />
                </div>
                {date}
              </Badge>
            )}
            <Badge
              variant="outline"
              className="rounded-full p-1 pr-2 text-muted-foreground"
            >
              <div className="size-6 rounded-full flex items-center justify-center text-muted-foreground bg-primary/10 mr-1">
                <IcOutlineNumbers />
              </div>
              {getCardCountLabel(numberOfTotalCards, locale)}
            </Badge>
          </CardFooter>
        </div>
      </Card>
    </Link>
  )
}

export default SetCard
