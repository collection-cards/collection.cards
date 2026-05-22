/* eslint-disable @next/next/no-img-element */
import {ImageResponse} from 'next/og'
import {NextResponse} from 'next/server'
import {readdir, readFile} from 'node:fs/promises'
import path from 'node:path'

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
export const dynamicParams = false
export const fetchCache = 'force-cache'

type SetFile = {
  _id?: string
  _type?: string
  title?: string
  logo?: {
    _entry?: string
  }
}

type MediaFile = {
  _id?: string
  _type?: string
  title?: string
  location?: string
  width?: number
  height?: number
}

type SetRecord = {
  id: string
  title: string
  slug: string
  logoEntryId: string
}

type LogoRecord = {
  title?: string
  src: string
  width: number
  height: number
}

type SetIndex = {
  sets: Map<string, SetRecord>
  logos: Map<string, LogoRecord>
}

const CONTENT_SETS_DIR = path.join(
  process.cwd(),
  'content',
  'pages',
  'collections',
  'pokemon'
)
const CONTENT_LOGOS_DIR = path.join(
  process.cwd(),
  'content',
  'media',
  'pokémon',
  'logos'
)

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

const TRANSPARENT_PIXEL =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMB/at2Qm0AAAAASUVORK5CYII='

let setIndexPromise: Promise<SetIndex> | null = null

function toSetSlug(filePath: string): string {
  const filename = path.basename(filePath)
  return filename.replace(/\.archived\.json$/i, '').replace(/\.json$/i, '')
}

async function walkJsonFiles(rootDir: string): Promise<string[]> {
  const result: string[] = []
  const entries = await readdir(rootDir, {withFileTypes: true})

  for (const entry of entries) {
    const fullPath = path.join(rootDir, entry.name)
    if (entry.isDirectory()) {
      result.push(...(await walkJsonFiles(fullPath)))
      continue
    }
    if (entry.isFile() && entry.name.endsWith('.json')) {
      result.push(fullPath)
    }
  }

  return result
}

async function loadSetIndex(): Promise<SetIndex> {
  if (!setIndexPromise) {
    setIndexPromise = (async () => {
      const [setFiles, logoFiles] = await Promise.all([
        walkJsonFiles(CONTENT_SETS_DIR),
        walkJsonFiles(CONTENT_LOGOS_DIR)
      ])

      const sets = new Map<string, SetRecord>()
      const logos = new Map<string, LogoRecord>()

      for (const filePath of setFiles) {
        const raw = await readFile(filePath, 'utf8')
        const parsed = JSON.parse(raw) as SetFile
        if (
          parsed._type !== 'PokemonSet' ||
          !parsed._id ||
          !parsed.logo?._entry
        ) {
          continue
        }

        sets.set(parsed._id, {
          id: parsed._id,
          title: parsed.title || '',
          slug: toSetSlug(filePath),
          logoEntryId: parsed.logo._entry
        })
      }

      for (const filePath of logoFiles) {
        const raw = await readFile(filePath, 'utf8')
        const parsed = JSON.parse(raw) as MediaFile
        if (
          parsed._type !== 'MediaFile' ||
          !parsed._id ||
          !parsed.location ||
          !parsed.width ||
          !parsed.height
        ) {
          continue
        }

        logos.set(parsed._id, {
          title: parsed.title,
          src: parsed.location,
          width: parsed.width,
          height: parsed.height
        })
      }

      return {sets, logos}
    })()
  }

  return setIndexPromise
}

export async function generateStaticParams() {
  const {sets} = await loadSetIndex()
  return Array.from(sets.values()).flatMap(({id}) =>
    SIZES.map(size => ({set: id, size}))
  )
}

export async function GET(
  _request: Request,
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

  const {sets, logos} = await loadSetIndex()
  const setData = sets.get(set)
  const logo = setData ? logos.get(setData.logoEntryId) : null

  if (!setData || !logo) {
    return NextResponse.json(
      {error: 'Set not found or has no logo'},
      {status: 404}
    )
  }

  const {width, height} = PAPER_SIZES[normalized]

  const logoUrl = process.env.PUBLIC_SITE_URL
    ? `${process.env.PUBLIC_SITE_URL}/media${logo.src}`
    : null
  let logoSrc: string = TRANSPARENT_PIXEL

  if (logoUrl) {
    try {
      const res = await fetch(logoUrl, {cache: 'force-cache'})
      const mime = res.headers.get('content-type')
      if (res.ok && mime?.startsWith('image/')) {
        const buf = Buffer.from(await res.arrayBuffer())
        logoSrc = `data:${mime};base64,${buf.toString('base64')}`
      }
    } catch {
      // Keep transparent fallback image to avoid breaking prerender.
    }
  }

  const sourceWidth = logo.width ?? 1
  const sourceHeight = logo.height ?? 1
  const targetLogoWidth = (width / 100) * logoWidthPercentage
  const targetLogoHeight = (sourceHeight * targetLogoWidth) / sourceWidth

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
        alt={logo.title || setData.title}
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
        'Content-Disposition': `attachment; filename="collection-cards-binder-front-${size.toLowerCase()}-${
          setData.slug
        }.png"`
      }
    }
  )
}
