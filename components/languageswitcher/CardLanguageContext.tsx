'use client'

import {LocaleTag} from '@/lib/locales'
import {
  createContext,
  PropsWithChildren,
  useCallback,
  useContext,
  useMemo,
  useState
} from 'react'

export type CardLanguageOption = {
  href: string
  language: LocaleTag
  title: string
}

export type CardLanguageRoute = {
  currentLanguage: LocaleTag
  options: CardLanguageOption[]
}

type CardLanguageContextValue = {
  route: CardLanguageRoute | null
  registerRoute: (route: CardLanguageRoute) => () => void
}

const CardLanguageContext = createContext<CardLanguageContextValue>({
  route: null,
  registerRoute: () => () => undefined
})

export function CardLanguageProvider({children}: PropsWithChildren) {
  const [route, setRoute] = useState<CardLanguageRoute | null>(null)
  const registerRoute = useCallback((nextRoute: CardLanguageRoute) => {
    setRoute(nextRoute)
    return () => setRoute(current => (current === nextRoute ? null : current))
  }, [])
  const value = useMemo(() => ({route, registerRoute}), [registerRoute, route])

  return (
    <CardLanguageContext.Provider value={value}>
      {children}
    </CardLanguageContext.Provider>
  )
}

export function useCardLanguageRoute() {
  return useContext(CardLanguageContext)
}
