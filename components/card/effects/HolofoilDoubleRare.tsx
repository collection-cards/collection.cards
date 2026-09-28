import Glare from '@/components/glare/Glare'
import {cn} from '@/lib/utils'
import Stars from './Stars'

const HolofoilDoubleRare: React.FC = () => {
  return (
    <>
      <div
        style={
          {
            '--space': '5%',
            '--angle': '133deg',
            '--imgsize': '200px'
          } as React.CSSProperties
        }
        className={cn(
          'holofoil-double-rare absolute w-full h-full z-1',
          '[contain:paint] backface-hidden',
          'mix-blend-color-dodge',
          'filter-[brightness(.45)_contrast(1.5)_saturate(1.2)]',
          'mask-[var(--mask)] mask-luminance mask-center mask-cover',
          'before:absolute',
          'before:inset-0',
          'before:backface-hidden',
          'before:mask-luminance',
          'before:mask-center',
          'before:mask-cover',
          'before:mask-[var(--mask)]',
          'before:mix-blend-lighten',
          'before:filter-[brightness(1)_contrast(1.5)_saturate(2)]',
          'before:bg-position-[center,_0%_var(--background-y),_var(--background-x)_var(--background-y),_var(--background-x)_var(--background-y)]',
          'before:[background-size:var(--imgsize)_var(--imgsize),_200%_700%,_300%_100%,_200%_100%]',
          'before:[background-blend-mode:screen,hue,hard-light]',
          'before:[background-image:repeating-linear-gradient(0deg,var(--sunpillar-5)_calc(var(--space)*1),var(--sunpillar-6)_calc(var(--space)*2),var(--sunpillar-1)_calc(var(--space)*3),var(--sunpillar-2)_calc(var(--space)*4),var(--sunpillar-3)_calc(var(--space)*5),var(--sunpillar-4)_calc(var(--space)*6),var(--sunpillar-5)_calc(var(--space)*7)),repeating-linear-gradient(var(--angle),#0e1221_0%,hsl(180,_10%,_60%)_2.8%,hsl(180,_20.9%,_82.2%)_3.5%,hsl(180,_10%,_60%)_4.2%,#0e1221_7%,#0e1221_12%),radial-gradient(farthest-corner_circle_at_var(--pointer-x)_var(--pointer-y),hsla(0,_0%,_0%,_0.1)_12%,hsla(0,_0%,_0%,_0.15)_20%,hsla(0,_0%,_0%,_0.25)_120%)]',
          'will-change-[background-position]',
          'after:absolute',
          'after:inset-0',
          'after:backface-hidden',
          'after:mask-luminance',
          'after:mask-center',
          'after:mask-cover',
          'after:mask-[var(--mask)]',
          'after:[background-blend-mode:screen,hue,hard-light]',
          'after:[background-image:repeating-linear-gradient(0deg,var(--sunpillar-6)_calc(var(--space)*1),var(--sunpillar-1)_calc(var(--space)*2),var(--sunpillar-2)_calc(var(--space)*3),var(--sunpillar-3)_calc(var(--space)*4),var(--sunpillar-4)_calc(var(--space)*5),var(--sunpillar-5)_calc(var(--space)*6),var(--sunpillar-6)_calc(var(--space)*7)),repeating-linear-gradient(var(--angle),#0e1221_0%,hsl(180,_10%,_60%)_2.8%,hsl(180,_20.9%,_82.2%)_3.5%,hsl(180,_10%,_60%)_4.2%,#0e1221_7%,#0e1221_12%),radial-gradient(farthest-corner_circle_at_var(--pointer-x)_var(--pointer-y),hsla(0,_0%,_0%,_0.1)_12%,hsla(0,_0%,_0%,_0.15)_20%,hsla(0,_0%,_0%,_0.25)_120%)]',
          'after:mix-blend-difference',
          'after:filter-[brightness(1.2)_contrast(1)_saturate(2)]',
          'after:[background-size:var(--imgsize)_100%,_200%_400%,_195%_100%,_200%_100%]',
          'after:bg-position-[center,_0%_var(--background-y),calc(var(--background-x)_*_-1)_calc(var(--background-y)_*_-1),var(--background-x)_var(--background-y)]',
          'after:will-change-[background-position]'
        )}
      />
      <Stars />
      <Glare />
    </>
  )
}

export default HolofoilDoubleRare
