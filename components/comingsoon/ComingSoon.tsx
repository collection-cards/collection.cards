import {PropsWithChildren} from 'react'
import Tooltip from '../tooltip/Tooltip'

const ComingSoon: React.FC<PropsWithChildren<{text?: string}>> = ({
  children,
  text = 'Coming soon'
}) => (
  <Tooltip text={text}>{children}</Tooltip>
)

export default ComingSoon
