import {ChevronLeft} from 'lucide-react'
import {Button} from '../ui/button'
import {useSiteI18n} from '../sitei18n/SiteI18nProvider'

type PrevButtonProps = {onClick?: () => void; disabled?: boolean}

const PrevButton: React.FC<PrevButtonProps> = ({onClick, disabled}) => {
  const {messages} = useSiteI18n()
  return <Button
    variant="outline"
    size="icon"
    onClick={onClick}
    disabled={disabled}
    className="cursor-pointer"
    aria-label={messages.previous}
  >
    <ChevronLeft className="h-4 w-4" />
  </Button>
}

export default PrevButton
