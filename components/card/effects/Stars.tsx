import {cn} from '@/lib/utils'

const Stars = () => {
  return (
    <div
      style={
        {
          '--space': '5%',
          '--angle': '133deg',
          '--imgsize': '200px'
        } as React.CSSProperties
      }
      className={cn(
        'stars absolute w-full h-full z-2',
        '[contain:paint] backface-hidden',
        'filter-[brightness(2)_contrast(.5)_saturate(.75)]',
        'mix-blend-hard-light',
        '[background-blend-mode:darken,hue,lighten]',
        'bg-position-[center_center,var(--pointer-x)_var(--pointer-y),center_center,center_center]',
        'bg-size-[cover,500%_500%,140%_140%,120%_120%]',
        'mask-cover',
        'mask-intersect',
        '[mask-mode:alpha,luminance]',
        '[mask-image:radial-gradient(farthest-corner_circle_at_var(--pointer-x)_var(--pointer-y),transparent_30%,black_100%),var(--mask)]',
        '[background-image:radial-gradient(farthest-corner_circle_at_var(--pointer-x)_var(--pointer-y),hsl(295,100%,10%)_20%,hsla(183,84%,85%,0.15)_100%),linear-gradient(var(--angle),var(--sunpillar))]'
      )}
    />
  )
}

export default Stars
