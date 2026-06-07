/**
 * Fetch a Pokémon TCG set from malie.io and create matching alinea entries.
 *
 *   yarn fetch:set <malie-key> <set-path> [--lang=en-US] [--dry-run]
 *
 * Example (Phantasmal Flames in the Mega Evolution series):
 *   yarn dev          # in another terminal — alinea + next must be running
 *   yarn fetch:set me2 mega-evolution/phantasmal-flames
 *
 * The script connects to the running alinea dev server (default
 * http://localhost:3000) and uses cms.commit() with Edit.create / Edit.upload
 * — exactly as documented at https://alineacms.com/docs/content/editing-content
 */

import {Edit, Query} from 'alinea'
import {createId} from 'alinea/core/Id'
import {createPreview} from 'alinea/core/media/CreatePreview'
import {MediaLibrary} from 'alinea/core/media/MediaTypes'
import {generateNKeysBetween} from 'alinea/core/util/FractionalIndexing'
import {slugify} from 'alinea/core/util/Slugs'
import {createCMS} from 'alinea/next'
import {Buffer} from 'node:buffer'
import {Collections} from '../alinea/schemas/Collections'
import {Footer} from '../alinea/schemas/Footer'
import {Header} from '../alinea/schemas/Header'
import {Home} from '../alinea/schemas/Home'
import {Illustrator} from '../alinea/schemas/Illustrator'
import {Illustrators} from '../alinea/schemas/Illustrators'
import {Page} from '../alinea/schemas/Page'
import {Pokedex} from '../alinea/schemas/Pokedex'
import {Pokemon} from '../alinea/schemas/Pokemon'
import {PokemonCard} from '../alinea/schemas/PokemonCard'
import {PokemonCollection} from '../alinea/schemas/PokemonCollection'
import {PokemonSerie} from '../alinea/schemas/PokemonSerie'
import {PokemonSeries} from '../alinea/schemas/PokemonSeries'
import {PokemonSet} from '../alinea/schemas/PokemonSet'
import {main as mainWorkspace} from '../alinea/workspaces/main'
import type {CardType} from '../consts/cardtype'
import type {Energy} from '../consts/energy'
import type {Rarity} from '../consts/rarity'
import type {Variant as VariantKey} from '../consts/variant'
import {createMaskFromBuffer} from '../lib/createMaskFromBuffer'

// ---------------------------------------------------------------------------
// CMS instance --------------------------------------------------------------
// ---------------------------------------------------------------------------
//
// We build the CMS here instead of importing it from `../cms`. The reason is
// purely about module systems: `tsx` loads plain `.ts` files as CommonJS (the
// project is intentionally NOT `"type": "module"`), and `alinea/next`'s
// createCMS throws when evaluated in a CommonJS context. This script file is an
// `.mts` (always ESM), so calling createCMS here resolves the ESM build and
// works. `cms.ts` is left untouched as the single source of truth for the app;
// keep this config in sync with it.
//
// NextCMS.resolve()/mutate() talk to the alinea backend over HTTP. Inside
// `next dev` the alinea CLI injects ALINEA_DEV_SERVER so the handler proxies to
// the live dev backend (default http://localhost:4500). A standalone script
// like this one does not inherit that env var, so without it queries would hit
// the Next route (/api/cms) and come back empty. We default it to the alinea
// dev server here; override with ALINEA_DEV_SERVER=… when the port differs.
if (process.env.NODE_ENV === 'development' && !process.env.ALINEA_DEV_SERVER) {
  process.env.ALINEA_DEV_SERVER = 'http://localhost:4500'
}

const cms = createCMS({
  schema: {
    Collections,
    Footer,
    Header,
    Home,
    Illustrator,
    Illustrators,
    Page,
    PokemonCard,
    PokemonCollection,
    Pokedex,
    Pokemon,
    PokemonSet,
    PokemonSerie,
    PokemonSeries
  },
  workspaces: {main: mainWorkspace},
  baseUrl: {
    development: 'http://localhost:3000',
    production: process.env.PUBLIC_SITE_URL ?? 'https://collection.cards'
  },
  preview: true,
  handlerUrl: '/api/cms',
  dashboardFile: 'admin.html'
})

