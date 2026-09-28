/**
 * Plan or apply incremental imports from the malie.io export index.
 *
 * Planning is the default and never writes content:
 *   yarn sync:malie --lang=pt-BR --keys=me5-5
 *
 * Apply a reviewed plan while the Alinea dev server is running:
 *   yarn sync:malie --lang=pt-BR --keys=me5-5 --apply
 */

import {spawn} from 'node:child_process'
import {open, readFile, rename, unlink, writeFile} from 'node:fs/promises'
import {resolve} from 'node:path'
import {malieExclusionReason, malieSetName} from './malie-catalog.mjs'

const INDEX_URL = 'https://cdn.malie.io/file/malie-io/tcgl/export/index.json'
// Keep sync bookkeeping outside `content/`: Alinea treats every JSON file
// under that directory as a CMS entry and cannot index arbitrary state files.
const STATE_FILE = resolve('.malie-sync.json')
const LOCK_FILE = resolve('.malie-sync.lock')

interface IndexEntry {
  path: string
  name: string
  num: number
  hash: string
  abbr: string
}

type Index = Record<string, Record<string, IndexEntry>>

interface SyncState {
  version: 1
  sources: Record<string, {hash: string; path: string; syncedAt: string}>
}

interface Options {
  all: boolean
  apply: boolean
  force: boolean
  help: boolean
  keys?: Set<string>
  languages: Array<string>
}

function parseOptions(): Options {
  const options: Options = {
    all: false,
    apply: false,
    force: false,
    help: false,
    languages: []
  }

  for (const arg of process.argv.slice(2)) {
    if (arg === '--all') options.all = true
    else if (arg === '--apply') options.apply = true
    else if (arg === '--force') options.force = true
    else if (arg === '--help' || arg === '-h') options.help = true
    else if (arg.startsWith('--lang=')) {
      options.languages.push(
        ...arg
          .slice('--lang='.length)
          .split(',')
          .map(value => value.trim())
          .filter(Boolean)
      )
    } else if (arg.startsWith('--keys=')) {
      options.keys = new Set(
        arg
          .slice('--keys='.length)
          .split(',')
          .map(value => value.trim())
          .filter(Boolean)
      )
    } else {
      throw new Error(`Unknown argument: ${arg}`)
    }
  }

  if (!options.languages.length) options.languages.push('en-US')
  return options
}

function printHelp() {
  console.log(`Usage: yarn sync:malie [options]

Plan changed Malie exports by default. Applying changes requires --apply and,
when no explicit keys are supplied, --all.

Options:
  --lang=<codes>  Comma-separated languages (default: en-US)
  --keys=<keys>   Comma-separated Malie set keys
  --apply         Write the planned imports through Alinea
  --all           Confirm that every changed set in the selected language(s)
                  may be applied; required with --apply when --keys is omitted
  --force         Include sets even when their recorded hash is unchanged
  --help, -h      Show this help

Examples:
  yarn sync:malie --lang=pt-BR
  yarn sync:malie --lang=pt-BR --keys=me5-5 --apply
  yarn sync:malie --lang=pt-BR --all --apply`)
}

async function readState(): Promise<SyncState> {
  try {
    return JSON.parse(await readFile(STATE_FILE, 'utf8')) as SyncState
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw error
    return {version: 1, sources: {}}
  }
}

function cleanName(name: string) {
  return name.replace(/<\/?i>/gi, '').replace(/\s*-\s*$/u, '').trim()
}

function runImport(key: string, language: string): Promise<void> {
  const command = process.execPath
  const args = [
    resolve('node_modules/tsx/dist/cli.mjs'),
    resolve('scripts/fetch-malie-set.mts'),
    key,
    `--lang=${language}`
  ]

  return new Promise((resolvePromise, reject) => {
    const child = spawn(command, args, {
      cwd: process.cwd(),
      env: {...process.env, NODE_ENV: 'development'},
      stdio: 'inherit'
    })
    child.once('error', reject)
    child.once('exit', code => {
      if (code === 0) resolvePromise()
      else reject(new Error(`Import failed for ${language}/${key} (${code})`))
    })
  })
}

function runSiteI18nSetup(): Promise<void> {
  const command = process.execPath
  const args = [
    resolve('node_modules/tsx/dist/cli.mjs'),
    resolve('scripts/setup-site-i18n.mts')
  ]

  return new Promise((resolvePromise, reject) => {
    const child = spawn(command, args, {
      cwd: process.cwd(),
      env: process.env,
      stdio: 'inherit'
    })
    child.once('error', reject)
    child.once('exit', code => {
      if (code === 0) resolvePromise()
      else reject(new Error(`Site i18n setup failed (${code})`))
    })
  })
}

