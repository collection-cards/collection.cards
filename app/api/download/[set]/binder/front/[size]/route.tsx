/* eslint-disable @next/next/no-img-element */
import {PokemonSet} from '@/alinea/schemas/PokemonSet'
import {cms} from '@/cms'
import {Pattern as PatternIcon} from '@/icons/Pattern'
import {Entry} from 'alinea/core'
import {ImageResponse} from 'next/og'
import {type NextRequest, NextResponse} from 'next/server'
const {renderToString} = await import('react-dom/server')

const logoWidthPercentage = 60

const SIZES = ['a4', 'letter'] as const

const PAPER_SIZES: Record<
  (typeof SIZES)[number],
  {width: number; height: number}
> = {
  a4: {width: 2480, height: 3508},
  letter: {width: 2550, height: 3300}
} as const

export const contentType = 'image/png'

// Prerender at build time and cache forever (content-addressed by params).
// New sets added after build are generated on-demand and then cached via ISR.
export const dynamic = 'force-static'
export const revalidate = false
export const dynamicParams = true

// Hoisted: these never change, so do them once per process, not per request.
const PATTERN_SVG = renderToString(<PatternIcon style={{color: '#030718'}} />)
const PATTERN_DATA_URL = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(
  PATTERN_SVG
)}`
const PATTERN_WIDTH = 120
const PATTERN_HEIGHT = Math.round(PATTERN_WIDTH * (440 / 200.22))

const CACHE_HEADERS = {
  'Cache-Control':
    'public, max-age=31536000, s-maxage=31536000, stale-while-revalidate=86400, immutable'
}

export async function generateStaticParams() {
  const sets = await cms.find({
    type: PokemonSet,
    select: {id: Entry.id}
  })
  return sets.flatMap(({id}) => SIZES.map(size => ({set: id, size})))
}

export async function GET(
  request: NextRequest,
  {params}: {params: Promise<{set: string; size: string}>}
) {
  const {set, size} = await params

  const normalized = size.toLowerCase() as (typeof SIZES)[number]
  if (normalized !== 'a4' && normalized !== 'letter') {
    return NextResponse.json(
      {error: "Invalid size. Must be 'a4' or 'letter'"},
      {status: 400}
    )
  }

  const data = await cms.first({
    type: PokemonSet,
    id: set,
    select: {
      title: Entry.title,
      path: Entry.path,
      logo: PokemonSet.logo
    }
  })

  if (!data || !data.logo) {
    return NextResponse.json(
      {error: 'Set not found or has no logo'},
      {status: 404}
    )
  }

  const logo = data.logo

  const {width, height} = PAPER_SIZES[normalized]

  const logoUrl = `${process.env.PUBLIC_SITE_URL}/media${logo.src}`
  let logoSrc: string = logoUrl
  try {
    const res = await fetch(logoUrl, {cache: 'no-store'})
    if (res.ok) {
      const buf = Buffer.from(await res.arrayBuffer())
      const mime = res.headers.get('content-type') || 'image/png'
      logoSrc = `data:${mime};base64,${buf.toString('base64')}`
    }
  } catch {
    // fall back to remote URL
  }

  return new ImageResponse(
    <div
      style={{
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
        height: '100%',
        backgroundColor: '#f7f7f8'
      }}
    >
      <svg
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        style={{position: 'absolute', inset: 0}}
      >
        <defs>
          <pattern
            id="p"
            width={PATTERN_WIDTH}
            height={PATTERN_HEIGHT}
            patternUnits="userSpaceOnUse"
          >
            <image
              href={PATTERN_DATA_URL}
              width={PATTERN_WIDTH}
              height={PATTERN_HEIGHT}
            />
          </pattern>
        </defs>
        <rect
          x="0"
          y="0"
          width={width}
          height={height}
          fill="url(#p)"
          opacity="0.15"
        />
      </svg>
      <img
        src={logoSrc}
        alt={logo.title || data.title}
        style={{
          width: `${(width / 100) * logoWidthPercentage}px`,
          height: `${
            (logo.height! * ((width / 100) * logoWidthPercentage)) / logo.width!
          }px`,
          position: 'relative'
        }}
      />
    </div>,
    {
      width,
      height,
      headers: {
        ...CACHE_HEADERS,
        'Content-Disposition': `attachment; filename="collection-cards-binder-front-${size.toLowerCase()}-${
          data.path
        }.png"`
      }
    }
  )
}
