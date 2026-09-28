import {CardType} from '@/consts/cardtype'
import {Energy} from '@/consts/energy'
import {Pattern} from '@/consts/pattern'
import {Rarity} from '@/consts/rarity'
import {Variant} from '@/consts/variant'
import {cn} from '@/lib/utils'
import Image from 'next/image'
import {memo} from 'react'
import Glare from '../glare/Glare'
import Holofoil from './effects/Holofoil'
import HolofoilBlackWhiteRare from './effects/HolofoilBlackWhiteRare'
import HolofoilDoubleRare from './effects/HolofoilDoubleRare'
import HolofoilIllustrationRare from './effects/HolofoilIllustrationRare'
import HolofoilMegaHyperRare from './effects/HolofoilMegaHyperRare'
import HolofoilSpecialIllustrationRare from './effects/HolofoilSpecialIllustrationRare'
import HolofoilTinsel from './effects/HolofoilTinsel'
import HolofoilUltraRare from './effects/HolofoilUltraRare'
import ReverseHolofoil from './effects/Reverseholofoil'
import ReverseHolofoilMasterBall from './effects/ReverseHolofoilMasterBall'
import ReverseHolofoilPokeBall from './effects/ReverseHolofoilPokeBall'

export type CardProps = {
  asButton?: boolean
  blurDataURL?: string
  cardtype: CardType | null
  className?: string
  energy: Energy | null
  edgeColor?: string
  focus?: {x: number; y: number}
  foil?: string
  glowColor?: string
  hp: number | null
  id: string
  isActive?: boolean
  isEx: boolean
  isFullArt: boolean
  isTrainerGallery: boolean
  mask?: string
  onClick?: () => void
  pattern?: Pattern
  rarity: Rarity | null
  sizes: string
  src?: string
  style?: React.CSSProperties
  title: string
  variant: Variant
}

const Card: React.FC<CardProps> = ({
  asButton,
  blurDataURL,
  className,
  edgeColor,
  focus,
  foil,
  glowColor,
  isActive,
  isEx,
  mask,
  onClick,
  pattern,
  rarity,
  sizes,
  src,
  style,
  title,
  variant
}) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let Effect: React.FC<any> = Glare
  let effectProps = {}
  switch (variant) {
    case 'holofoil':
      switch (pattern) {
        case 'tinsel':
          Effect = HolofoilTinsel
          break
        default:
          switch (rarity) {
            case 'illustration-rare':
              Effect = HolofoilIllustrationRare
              break
            case 'special-illustration-rare':
              Effect = HolofoilSpecialIllustrationRare
              break
            case 'ultra-rare':
              Effect = HolofoilUltraRare
              break
            case 'double-rare':
              Effect = HolofoilDoubleRare
              break
            case 'black-white-rare':
              Effect = HolofoilBlackWhiteRare
              effectProps = {radial: !isEx}
              break
            case 'mega-hyper-rare':
              Effect = HolofoilMegaHyperRare
              effectProps = {radial: !isEx}
              break
            default:
              Effect = Holofoil
              break
          }
      }
      break
    case 'reverse_holofoil':
      switch (pattern) {
        case 'masterBall':
          Effect = ReverseHolofoilMasterBall
          break
        case 'pokeBall':
          Effect = ReverseHolofoilPokeBall
          break
        default:
          Effect = ReverseHolofoil
      }
      break
    default:
      Effect = Glare
  }

  const Container = asButton ? 'button' : 'div'

  return (
    <Container
      className={cn(
        'group/card',
        'relative w-full overflow-hidden rounded-[4.15%/2.98%] flex items-center justify-center aspect-[733/1024]',
        'shadow-lg',
        glowColor
          ? 'hover:shadow-[0_0_3px_-1px_rgba(0,0,0,0),0_0_2px_1px_var(--card-edge),0_0_5px_var(--card-glow),0_10px_20px_-5px_#000,0_2px_15px_-5px_var(--card-glow),0_0_20px_var(--card-glow)]'
          : undefined,
        glowColor
          ? 'focus:shadow-[0_0_3px_-1px_rgba(0,0,0,0),0_0_2px_1px_var(--card-edge),0_0_5px_var(--card-glow),0_10px_20px_-5px_#000,0_2px_15px_-5px_var(--card-glow),0_0_20px_var(--card-glow)]'
          : undefined,
        isActive && glowColor
          ? 'shadow-[0_0_3px_-1px_rgba(0,0,0,0),0_0_2px_1px_var(--card-edge),0_0_5px_var(--card-glow),0_10px_20px_-5px_#000,0_2px_15px_-5px_var(--card-glow),0_0_20px_var(--card-glow)]'
          : undefined,
        'focus:outline-1 md:focus:outline-2 focus:outline-solid focus:outline-[var(--card-glow)]',
        isActive && glowColor
          ? 'outline-1 md:outline-2 outline-solid outline-[var(--card-glow)]'
          : undefined,
        onClick ? 'cursor-pointer' : null,
        className
      )}
      onClick={onClick}
      style={
        {
          '--card-edge': edgeColor,
          '--card-glow': glowColor || 'black',
          '--foil': foil
            ? `url(/_next/image?url=%2Fmedia${foil}&w=750&q=75)`
            : undefined,
          '--mask': mask
            ? `url(/_next/image?url=%2Fmedia${mask}&w=750&q=75)`
            : undefined,
          '--ring': glowColor || 'black',
          ...style
        } as React.CSSProperties
      }
    >
      <div className="relative w-full h-full">
        {src && (
          <Image
            alt={title}
            blurDataURL={blurDataURL}
            fetchPriority="high"
            fill={true}
            placeholder="blur"
            preload={true}
            src={src}
            style={{
              backgroundColor: edgeColor,
              objectFit: 'contain',
              objectPosition: focus
                ? `${focus.x * 100}% ${focus.y * 100}%`
                : undefined
            }}
            sizes={sizes}
          />
        )}
        <Effect {...effectProps} />
      </div>
    </Container>
  )
}

export default memo(Card)