async function writeState(state: SyncState) {
  const temporary = `${STATE_FILE}.tmp`
  await writeFile(temporary, `${JSON.stringify(state, null, 2)}\n`, 'utf8')
  await rename(temporary, STATE_FILE)
}

async function checkAlineaServer() {
  const server = process.env.ALINEA_DEV_SERVER ?? 'http://localhost:4500'
  let response: Response
  try {
    response = await fetch(server, {signal: AbortSignal.timeout(5000)})
  } catch (error) {
    throw new Error(
      `Alinea is not reachable at ${server}. Start yarn dev and set ` +
        `ALINEA_DEV_SERVER when it uses a different port.`,
      {cause: error}
    )
  }
  if (!response.ok)
    throw new Error(`Alinea preflight failed at ${server}: HTTP ${response.status}`)
}

async function main() {
  const options = parseOptions()
  if (options.help) {
    printHelp()
    return
  }
  if (options.apply && !options.keys && !options.all) {
    throw new Error(
      'Refusing to apply every available set without --all. ' +
        'Use --keys=<key,...> for a bounded import or add --all explicitly.'
    )
  }
  const response = await fetch(INDEX_URL)
  if (!response.ok)
    throw new Error(`GET ${INDEX_URL} -> ${response.status} ${response.statusText}`)

  const index = (await response.json()) as Index
  const state = await readState()
  const planned: Array<{
    key: string
    language: string
    entry: IndexEntry
    previousHash?: string
  }> = []
  const skipped: Array<{language: string; key: string; reason: string}> = []
  const availableKeys = new Set<string>()

  for (const language of options.languages) {
    const entries = index[language]
    if (!entries) {
      throw new Error(
        `Language ${language} is unavailable. Available: ${Object.keys(index).join(', ')}`
      )
    }

    for (const [key, entry] of Object.entries(entries)) {
      availableKeys.add(key)
      if (options.keys && !options.keys.has(key)) continue
      const exclusionReason = malieExclusionReason(key)
      if (exclusionReason) {
        skipped.push({language, key, reason: exclusionReason})
        continue
      }
      const stateKey = `${language}/${key}`
      const previousHash = state.sources[stateKey]?.hash
      if (!options.force && previousHash === entry.hash) continue
      planned.push({key, language, entry, previousHash})
    }
  }


  if (options.keys) {
    const unknown = [...options.keys].filter(key => !availableKeys.has(key))
    if (unknown.length)
      throw new Error(`Unknown Malie set key(s): ${unknown.join(', ')}`)
  }

  if (!planned.length) {
    if (skipped.length) console.table(skipped)
    console.log('No changed Malie exports found.')
    return
  }

  if (skipped.length) {
    console.log('Auxiliary exports skipped by catalog policy:')
    console.table(skipped)
  }

  console.table(
    planned.map(({key, language, entry, previousHash}) => ({
      language,
      key,
      set: cleanName(malieSetName(language, key, entry.name)),
      records: entry.num,
      status: previousHash ? 'changed' : 'new'
    }))
  )

  if (!options.apply) {
    console.log(
      `Plan only: ${planned.length} import(s). Re-run with --apply after reviewing the list.`
    )
    return
  }

  await runSiteI18nSetup()
  await checkAlineaServer()
  let lock: Awaited<ReturnType<typeof open>>
  try {
    lock = await open(LOCK_FILE, 'wx')
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'EEXIST')
      throw new Error(
        `Another Malie sync may be running (${LOCK_FILE}). ` +
          'Remove the lock only after confirming that no sync process is active.'
      )
    throw error
  }

  try {
    await lock.writeFile(
      `${JSON.stringify({pid: process.pid, startedAt: new Date().toISOString()})}\n`
    )
    for (const item of planned) {
      console.log(
        `\nSyncing ${item.language}/${item.key}: ${cleanName(item.entry.name)}`
      )
      await runImport(item.key, item.language)

      const stateKey = `${item.language}/${item.key}`
      state.sources[stateKey] = {
        hash: item.entry.hash,
        path: item.entry.path,
        syncedAt: new Date().toISOString()
      }
      await writeState(state)
    }
  } finally {
    await lock.close()
    await unlink(LOCK_FILE).catch(() => undefined)
  }

  console.log(`\nSynced ${planned.length} Malie export(s).`)
}

main().catch(error => {
  if (error instanceof Error) {
    console.error(`Error: ${error.message}`)
    if (process.env.DEBUG) console.error(error.stack)
  } else {
    console.error(error)
  }
  process.exit(1)
})
