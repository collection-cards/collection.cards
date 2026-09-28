import {cn} from '@/lib/utils'
import {ComponentProps} from 'react'

type ContainerProps = ComponentProps<'div'>

const Container: React.FC<ContainerProps> = ({
  children,
  className,
  ...props
}) => {
  return (
    <div className={cn(`container mx-auto px-6`, className)} {...props}>
      {children}
    </div>
  )
}

export default Container
