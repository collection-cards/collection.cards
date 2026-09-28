import {cn} from '@/lib/utils'
import {X} from 'lucide-react'
import {Button} from '../ui/button'
import {useSiteI18n} from '../sitei18n/SiteI18nProvider'

type CloseButtonProps = {
  className?: string
  onClose: () => void
}

function CloseButton({className, onClose}: CloseButtonProps) {
  const {messages} = useSiteI18n()
  return (
    <Button
      variant="ghost"
      size="icon"
      className={cn(
        'rounded-full bg-background/80 backdrop-blur-sm cursor-pointer',
        'hover:bg-background hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50',
        className
      )}
      onClick={onClose}
    >
      <X className="h-4 w-4" />
      <span className="sr-only">{messages.close}</span>
    </Button>
  )
}

export default CloseButton