// ---------------------------------------------------------------------------
// Types ---------------------------------------------------------------------
// ---------------------------------------------------------------------------

interface MalieFoil {
  type: string
  mask: string
}

interface MalieImages {
  front?: string
  foil?: string
  etch?: string
}

interface MalieCard {
  name: string
  card_type: 'POKEMON' | 'TRAINER' | 'ENERGY'
  artists?: {text?: string; list?: Array<string>}
  collector_number: {numeric: number; numerator: string}
  rarity: {designation: string}
  stage?: string
  hp?: number
  types?: Array<string>
  full_art?: boolean | null
  foil: MalieFoil | null
  ext: {tcgl: {cardID: string; key: string}}
  images: {tcgl: {png: MalieImages}}
}

interface CardGroup {
  number: number
  name: string
  std?: MalieCard
  ph?: MalieCard
}

interface ParsedArgs {
  malieKey: string
  setPath?: string
  lang: string
  dryRun: boolean
}

// ---------------------------------------------------------------------------
// CLI -----------------------------------------------------------------------
// ---------------------------------------------------------------------------

function parseArgs(): ParsedArgs {
  const argv = process.argv.slice(2)
  const positional: Array<string> = []
  let lang = 'en-US'
  let dryRun = false
  for (const arg of argv) {
    if (arg === '--dry-run') dryRun = true
    else if (arg.startsWith('--lang=')) lang = arg.slice('--lang='.length)
    else positional.push(arg)
  }
  if (positional.length < 1) {
    console.error(
      'Usage: yarn fetch:set <malie-key> [set-path] [--lang=en-US] [--dry-run]\n' +
        '  set-path is optional; when omitted it is derived from the malie set name\n' +
        '  example: yarn fetch:set me2\n' +
        '  example: yarn fetch:set me2 mega-evolution/phantasmal-flames'
    )
    process.exit(1)
  }
  return {
    malieKey: positional[0],
    setPath: positional[1],
    lang,
    dryRun
  }
}

// ---------------------------------------------------------------------------
// Helpers -------------------------------------------------------------------
// ---------------------------------------------------------------------------

const MALIE_INDEX_URL =
  'https://cdn.malie.io/file/malie-io/tcgl/export/index.json'
const MALIE_BASE = 'https://cdn.malie.io/file/malie-io/tcgl/export/'

// Workspace + media root that uploaded card media lives in. Matches
// `alinea/workspaces/main.tsx` (workspace key `main`, media root `media`).
const WORKSPACE = 'main'
const MEDIA_ROOT = 'media'
// Title/path of the top-level media library card images are nested under,
// mirroring the existing `content/media/pokémon/` layout.
const MEDIA_LIBRARY_TITLE = 'Pokémon'

/**
 * Malie has no split serie/set fields; the index only exposes a combined HTML
 * name. Series and set are separated by a dash, but the exact character and
 * spacing differ per language:
 *
 *   en  Mega Evolution—Phantasmal Flames     (em-dash, no spaces)
 *   fr  Méga-Évolution – Flammes…            (en-dash, spaced)
 *   de  Mega-Entwicklung – Fatale Flammen    (en-dash, spaced)
 *   it  Megaevoluzione - Fiamme Spettrali    (hyphen, spaced)
 *   pt  Megaevolução — Fogo…                 (em-dash, spaced)
 *
 * We split on the first em-dash (—) or en-dash (–) regardless of spacing, or
 * on a plain hyphen only when it is surrounded by whitespace. A bare hyphen
 * without spaces stays part of the name (e.g. the "Méga-Évolution" serie keeps
 * its hyphen). The base set of a series (e.g. `me1`) has no separator, so
 * series and set share the same name.
 *
 * Returns `{serie, set}` cleaned of `<i>`/`</i>` tags and surrounding
 * whitespace, e.g. `{serie: 'Mega Evolution', set: 'Phantasmal Flames'}`.
 */
