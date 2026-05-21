import {Pattern as PatternIcon} from '@/icons/Pattern'
const {renderToString} = await import('react-dom/server')

const maskImage = `url('data:image/svg+xml;charset=utf-8,${encodeURIComponent(
  renderToString(<PatternIcon />)
)}')`

const PlaceholderCard: React.FC = () => {
  return (
    <div
      className="w-full h-full bg-foreground/3 mask-size-[30px_auto] mask-center mask-repeat rounded-[4.15%/2.98%]"
      style={{
        maskImage: maskImage
      }}
    />
  )
}

export default PlaceholderCard
