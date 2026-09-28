import Glare from '@/components/glare/Glare'
import {cn} from '@/lib/utils'

const HolofoilTinsel: React.FC = () => {
  return (
    <>
      <div
        style={
          {
            '--tinsel':
              'repeating-linear-gradient(0deg,transparent 0 5px,rgba(255,255,255,.75) 6px,transparent 7px 14px)',
            '--tinsel-size': '100% 14px',
            '--shine-size': '220% 600%'
          } as React.CSSProperties
        }
        className={cn(
          'holofoil-tinsel absolute inset-0 w-full h-full z-1',
          'backface-hidden [contain:paint]',
          'mix-blend-color-dodge',
          'mask-[var(--mask)] mask-luminance mask-center mask-cover',
          'will-change-[background-position,background-image,filter,opacity]',
          'opacity-75 group-hover/card:opacity-100',
          'filter-[brightness(calc(.55+var(--pointer-from-center)*.9))_contrast(2.1)_saturate(.9)]',
          'bg-repeat-[no-repeat,repeat-y,repeat,no-repeat]',
          'bg-size-[cover,var(--tinsel-size),300%_300%,cover]',
          'bg-position-[center,center,var(--pointer-x)_var(--pointer-y),center]',
          '[background-blend-mode:soft-light,screen,hue,multiply]',
          `[background-image:var(--foil),var(--tinsel),linear-gradient(-45deg,var(--holo)),radial-gradient(farthest-corner_circle_at_var(--pointer-x)_var(--pointer-y),hsla(0,0%,0%,0.05)_10%,hsla(0,0%,0%,0.35)_70%,hsla(0,0%,0%,0.6)_120%)]`,
          'before:absolute before:inset-0 before:content-[""]',
          'before:backface-hidden before:mask-[var(--mask)] before:mask-luminance before:mask-center before:mask-cover',
          'before:mix-blend-overlay',
          'before:opacity-[calc(.25+var(--pointer-from-center)*.45)]',
          'before:will-change-[background-position,opacity]',
          'before:bg-repeat-y',
          'before:bg-size-[var(--tinsel-size)]',
          'before:bg-position-[0%_calc(((var(--background-y)/12)*-1.2)+10px)]',
          `before:[background-image:var(--tinsel)]`
        )}
      />
      <Glare
        className={cn(
          '[background-image:radial-gradient(farthest-corner_circle_at_var(--pointer-x)_var(--pointer-y),hsla(0,0%,100%,.9)_0%,hsla(210,30%,70%,.55)_35%,hsla(210,40%,15%,.9)_120%)]',
          'bg-cover mix-blend-overlay',
          'filter-[brightness(1.15)_contrast(1.25)_saturate(1)]'
        )}
      />
    </>
  )
}

export default HolofoilTinsel
