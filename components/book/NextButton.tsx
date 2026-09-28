import {ChevronRight} from 'lucide-react'
import {Button} from '../ui/button'
import {useSiteI18n} from '../sitei18n/SiteI18nProvider'

type NextButtonProps = {onClick?: () => void; disabled?: boolean}

const NextButton: React.FC<NextButtonProps> = ({onClick, disabled}) => {
  const {messages} = useSiteI18n()
  return <Button
    variant="outline"
    size="icon"
    onClick={onClick}
    disabled={disabled}
    className="cursor-pointer"
    aria-label={messages.next}
  >
    <ChevronRight className="h-4 w-4" />
  </Button>
}

export default NextButton
