'use client'

import {Button} from '@/components/ui/button'
import {cn} from '@/lib/utils'
import {ArrowUpIcon} from 'lucide-react'
import {useEffect, useState} from 'react'
import {useSiteI18n} from '../sitei18n/SiteI18nProvider'

export default function ScrollToTop() {
  const [scrollTopPosition, setScrollTopPosition] = useState<number>(0)
  const {messages} = useSiteI18n()

  useEffect(() => {
    if (typeof window === 'undefined') return

    const handleScroll = () => {
      setScrollTopPosition(window.scrollY)
    }

    window.addEventListener('scroll', handleScroll)

    return () => {
      window.removeEventListener('scroll', handleScroll)
    }
  }, [])

  return (
    <div
      className={cn(
        'fixed bottom-4 right-4 transition-opacity duration-300 ease-in-out z-10',
        scrollTopPosition < 300 ? 'opacity-0' : 'opacity-100'
      )}
    >
      <Button
        variant="outline"
        size="icon"
        className="cursor-pointer"
        onClick={() => window.scrollTo({top: 0, behavior: 'smooth'})}
      >
        <ArrowUpIcon className="h-6 w-6" />
        <span className="sr-only">{messages.scrollToTop}</span>
      </Button>
    </div>
  )
}
