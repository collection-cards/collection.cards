/* eslint-disable @next/next/no-img-element */
import {PokemonCollection} from '@/alinea/schemas/PokemonCollection'
import {PokemonSet} from '@/alinea/schemas/PokemonSet'
import {cms} from '@/cms'
import {Query} from 'alinea'
import {ImageResponse} from 'next/og'
import {NextResponse} from 'next/server'
import {FRONT_SIZES, frontSizes} from '../../sizes'

const logoWidthPercentage = 60

export const contentType = 'image/png'

// Generate on request; cache is controlled via response headers.
export const dynamic = 'force-dynamic'
export const revalidate = false
export const dynamicParams = true

const PATTERN_SVG =
  '<svg version="1.1" viewBox="0 0 200.22 440" xmlns="http://www.w3.org/2000/svg"><path fill="#030718" d="M90.11,195.84c0,4.16-1.41,7.62-4.05,10.22-2.7,2.65-6.16,3.95-10.38,3.95H24.16c-4.16,0-7.62-1.3-10.22-3.95-2.65-2.65-3.95-6.05-3.95-10.22V24.16c0-4.16,1.3-7.62,3.95-10.22,2.65-2.59,6.05-3.95,10.22-3.95h51.51c4.16,0,7.62,1.3,10.38,3.95,2.76,2.65,4.05,6.05,4.05,10.22v46.54h-17.89V25.68H27.73v168.65h44.49v-49.24h17.89v50.76h0Z"/><path fill="#030718" d="M190.22,305.84c0,4.16-1.41,7.62-4.05,10.22-2.7,2.65-6.16,3.95-10.38,3.95h-51.51c-4.16,0-7.62-1.3-10.22-3.95-2.65-2.65-3.95-6.05-3.95-10.22v-171.68c0-4.16,1.3-7.62,3.95-10.22,2.65-2.59,6.05-3.95,10.22-3.95h51.51c4.16,0,7.62,1.3,10.38,3.95,2.76,2.65,4.05,6.05,4.05,10.22v46.54h-17.89v-45.03h-44.49v168.65h44.49v-49.24h17.89v50.76h0Z"/><path fill="#030718" d="M90.11,415.84c0,4.16-1.41,7.62-4.05,10.22-2.7,2.65-6.16,3.95-10.38,3.95H24.16c-4.16,0-7.62-1.3-10.22-3.95-2.65-2.65-3.95-6.05-3.95-10.22v-171.68c0-4.16,1.3-7.62,3.95-10.22,2.65-2.59,6.05-3.95,10.22-3.95h51.51c4.16,0,7.62,1.3,10.38,3.95,2.76,2.65,4.05,6.05,4.05,10.22v46.54h-17.89v-45.03H27.73v168.65h44.49v-49.24h17.89v50.76h0Z"/><path fill="#030718" d="M190.22,85.84c0,4.16-1.41,7.62-4.05,10.22-2.7,2.65-6.16,3.95-10.38,3.95h-51.51c-4.16,0-7.62-1.3-10.22-3.95-2.65-2.65-3.95-6.05-3.95-10.22V-85.84c0-4.16,1.3-7.62,3.95-10.22,2.65-2.59,6.05-3.95,10.22-3.95h51.51c4.16,0,7.62,1.3,10.38,3.95,2.76,2.65,4.05,6.05,4.05,10.22v46.54h-17.89v-45.03h-44.49V84.32h44.49v-49.24h17.89v50.76h0Z"/><path fill="#030718" d="M190.22,525.84c0,4.16-1.41,7.62-4.05,10.22-2.7,2.65-6.16,3.95-10.38,3.95h-51.51c-4.16,0-7.62-1.3-10.22-3.95-2.65-2.65-3.95-6.05-3.95-10.22v-171.68c0-4.16,1.3-7.62,3.95-10.22,2.65-2.59,6.05-3.95,10.22-3.95h51.51c4.16,0,7.62,1.3,10.38,3.95,2.76,2.65,4.05,6.05,4.05,10.22v46.54h-17.89v-45.03h-44.49v168.65h44.49v-49.24h17.89v50.76h0Z"/></svg>'
const PATTERN_DATA_URL = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(
  PATTERN_SVG
)}`
const PATTERN_WIDTH = 120
const PATTERN_HEIGHT = Math.round(PATTERN_WIDTH * (440 / 200.22))

const CACHE_HEADERS = {
  'Cache-Control':
    'public, max-age=31536000, s-maxage=31536000, stale-while-revalidate=86400, immutable'
}

export async function GET(
  request: Request,
  {params}: {params: Promise<{set: string; size: string}>}
) {
  const {set, size} = await params

  const normalized = size.toLowerCase() as (typeof FRONT_SIZES)[number]
  if (!FRONT_SIZES.includes(normalized))
    return NextResponse.json(
      {error: `Invalid size. Must be ${FRONT_SIZES.join(', ')}`},
      {status: 400}
    )

  const setData = await cms.get({
    type: PokemonSet,
    id: set,
    status: 'all',
    select: {
      collection: Query.parents({
        select: {
          icon: PokemonCollection.icon
        },
        type: PokemonCollection
      }),
      logo: PokemonSet.logo,
      path: Query.path,
      symbols: PokemonSet.symbol,
      title: Query.title
    }
  })

  if (!setData)
    return NextResponse.json({error: 'Set not found'}, {status: 404})

  const logo = setData.logo
  if (!logo) return NextResponse.json({error: 'Set has no logo'}, {status: 404})

  const {width, height} = frontSizes[normalized]
  const filename = `${setData.path}-binder-front-${normalized}-collection-cards.png`

  const sourceWidth = logo.width ?? 1
  const sourceHeight = logo.height ?? 1
  const targetLogoWidth = (width / 100) * logoWidthPercentage
  const targetLogoHeight = (sourceHeight * targetLogoWidth) / sourceWidth
  const logoUrl = new URL(
    `${process.env.PUBLIC_SITE_URL}/media${logo.src}`,
    request.url
  ).toString()

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
        src={logoUrl}
        alt={logo.title || setData.title}
        width={targetLogoWidth}
        height={targetLogoHeight}
        style={{
          width: `${targetLogoWidth}px`,
          height: `${targetLogoHeight}px`,
          position: 'relative'
        }}
      />
    </div>,
    {
      width,
      height,
      headers: {
        ...CACHE_HEADERS,
        'Content-Disposition': `attachment; filename="${filename}"`
      }
    }
  )
}