function parseSerieAndSet(rawName: string): {serie: string; set: string} {
  const clean = rawName
    .replace(/<\/?i>/gi, '')
    .replace(/\s+/g, ' ')
    .trim()
  const separator = /\s*[—–]\s*|\s+-\s+/u
  const match = separator.exec(clean)
  if (!match) return {serie: clean, set: clean}
  const serie = clean.slice(0, match.index).trim()
  const set = clean.slice(match.index + match[0].length).trim()
  return {serie, set: set || serie}
}

/** Derive the alinea set path (`serie-slug/set-slug`) from a malie index name. */
function deriveSetPath(rawName: string): string {
  const {serie, set} = parseSerieAndSet(rawName)
  return `${slugify(serie)}/${slugify(set)}`
}

/**
 * Map a malie language code to the content language branch slug.
 *
 * Content is organised under `collections/pokemon/<branch>/<serie>/<set>`,
 * where the branch is a `PokemonSeries` node such as `en` or `jp`. Malie uses
 * regional codes like `en-US`, `fr-FR`, `pt-BR`; we take the primary subtag,
 * e.g. `fr-FR` → `fr`.
 */
function langToBranch(lang: string): string {
  return slugify(lang.split('-')[0])
}

/** Human-readable title for a language branch (PokemonSeries node). */
const LANG_NAMES: Record<string, string> = {
  en: 'English',
  jp: 'Japanese',
  fr: 'French',
  de: 'German',
  it: 'Italian',
  es: 'Spanish',
  pt: 'Portuguese'
}

function mapCardType(type: MalieCard['card_type']): CardType {
  switch (type) {
    case 'POKEMON':
      return 'pokemon'
    case 'TRAINER':
      return 'trainer'
    case 'ENERGY':
      return 'energy'
  }
}

function mapStage(stage?: string): 'basic' | 'stage1' | 'stage2' | undefined {
  switch (stage) {
    case 'BASIC':
      return 'basic'
    case 'STAGE1':
      return 'stage1'
    case 'STAGE2':
      return 'stage2'
    default:
      return undefined
  }
}

const RARITY_MAP: Record<string, Rarity> = {
  COMMON: 'common',
  UNCOMMON: 'uncommon',
  RARE: 'rare',
  DOUBLE_RARE: 'double-rare',
  ACE_SPEC_RARE: 'ace-spec-rare',
  ULTRA_RARE: 'ultra-rare',
  ILLUSTRATION_RARE: 'illustration-rare',
  SPECIAL_ILLUSTRATION_RARE: 'special-illustration-rare',
  HYPER_RARE: 'hyper-rare',
  MEGA_HYPER_RARE: 'mega-hyper-rare',
  BLACK_WHITE_RARE: 'black-white-rare'
}

function mapRarity(designation: string): Rarity | undefined {
  return RARITY_MAP[designation]
}

function mapEnergy(types?: Array<string>): Energy | undefined {
  const first = types?.[0]
  if (!first) return undefined
  return first.toLowerCase() as Energy
}

function isFullArt(card: MalieCard): boolean {
  if (card.full_art) return true
  // Mega Hyper Rare / Special Illustration Rare are visually full-art.
  const r = card.rarity.designation
  return (
    r === 'SPECIAL_ILLUSTRATION_RARE' ||
    r === 'MEGA_HYPER_RARE' ||
    r === 'HYPER_RARE'
  )
}

function isEx(name: string): boolean {
  return /\bex\b/i.test(name)
}

async function fetchJson<T>(url: string): Promise<T> {
  const res = await fetch(url)
  if (!res.ok) throw new Error(`GET ${url} → ${res.status} ${res.statusText}`)
  return (await res.json()) as T
}

async function fetchBuffer(url: string): Promise<Buffer> {
  const res = await fetch(url)
  if (!res.ok) throw new Error(`GET ${url} → ${res.status} ${res.statusText}`)
  const ab = await res.arrayBuffer()
  return Buffer.from(ab)
}

