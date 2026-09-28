import Glare from '@/components/glare/Glare'
import {cn} from '@/lib/utils'

const HolofoilIllustrationRare: React.FC = () => {
  return (
    <>
      <div
        style={
          {
            '--space': '5%',
            '--angle': '133deg',
            '--imgsize': '500px',
            '--clip':
              'polygon(94.8% 2.8%, 95.7% 3.2%, 96.2% 3.8%, 96.2% 96%, 95.9% 96.8%, 94.8% 97.3%, 5% 97.3%, 4.2% 96.9%, 3.8% 96.2%, 3.8% 6.1%, 15% 6.1%, 16% 5%, 17.9% 4%, 19% 2.8%)'
          } as React.CSSProperties
        }
        className={cn(
          'holofoil-illustration-rare absolute w-full h-full z-1',
          '[contain:paint] backface-hidden',
          'mix-blend-color-dodge',
          'will-change-[background-position]',
          'filter-[brightness(.8)_contrast(2.95)_saturate(.65)]',
          'mask-[var(--mask)] mask-luminance mask-center mask-cover',
          'bg-position-[center,0%_var(--background-y),_var(--background-x)_var(--background-y),var(--background-x)_var(--background-y)]',
          'bg-size-[var(--imgsize)_100%,200%_700%,300%_100%,200%_100%]',
          '[background-blend-mode:screen,hue,hard-light]',
          '[background-image:repeating-linear-gradient(0deg,var(--sunpillar-1)_calc(var(--space)*1),var(--sunpillar-2)_calc(var(--space)*2),var(--sunpillar-3)_calc(var(--space)*3),var(--sunpillar-4)_calc(var(--space)*4),var(--sunpillar-5)_calc(var(--space)*5),var(--sunpillar-6)_calc(var(--space)*6),var(--sunpillar-1)_calc(var(--space)*7)),repeating-linear-gradient(var(--angle),#0e152e_0%,hsl(180,_10%,_60%)_3.8%,hsl(180,_29%,_66%)_4.5%,hsl(180,_10%,_60%)_5.2%,#0e152e_10%,#0e152e_12%),radial-gradient(farthest-corner_circle_at_var(--pointer-x)_var(--pointer-y),hsla(0,_0%,_0%,_0.1)_12%,hsla(0,_0%,_0%,_0.15)_20%,hsla(0,_0%,_0%,_0.25)_120%)]',
          '[clip-path:var(--clip)]',
          'after:absolute',
          'after:inset-0',
          'after:backface-hidden',
          'after:mask-luminance',
          'after:mask-center',
          'after:mask-cover',
          'after:mask-[var(--mask)]',
          'after:will-change-[background-position]',
          'after:[background-blend-mode:screen,hue,hard-light]',
          'after:[background-image:repeating-linear-gradient(0deg,var(--sunpillar-6)_calc(var(--space)*1),var(--sunpillar-1)_calc(var(--space)*2),var(--sunpillar-2)_calc(var(--space)*3),var(--sunpillar-3)_calc(var(--space)*4),var(--sunpillar-4)_calc(var(--space)*5),var(--sunpillar-5)_calc(var(--space)*6),var(--sunpillar-6)_calc(var(--space)*7)),repeating-linear-gradient(var(--angle),#0e152e_0%,hsl(180,_10%,_60%)_3.8%,hsl(180,_29%,_66%)_4.5%,hsl(180,_10%,_60%)_5.2%,#0e152e_10%,#0e152e_12%),radial-gradient(farthest-corner_circle_at_var(--pointer-x)_var(--pointer-y),hsla(0,_0%,_0%,_0.1)_12%,hsla(0,_0%,_0%,_0.15)_20%,hsla(0,_0%,_0%,_0.25)_120%)]',
          'after:[clip-path:var(--clip)]',
          'after:mix-blend-soft-light',
          'after:filter-[brightness(1)_contrast(2.5)_saturate(1.75)]',
          'after:bg-size-[var(--imgsize)_100%,_200%_400%,_195%_100%,_200%_100%]',
          'after:bg-position-[center,0%_var(--background-y),calc(var(--background-x)_*_-1)_calc(var(--background-y)_*_-1),var(--background-x)_var(--background-y)]'
        )}
      />
      <Glare />
    </>
  )
}

export default HolofoilIllustrationRare
