'use client'

import {ImageLink} from 'alinea'
import Image from 'next/image'
import {useState} from 'react'

type SetSymbolProps = {
  code?: string | null
  symbol?: ImageLink<undefined>
  title: string
}

export default function SetSymbol({code, symbol, title}: SetSymbolProps) {
  const [imageFailed, setImageFailed] = useState(false)

  if (symbol?.src && !imageFailed) {
    return (
      <div className="relative h-8 w-8 shrink-0">
        <Image
          alt={`${title} (${code || 'set symbol'})`}
          src={`/media${symbol.src}`}
          fill={true}
          sizes="32px"
          onError={() => setImageFailed(true)}
          style={{
            objectFit: 'contain',
            objectPosition: symbol.focus
              ? `${symbol.focus.x * 100}% ${symbol.focus.y * 100}%`
              : undefined
          }}
        />
      </div>
    )
  }

  if (!code) return null

  return (
    <span
      aria-label={`${title} (${code})`}
      className="flex h-8 min-w-8 shrink-0 items-center justify-center rounded border border-border bg-muted/50 px-1.5 font-mono text-[10px] font-semibold uppercase tracking-tight text-muted-foreground"
    >
      {code}
    </span>
  )
}
