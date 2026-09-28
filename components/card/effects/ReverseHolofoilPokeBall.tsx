import Glare from '@/components/glare/Glare'
import {cn} from '@/lib/utils'

const ReverseHolofoilPokeBall: React.FC = () => {
  return (
    <>
      <div
        style={
          {
            '--seedx': 0.8896912913884358,
            '--seedy': 0.5311618334967552
          } as React.CSSProperties
        }
        className={cn(
          'reverse-holofoil-poke-ball absolute w-full h-full z-1',
          'mix-blend-color-dodge',
          '[background-image:linear-gradient(45deg,hsla(0,0%,calc(0.8*50%))_15%,hsla(0,0%,calc(0.8*25%))_45%,hsla(0,0%,calc(0.8*25%))_55%,hsla(0,0%,calc(0.8*50%))_85%)] [background-position:var(--pointer-x)_var(--pointer-y)]',
          '[filter:brightness(.75)_contrast(1)_saturate(1)]',
          'bg-size-[200%] backface-hidden',
          '[contain:paint]',
          'will-change-[background-position-x,background-position-y]',
          'before:absolute before:inset-0 before:opacity-60 group-hover/card:before:opacity-100',
          'before:mix-blend-lighten before:[filter:brightness(.75)_contrast(2)_saturate(calc(var(--pointer-from-center)))]',
          'before:[background-blend-mode:screen,color-dodge]',
          'before:[background-image:repeating-radial-gradient(circle_at_center,transparent_0_12px,rgba(255,255,255,.8)_13px_15px,transparent_16px_32px),linear-gradient(225deg,var(--sunpillar-4),var(--sunpillar-5),var(--sunpillar-6),var(--sunpillar-1),var(--sunpillar-2),var(--sunpillar-3),var(--sunpillar-4))] before:bg-size-[120px_120px,200%_200%] before:[background-position:calc(var(--seedx)*120px)_calc(var(--seedy)*120px),var(--pointer-y)_var(--pointer-x)]',
          'before:will-change-[opacity]',
          'after:absolute after:inset-0 after:opacity-60 group-hover/card:after:opacity-100 after:[background-image:radial-gradient(farthest-corner_at_var(--pointer-x)_var(--pointer-y),rgba(255,255,255,.8)_0%,transparent_70%),linear-gradient(45deg,var(--sunpillar-4),var(--sunpillar-5),var(--sunpillar-6),var(--sunpillar-1),var(--sunpillar-2),var(--sunpillar-3),var(--sunpillar-4))] after:mix-blend-screen after:[filter:brightness(0.55)_contrast(1.8)_saturate(calc(var(--pointer-from-center)*1.1))] after:bg-size-[cover,200%_200%] after:[background-position:center,var(--pointer-x)_var(--pointer-y)]',
          'after:will-change-[opacity]'
        )}
      />
      <Glare />
      <div
        className={cn(
          'absolute inset-0 backface-hidden [background-image:radial-gradient(farthest-corner_circle_at_var(--pointer-x)_var(--pointer-y),hsla(0,0%,80%,.8)_10%,hsla(0,0%,80%,.65)_20%,hsla(0,0%,60%,.5)_90%)]',
          '[contain:paint]',
          'mix-blend-multiply opacity-95 group-hover/card:opacity-100 outline-[1px] outline-transparent will-change-[background-image,opacity,transform]'
        )}
      />
    </>
  )
}

export default ReverseHolofoilPokeBall
