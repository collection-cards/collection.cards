/* eslint-disable @next/next/no-img-element */
import {PokemonSet} from '@/alinea/schemas/PokemonSet'
import {cms} from '@/cms'
import {Pattern as PatternIcon} from '@/icons/Pattern'
import {Entry} from 'alinea/core'
import {ImageResponse} from 'next/og'
import {type NextRequest, NextResponse} from 'next/server'
const {renderToString} = await import('react-dom/server')

const logoWidthPercentage = 60

const PAPER_SIZES = {
  A4: {width: 2480, height: 3508},
  letter: {width: 2550, height: 3300}
} as const

export const contentType = 'image/png'

export async function GET(
  request: NextRequest,
  {params}: {params: Promise<{set: string; size: string}>}
) {
  const {set, size} = await params

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

  const normalized = size.toLowerCase()
  if (normalized !== 'a4' && normalized !== 'letter') {
    return NextResponse.json(
      {error: "Invalid size. Must be 'a4' or 'letter'"},
      {status: 400}
    )
  }

  const {width, height} =
    normalized === 'letter' ? PAPER_SIZES.letter : PAPER_SIZES.A4

  const svg = renderToString(<PatternIcon style={{color: '#030718'}} />)
  const encoded = encodeURIComponent(svg)
  const patternWidth = 120
  const patternHeight = Math.round(patternWidth * (440 / 200.22))

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
            width={patternWidth}
            height={patternHeight}
            patternUnits="userSpaceOnUse"
          >
            <image
              href={`data:image/svg+xml;charset=utf-8,${encoded}`}
              width={patternWidth}
              height={patternHeight}
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
        src={`${process.env.PUBLIC_SITE_URL}/media${logo.src}`}
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
        'Content-Disposition': `attachment; filename="collection-cards-binder-front-${size.toLowerCase()}-${
          data.path
        }.png"`
      }
    }
  )
}