function bufferToUpload(buffer: Buffer, name: string): [string, Uint8Array] {
  return [name, new Uint8Array(buffer)]
}

// Build alinea reference shapes — these mirror the format already in
// content/pages/.../*.json
function imageRef(entryId: string) {
  return {_type: 'image', _entry: entryId, _id: createId()} as const
}

function entryRef(entryId: string) {
  return {_type: 'entry', _entry: entryId, _id: createId()} as const
}

// ---------------------------------------------------------------------------
// Variant decisions ---------------------------------------------------------
// ---------------------------------------------------------------------------

interface VariantSpec {
  variant: VariantKey
  /** URL to the foil overlay image (or undefined for plain `normal`). */
  foilUrl?: string
}

/**
 * Decide which Variant rows belong on a card given the std + ph malie data.
 *
 *   std.foil = null   + ph.exists  → [normal, reverse_holofoil]
 *   std.foil ≠ null   + ph.exists  → [holofoil, reverse_holofoil]
 *   std.foil ≠ null   + no ph      → [holofoil]
 *   std.foil = null   + no ph      → [normal]
 *
 * For ETCHED rarities the etch overlay is preferred over the foil overlay
 * because it carries the rainbow/gold pattern that drives the mask.
 */
function decideVariants(group: CardGroup): Array<VariantSpec> {
  const out: Array<VariantSpec> = []
  const std = group.std
  const ph = group.ph
  if (!std) return out

  const stdImages = std.images.tcgl.png
  const isEtched =
    std.foil?.mask === 'ETCHED' || std.foil?.mask === 'COLD_FOIL_ETCHED'
  const stdFoilUrl = isEtched
    ? (stdImages.etch ?? stdImages.foil)
    : stdImages.foil

  if (std.foil && stdFoilUrl) {
    out.push({variant: 'holofoil', foilUrl: stdFoilUrl})
  } else {
    out.push({variant: 'normal'})
  }

  if (ph?.foil) {
    const phFoilUrl = ph.images.tcgl.png.foil
    if (phFoilUrl) {
      out.push({variant: 'reverse_holofoil', foilUrl: phFoilUrl})
    }
  }

  return out
}

// ---------------------------------------------------------------------------
// Lookups -------------------------------------------------------------------
// ---------------------------------------------------------------------------

/**
 * Find a child entry of the given type directly under `parentId` whose path
 * matches `slug`, or queue an `Edit.create` op to create it. Newly created ops
 * are pushed onto `ops` so the caller can commit them; the returned `.id` is
 * already valid (Edit.create exposes it before commit) so it can be used as a
 * parentId for deeper levels in the same commit.
 */
async function findOrCreateChild(
  type: Parameters<typeof Edit.create>[0]['type'],
  parentId: string,
  slug: string,
  title: string,
  ops: Array<ReturnType<typeof Edit.create>>,
  location?: {root: string; workspace: string}
): Promise<{id: string; created: boolean}> {
  const existing = await cms.first({
    type,
    filter: {_parentId: parentId, _path: slug},
    select: {id: Query.id}
  })
  if (existing) return {id: existing.id, created: false}
  const op = Edit.create({
    type,
    parentId,
    set: {title, path: slug},
    ...location
  })
  ops.push(op)
  return {id: op.id, created: true}
}

async function findIllustrator(name: string): Promise<{id: string} | null> {
  const slug = slugify(name)
  const found = await cms.first({
    type: Illustrator,
    filter: {_path: slug},
    select: {id: Query.id}
  })
  return found
}

// Lazily-built map of slugified pokémon name (path + aliases) → entry id, so a
// card whose name does not match a pokédex path can still resolve through an
// alias (e.g. "Paldean Wooper" → "Wooper").
let pokemonSlugIndex: Map<string, string> | null = null

