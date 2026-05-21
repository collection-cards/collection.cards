import {Pattern as PatternIcon} from '@/icons/Pattern'
import {cn} from '@/lib/utils'
import {PropsWithChildren} from 'react'
const {renderToString} = await import('react-dom/server')

type PatternProps = {className?: string}

const Pattern: React.FC<PropsWithChildren<PatternProps>> = ({
  className,
  children
}) => {
  const maskImage = `url('data:image/svg+xml;charset=utf-8,${encodeURIComponent(
    renderToString(<PatternIcon />)
  )}')`

  return (
    <div className="relative w-full py-24 mt-24">
      <div
        className={cn(
          `absolute inset-0 bg-foreground/3 mask-size-[30px_auto] mask-center mask-repeat`,
          className
        )}
        style={{
          maskImage: maskImage
        }}
      />
      {children}
    </div>
  )
}

export default Pattern
