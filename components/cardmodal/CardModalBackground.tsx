import {Pattern as PatternIcon} from '@/icons/Pattern'
import {motion} from 'framer-motion'
const {renderToString} = await import('react-dom/server')

type CardModalBackgroundProps = {
  onClose: () => void
}

const CardModalBackground: React.FC<CardModalBackgroundProps> = ({onClose}) => (
  <motion.div
    initial={{opacity: 0}}
    animate={{opacity: 1}}
    exit={{opacity: 0}}
    transition={{duration: 0.3}}
    className="fixed inset-0 bg-foreground/3 backdrop-blur-sm z-20"
    onClick={onClose}
  >
    <div
      className="absolute inset-0 bg-foreground/3 mask-size-[30px_auto] mask-center mask-repeat"
      style={{
        maskImage: `url('data:image/svg+xml;charset=utf-8,${encodeURIComponent(
          renderToString(<PatternIcon />)
        )}')`
      }}
    ></div>
  </motion.div>
)

export default CardModalBackground