async function getPokemonSlugIndex(): Promise<Map<string, string>> {
  if (pokemonSlugIndex) return pokemonSlugIndex
  const index = new Map<string, string>()
  const all = await cms.find({
    type: Pokemon,
    select: {
      id: Query.id,
      path: Query.path,
      aliases: Pokemon.aliases
    }
  })
  for (const entry of all) {
    if (entry.path) index.set(entry.path, entry.id)
    for (const alias of entry.aliases ?? []) {
      const aliasName = alias.name
      if (aliasName) index.set(slugify(aliasName), entry.id)
    }
  }
  pokemonSlugIndex = index
  return index
}

async function findPokemon(name: string): Promise<{id: string} | null> {
  const slug = slugify(name)
  const found = await cms.first({
    type: Pokemon,
    filter: {_path: slug},
    select: {id: Query.id}
  })
  if (found) return found
  // Fall back to the alias index.
  const index = await getPokemonSlugIndex()
  const id = index.get(slug)
  return id ? {id} : null
}

/** Strip the leading "Mega " prefix and trailing " ex" / " v" suffixes for pokedex lookup. */
function basePokemonName(cardName: string): string {
  return cardName
    .replace(/^Mega\s+/i, '')
    .replace(/\s+ex$/i, '')
    .replace(/\s+vmax$/i, '')
    .replace(/\s+vstar$/i, '')
    .replace(/\s+v$/i, '')
    .trim()
}

// ---------------------------------------------------------------------------
// Main ----------------------------------------------------------------------
// ---------------------------------------------------------------------------

