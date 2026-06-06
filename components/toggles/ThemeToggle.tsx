'use client'

import {MoonIcon, SunIcon} from 'lucide-react'
import {useEffect, useId, useState} from 'react'

import {Label} from '@/components/ui/label'
import {Switch} from '@/components/ui/switch'
import {useTheme} from 'next-themes'

const ThemeToggle = () => {
  const {resolvedTheme, setTheme} = useTheme()
  const [mounted, setMounted] = useState(false)
  const id = useId()

  useEffect(
    () =>
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setMounted(true),
    []
  )

  return (
    <div>
      <div className="relative inline-grid h-9 w-9 md:w-auto md:grid-cols-[1fr_1fr] items-center text-sm font-medium">
        {mounted && (
          <Switch
            id={id}
            checked={resolvedTheme === 'light'}
            onCheckedChange={checked => setTheme(checked ? 'light' : 'dark')}
            aria-label="Theme switch"
            className="peer absolute inset-0 h-[inherit] cursor-pointer w-auto data-[state=checked]:bg-primary data-[state=unchecked]:bg-primary hover:data-[state=checked]:bg-primary/90 hover:data-[state=unchecked]:bg-primary/90 [&_span]:h-full [&_span]:w-full md:[&_span]:w-1/2 [&_span]:transition-transform [&_span]:duration-300 [&_span]:ease-[cubic-bezier(0.16,1,0.3,1)] [&_span]:data-[state=checked]:translate-x-0 [&_span]:data-[state=checked]:rtl:-translate-x-0 md:[&_span]:data-[state=checked]:translate-x-full md:[&_span]:data-[state=checked]:rtl:-translate-x-full"
          />
        )}
        <span className="pointer-events-none relative ms-0.5 flex min-w-4 md:min-w-8 items-center justify-center text-center peer-data-[state=checked]:text-primary-foreground peer-data-[state=checked]:hidden md:peer-data-[state=checked]:flex">
          <MoonIcon size={16} aria-hidden="true" />
        </span>
        <span className="pointer-events-none relative md:me-0.5 flex min-w-4 md:min-w-8 items-center justify-center text-center peer-data-[state=unchecked]:text-primary-foreground peer-data-[state=unchecked]:hidden md:peer-data-[state=unchecked]:flex">
          <SunIcon size={16} aria-hidden="true" />
        </span>
      </div>
      <Label htmlFor={id} className="sr-only">
        Theme switch
      </Label>
    </div>
  )
}

export default ThemeToggle
