import {Badge} from '@/components/ui/badge'
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
import {ImageLink, TextDoc} from 'alinea'
import {RichText} from 'alinea/ui'
import Image from 'next/image'
import Link from 'next/link'
import {Title} from '../title/Title'

type SetCardProps = {
  date: string
  href: string
  image: ImageLink<undefined>
  numberOfTotalCards: number
  priority: boolean
  subTitle: string
  symbol?: ImageLink<undefined>
  text: TextDoc
  title: string
}

const SetCard: React.FC<SetCardProps> = ({
  date,
  href,
  image,
  numberOfTotalCards,
  priority,
  subTitle,
  symbol,
  text,
  title
}) => (
  <Link href={href} className="group h-full">
    <Card className="py-0 gap-0 overflow-hidden xl:flex-row shadow-none transition-shadow duration-300 h-full group-hover:shadow-md">
      {image?.src && (
        <CardContent className="relative min-h-55 max-xl:max-h-55 xl:w-66 overflow-hidden">
          <Image
            className="group-hover:scale-120 transition-transform duration-300 ease-in-out"
            alt={title}
            blurDataURL={
              image?.thumbHash ? blurDataURL(image.thumbHash) : undefined
            }
            src={`/media${image?.src}`}
            fill={true}
            placeholder="blur"
            fetchPriority={priority ? 'high' : 'auto'}
            preload={priority}
            sizes="100vw"
            style={{
              backgroundColor: image?.averageColor,
              objectFit: 'cover',
              transform: 'scale(1.2)',
              transformOrigin: image?.focus
                ? `${image.focus.x * 100}% ${image.focus.y * 100}%`
                : undefined,
              objectPosition: image?.focus
                ? `${image.focus.x * 100}% ${image.focus.y * 100}%`
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
              {symbol && (
                <div className="relative w-8 h-8">
                  <Image
                    alt={title}
                    src={`/media${symbol?.src}`}
                    fill={true}
                    sizes="32px"
                    style={{
                      objectFit: 'contain',
                      objectPosition: symbol?.focus
                        ? `${symbol.focus.x * 100}% ${symbol.focus.y * 100}%`
                        : undefined
                    }}
                  />
                </div>
              )}
            </div>
            <div className="text-muted-foreground italic">{subTitle}</div>
          </div>
          <CardDescription className="text-base">
            <RichText doc={text} />
          </CardDescription>
        </CardHeader>
        <CardFooter className="mx-6 gap-3 border-t border-dashed px-0 !pt-5 pb-6">
          <Badge
            variant="outline"
            className="rounded-full p-1 pr-2 text-muted-foreground"
          >
            <div className="size-6 rounded-full flex items-center justify-center text-muted-foreground bg-primary/10 mr-1">
              <IcOutlineCalendarMonth />
            </div>
            {date}
          </Badge>
          <Badge
            variant="outline"
            className="rounded-full p-1 pr-2 text-muted-foreground"
          >
            <div className="size-6 rounded-full flex items-center justify-center text-muted-foreground bg-primary/10 mr-1">
              <IcOutlineNumbers />
            </div>
            {`${numberOfTotalCards} card${numberOfTotalCards !== 1 ? 's' : ''}`}
          </Badge>
        </CardFooter>
      </div>
    </Card>
  </Link>
)

export default SetCard