async function main() {
  const args = parseArgs()
  if (args.dryRun) console.log('→ DRY RUN — no commits will be made')

  // 1. Discover the malie file for this set + language ----------------------
  // index[lang] is an object keyed by malie set key, e.g.
  //   { me1: {path, name, abbr, ...}, me2: {...} }
  const index =
    await fetchJson<
      Record<string, Record<string, {path: string; name: string; abbr: string}>>
    >(MALIE_INDEX_URL)
  const langEntries = index[args.lang] ?? {}
  const setEntry = langEntries[args.malieKey]
  if (!setEntry) {
    throw new Error(
      `Set key "${args.malieKey}" not found in malie index for ${args.lang}`
    )
  }

  // Derive the alinea set path from the malie set name when not given.
  const setPath = args.setPath ?? deriveSetPath(setEntry.name)
  const branch = langToBranch(args.lang)
  const {serie, set} = parseSerieAndSet(setEntry.name)
  const contentPath = `collections/pokemon/${branch}/${setPath}`
  console.log(
    `→ malie key: ${args.malieKey} · lang: ${args.lang} · branch: ${branch}\n` +
      `→ serie: ${serie} · set: ${set}\n` +
      `→ set path: ${setPath}${args.setPath ? '' : ' (derived)'}\n` +
      `→ content path: content/pages/${contentPath}/`
  )

  console.log(`→ malie file: ${setEntry.path}`)
  const cards = await fetchJson<Array<MalieCard>>(MALIE_BASE + setEntry.path)
  console.log(`→ ${cards.length} card entries downloaded`)

  // 2. Group by collector number -------------------------------------------
  const groups = new Map<number, CardGroup>()
  for (const card of cards) {
    const n = card.collector_number.numeric
    const id = card.ext.tcgl.cardID
    let group = groups.get(n)
    if (!group) {
      group = {number: n, name: card.name}
      groups.set(n, group)
    }
    if (id.endsWith('_ph')) group.ph = card
    else group.std = card
  }
  const ordered = [...groups.values()].sort((a, b) => a.number - b.number)
  console.log(`→ ${ordered.length} unique cards`)

  // 3. Resolve (or create) the structural chain ----------------------------
  //    pokemon (PokemonCollection) → branch (PokemonSeries)
  //      → serie (PokemonSerie) → set (PokemonSet)
  //    Every missing level is created with Edit.create. In dry-run we stay
  //    fully offline and use a placeholder id.
  const [serieSlug, setSlug] = (() => {
    const segs = setPath.split('/').filter(Boolean)
    return [segs[0], segs[segs.length - 1]]
  })()
  const structuralOps: Array<ReturnType<typeof Edit.create>> = []
  let setNode: {id: string; title: string}

  if (args.dryRun) {
    setNode = {id: 'dry-run-set', title: set}
  } else {
    const collection = await cms.first({
      type: PokemonCollection,
      filter: {_path: 'pokemon'},
      select: {id: Query.id}
    })
    if (!collection) {
      throw new Error('PokemonCollection "pokemon" not found in content')
    }

    const branchNode = await findOrCreateChild(
      PokemonSeries,
      collection.id,
      branch,
      LANG_NAMES[branch] ?? branch,
      structuralOps
    )
    const serieNode = await findOrCreateChild(
      PokemonSerie,
      branchNode.id,
      serieSlug,
      serie,
      structuralOps
    )
    const created = await findOrCreateChild(
      PokemonSet,
      serieNode.id,
      setSlug,
      set,
      structuralOps
    )
    setNode = {id: created.id, title: set}

    if (branchNode.created) console.log(`→ + branch: ${branch} (created)`)
    if (serieNode.created) console.log(`→ + serie: ${serie} (created)`)
    if (created.created) console.log(`→ + set: ${set} (created)`)
  }
  console.log(`→ target set: ${setNode.title} (${setNode.id})`)

  // 3b. Resolve (or create) the media folder chain -------------------------
  //     Pokémon (MediaLibrary) → serie → set. Card images are uploaded into
  //     the set folder so the media library mirrors `Pokémon/serie/set`.
  //     Missing folders are created in the same commit as the structural
  //     entries (committed before the uploads that reference them).
  let setMediaFolderId: string | undefined
  if (!args.dryRun) {
    const library = await cms.first({
      type: MediaLibrary,
      filter: {_path: slugify(MEDIA_LIBRARY_TITLE)},
      select: {id: Query.id}
    })
    if (!library) {
      throw new Error(
        `Media library "${MEDIA_LIBRARY_TITLE}" not found in content/media`
      )
    }
    const location = {root: MEDIA_ROOT, workspace: WORKSPACE}
    const serieFolder = await findOrCreateChild(
      MediaLibrary,
      library.id,
      serieSlug,
      serie,
      structuralOps,
      location
    )
    const setFolder = await findOrCreateChild(
      MediaLibrary,
      serieFolder.id,
      setSlug,
      set,
      structuralOps,
      location
    )
    setMediaFolderId = setFolder.id
    if (serieFolder.created) console.log(`→ + media folder: ${serie} (created)`)
    if (setFolder.created) console.log(`→ + media folder: ${set} (created)`)
  }

  // Target folder for every upload below (omitted in dry-run, where no
  // uploads are produced).
  const mediaUploadTarget = setMediaFolderId
    ? {parentId: setMediaFolderId, root: MEDIA_ROOT, workspace: WORKSPACE}
    : undefined

  // 4. Cache + create-once helpers for illustrators -------------------------
  const illustratorCache = new Map<string, string>() // name → entry id
  const pendingIllustratorOps: Array<ReturnType<typeof Edit.create>> = []

  // Resolve the Illustrators root entry so new illustrators are nested under it
  // (matching the existing `content/pages/illustrators/*.json` layout) instead
  // of being created at the root of the pages tree.
  let illustratorsParentId: string | undefined
  if (!args.dryRun) {
    const illustratorsRoot = await cms.first({
      type: Illustrators,
      select: {id: Query.id}
    })
    if (!illustratorsRoot) {
      throw new Error('Illustrators root entry not found in content')
    }
    illustratorsParentId = illustratorsRoot.id
  }

  async function resolveIllustrator(
    name: string
  ): Promise<{entryId: string; created: boolean}> {
    const cached = illustratorCache.get(name)
    if (cached) return {entryId: cached, created: false}
    if (args.dryRun) {
      const placeholder = `dry-run-illustrator-${slugify(name)}`
      illustratorCache.set(name, placeholder)
      return {entryId: placeholder, created: true}
    }
    const existing = await findIllustrator(name)
    if (existing) {
      illustratorCache.set(name, existing.id)
      return {entryId: existing.id, created: false}
    }
    // Create a new illustrator under the Illustrators root entry.
    const op = Edit.create({
      type: Illustrator,
      parentId: illustratorsParentId,
      set: {title: name}
    })
    pendingIllustratorOps.push(op)
    illustratorCache.set(name, op.id)
    return {entryId: op.id, created: true}
  }

  // 5. Build operations per card -------------------------------------------
  const cardOps: Array<
    ReturnType<typeof Edit.create> | ReturnType<typeof Edit.update>
  > = []
  const uploadOps: Array<ReturnType<typeof Edit.upload>> = []

  let processed = 0
  for (const group of ordered) {
    const std = group.std
    if (!std) {
      console.warn(`  ⚠️  #${group.number} has no std variant — skipping`)
      continue
    }

    const number = String(group.number)
    const paddedNumber = number.padStart(3, '0')
    const nameSlug = slugify(std.name)
    // Prefix the collector number so cards that share a name (e.g. the
    // multiple "Mega Charizard X ex" prints) get distinct, sortable paths
    // instead of colliding onto a single entry.
    const slug = `${number}-${nameSlug}`
    const baseName = `${args.malieKey}-${paddedNumber}-${nameSlug}`

    // --- Look up illustrator (or create) ---------------------------------
    // Some cards (e.g. basic/special energy) legitimately have no artist; we
    // still include them, leaving the illustrator field empty.
    const illustratorName = std.artists?.list?.[0]
    const illustrator = illustratorName
      ? await resolveIllustrator(illustratorName)
      : null

    // --- Look up base pokémon (optional) ---------------------------------
    let pokemonId: string | undefined
    if (std.card_type === 'POKEMON' && !args.dryRun) {
      const lookup = basePokemonName(std.name)
      const found = await findPokemon(lookup)
      if (found) pokemonId = found.id
      else
        console.warn(
          `  ⚠️  Pokémon "${lookup}" not found in pokedex — leaving pokemon empty`
        )
    }

    // --- Does this card already exist under the set? ---------------------
    // Match on parent + path so re-running the import updates the existing
    // entry instead of creating a duplicate.
    const existingCard = args.dryRun
      ? null
      : await cms.first({
          type: PokemonCard,
          filter: {_parentId: setNode.id, _path: slug},
          select: {id: Query.id}
        })

    // --- Build the shared metadata ---------------------------------------
    const set: Record<string, unknown> = {
      title: std.name,
      path: slug,
      number,
      edgeColor: '#97999b',
      rarity: mapRarity(std.rarity.designation) ?? 'common',
      cardtype: mapCardType(std.card_type),
      subtype: null,
      isEx: isEx(std.name),
      isTrainerGallery: false,
      isFullArt: isFullArt(std),
      illustrator: illustrator ? entryRef(illustrator.entryId) : null
    }

    if (std.card_type === 'POKEMON') {
      if (typeof std.hp === 'number') set.hp = std.hp
      const stage = mapStage(std.stage)
      if (stage) set.stage = stage
      const energy = mapEnergy(std.types)
      if (energy) set.energy = energy
      if (pokemonId) set.pokemon = entryRef(pokemonId)
    }
    if (std.card_type === 'ENERGY') {
      const energy = mapEnergy(std.types)
      if (energy) set.energy = energy
    }

    if (existingCard) {
      // Update only the metadata. `card` and `variants` are intentionally
      // left out so the existing images are preserved — re-uploading them on
      // every run would orphan the originals and churn the media library.
      cardOps.push(
        Edit.update({
          type: PokemonCard,
          id: existingCard.id,
          set: set as never
        })
      )
      processed++
      console.log(
        `  ↻ #${number.padStart(3, '0')} ${std.name} (updated, illust: ${
          illustratorName ?? '—'
        })`
      )
      continue
    }

    // --- New card: front (card) image ------------------------------------
    const frontUrl = std.images.tcgl.png.front
    if (!frontUrl) {
      console.warn(`  ⚠️  ${std.name} has no front image — skipping`)
      continue
    }
    const frontBuffer = args.dryRun
      ? Buffer.alloc(0)
      : await fetchBuffer(frontUrl)
    const cardUpload = args.dryRun
      ? null
      : Edit.upload({
          file: bufferToUpload(frontBuffer, `${baseName}.png`),
          createPreview,
          ...mediaUploadTarget
        })
    if (cardUpload) uploadOps.push(cardUpload)

    // --- Variants --------------------------------------------------------
    const variantSpecs = decideVariants(group)
    // alinea sorts list items by their fractional `_index`; generate one valid
    // key per variant in a single call (a0, a1, … equivalents).
    const variantKeys = generateNKeysBetween(null, null, variantSpecs.length)
    const variants: Array<Record<string, unknown>> = []
    let variantIndex = 0
    for (const spec of variantSpecs) {
      const row: Record<string, unknown> = {
        _id: createId(),
        _index: variantKeys[variantIndex++],
        _type: 'Variant',
        variant: spec.variant,
        pattern: null
      }

      if (spec.variant !== 'normal' && spec.foilUrl) {
        const variantSlug =
          spec.variant === 'holofoil' ? 'holofoil' : 'reverse-holofoil'
        const foilName = `${baseName}-${variantSlug}-foil.png`
        const maskName = `${baseName}-${variantSlug}-mask.png`

        if (args.dryRun) {
          row.foil = imageRef('dry-run')
          row.mask = imageRef('dry-run')
        } else {
          const foilBuffer = await fetchBuffer(spec.foilUrl)
          const maskBuffer = await createMaskFromBuffer(foilBuffer)
          const foilUpload = Edit.upload({
            file: bufferToUpload(foilBuffer, foilName),
            createPreview,
            ...mediaUploadTarget
          })
          const maskUpload = Edit.upload({
            file: bufferToUpload(maskBuffer, maskName),
            createPreview,
            ...mediaUploadTarget
          })
          uploadOps.push(foilUpload, maskUpload)
          row.foil = imageRef(foilUpload.id)
          row.mask = imageRef(maskUpload.id)
        }
      }
      variants.push(row)
    }

    set.card = cardUpload ? imageRef(cardUpload.id) : imageRef('dry-run')
    set.variants = variants

    const cardOp = Edit.create({
      type: PokemonCard,
      parentId: setNode.id,
      set: set as never
    })
    cardOps.push(cardOp)
    processed++
    console.log(
      `  ✓ #${number.padStart(3, '0')} ${std.name} (${variantSpecs
        .map(v => v.variant)
        .join('+')}, illust: ${illustratorName ?? '—'})`
    )
  }

  console.log(
    `→ Built ${pendingIllustratorOps.length} illustrator(s), ${uploadOps.length} upload(s), ${cardOps.length} card entries (${processed}/${ordered.length})`
  )

  if (args.dryRun) {
    console.log('→ DRY RUN: skipping cms.commit()')
    return
  }

  // 6. Commit in stages so later ops can reference earlier IDs --------------
  // Structural entries (branch / serie / set) + illustrators first, so the
  // cards committed afterwards can reference their parent set and illustrators.
  const setupOps = [...structuralOps, ...pendingIllustratorOps]
  if (setupOps.length) {
    console.log(
      `→ Committing ${structuralOps.length} structural entry(ies) + ` +
        `${pendingIllustratorOps.length} new illustrator(s)…`
    )
    await cms.commit(...setupOps)
  }

  // Uploads + cards together — Edit.upload exposes its .id before commit so
  // card refs are already valid.
  console.log(
    `→ Committing ${uploadOps.length} upload(s) + ${cardOps.length} card entries…`
  )
  await cms.commit(...uploadOps, ...cardOps)

  console.log('✅ Done.')
}

main().catch(err => {
  console.error(err)
  process.exit(1)
})
