import {Pattern} from '@/icons/Pattern'
import {ImageLink} from 'alinea'
import Image from 'next/image'
import {JSX} from 'react'
const {renderToString} = await import('react-dom/server')

type CoverPageProps = {image?: ImageLink<undefined> | JSX.Element}

const maskImage = `url('data:image/svg+xml;charset=utf-8,${encodeURIComponent(
  renderToString(<Pattern />)
)}')`

const CoverPage: React.FC<CoverPageProps> = ({image}) => (
  <div className="w-full h-full bg-foreground/3">
    <div
      className="absolute inset-0 w-full h-full bg-foreground/3 mask-size-[30px_auto] mask-center mask-repeat"
      style={{
        maskImage: maskImage
      }}
    />
    {image && (
      <div className="w-full min-h-full flex items-center justify-center">
        {typeof image === 'object' && 'src' in image ? (
          <Image
            src={`/media${image.src}`}
            alt={image.title}
            width={image.width}
            height={image.height}
            className="w-[40%] h-auto"
            sizes={'269px'}
          />
        ) : (
          image
        )}
      </div>
    )}
  </div>
)

export default CoverPage
