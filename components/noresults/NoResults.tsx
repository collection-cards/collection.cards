import {nav} from '@/consts/nav'
import Link from 'next/link'
import {Title} from '../title/Title'
import {Button} from '../ui/button'
import {useSiteI18n} from '../sitei18n/SiteI18nProvider'

type NoResultsProps = {
  contribute?: boolean
  title: string
  description: string
}

const NoResults: React.FC<NoResultsProps> = ({
  contribute,
  title,
  description
}) => {
  const {messages} = useSiteI18n()
  return (
    <div className="m-auto flex max-w-[80%] flex-1 flex-col items-center gap-6 text-center lg:gap-8 pt-10">
      <div className="section-title-gap-xl flex flex-col items-center text-center">
        <Title.H2>{title || messages.noResults}</Title.H2>
        <p className="text-muted-foreground text-base whitespace-pre-line">
          {description ||
            'It looks like no cards match your current filter settings. Try adjusting or removing some filters to see more results.'}
        </p>
        {contribute && (
          <Button className="cursor-pointer mt-6" asChild={true}>
            <Link href={nav.github()} target="_blank">
              {messages.contribute}
            </Link>
          </Button>
        )}
      </div>
    </div>
  )
}

export default NoResults
