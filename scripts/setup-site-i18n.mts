/**
 * Seed the Alinea i18n roots used by the website interface.
 *
 * Catalog entries (sets/cards/illustrators) deliberately stay in the neutral
 * `pages` root because their language is the language of the printed product.
 * Editorial pages and shared layout content live in localized Alinea roots.
 */

import {createId} from 'alinea/core/Id'
import {mkdir, readFile, writeFile} from 'node:fs/promises'
import {dirname, resolve} from 'node:path'

type JsonObject = Record<string, unknown>
const force = process.argv.includes('--force')

const sitePages = [
  'index.json',
  'collections.json',
  'collections/pokemon.json',
  'illustrators.json',
  'cookie-policy.json',
  'privacy-policy.json',
  'terms-and-conditions.json'
]

const ptBR = new Map<string, string>([
  ['Home', 'Início'],
  ['Collections', 'Coleções'],
  ['Illustrators', 'Ilustradores'],
  ['Cookie policy', 'Política de cookies'],
  ['Privacy Policy', 'Política de privacidade'],
  ['Terms & conditions', 'Termos e condições'],
  ['Footer', 'Rodapé'],
  ['Contribute', 'Contribua'],
  ['Join our community', 'Participe da comunidade'],
  ['Built with ', 'Criado com '],
  ['© 2025 All rights reserved.', '© 2025 Todos os direitos reservados.'],
  [
    'The literal and graphical information presented on this website about the Pokémon Trading Card Game, including card text and images, are copyright The Pokémon Company (Pokémon), Nintendo, Game Freak, Creatures, and/or Wizards of the Coast. This website is not produced by, endorsed by, supported by, or affiliated with The Pokémon Company (Pokémon), Nintendo, Game Freak, Creatures, or Wizards of the Coast.',
    'As informações textuais e gráficas apresentadas neste site sobre o Pokémon Estampas Ilustradas, incluindo textos e imagens das cartas, pertencem à The Pokémon Company (Pokémon), Nintendo, Game Freak, Creatures e/ou Wizards of the Coast. Este site não é produzido, endossado, apoiado nem afiliado à The Pokémon Company (Pokémon), Nintendo, Game Freak, Creatures ou Wizards of the Coast.'
  ],
  [
    'Coming Soon: The Ultimate Resource for TCG Collectors',
    'Em breve: o recurso definitivo para colecionadores de TCG'
  ],
  [
    'This website is currently under construction — but something exciting is on the way!',
    'Este site ainda está em construção — mas algo especial está a caminho!'
  ],
  [
    ' aims to become the ultimate resource for TCG collectors. Our goal is to showcase trading cards in the most ',
    ' pretende se tornar o recurso definitivo para colecionadores de TCG. Nosso objetivo é apresentar as cartas da forma mais '
  ],
  ['realistic and detailed way possible', 'realista e detalhada possível'],
  [', including all ', ', incluindo todas as '],
  ['variants, effects, and print details', 'variantes, efeitos e detalhes de impressão'],
  [
    ', so collectors can easily identify and match their cards.',
    ', para que colecionadores identifiquem e comparem suas cartas com facilidade.'
  ],
  ["You'll also be able to ", 'Você também poderá '],
  ['visualize card placement', 'visualizar a disposição das cartas'],
  [
    ' inside different binder layouts — whether you use 4, 9, 12, or 16-pocket binders. Stack cards in sequence, organize them side-by-side, and see how your full collection fits together.',
    ' em diferentes modelos de fichário — com 4, 9, 12 ou 16 bolsos. Agrupe cartas em sequência, organize-as lado a lado e veja como toda a coleção fica reunida.'
  ],
  ['Powerful ', 'Ferramentas avançadas de '],
  ['filtering and search tools', 'filtro e pesquisa'],
  [
    ' will help you find exactly what you’re looking for — by energy type, rarity, variant, effect, illustrator, and more.',
    ' ajudarão você a encontrar exatamente o que procura — por tipo de energia, raridade, variante, efeito, ilustrador e muito mais.'
  ],
  ['Best of all, ', 'E o melhor: '],
  ['Collection.cards will be open source', 'Collection.cards será código aberto'],
  [
    ', inviting contributors from around the world to help build and expand this project together.',
    ', convidando pessoas do mundo todo a construir e expandir este projeto em conjunto.'
  ],
  [
    'Stay tuned — more features, previews, and updates are coming soon!',
    'Acompanhe — novos recursos, prévias e atualizações chegarão em breve!'
  ],
  [
    'Welcome to the heart of Collection.cards — where your TCG journey begins.',
    'Bem-vindo ao coração do Collection.cards — onde começa sua jornada pelo TCG.'
  ],
  ['Currently, our ', 'Atualmente, nossa '],
  ['Pokémon collection', 'coleção Pokémon'],
  [
    ' is live, offering detailed views of cards, variants, effects, and print details. Whether you’re a seasoned collector or just starting out, you can explore, organize, and visualize your cards like never before.',
    ' está disponível com visualizações detalhadas de cartas, variantes, efeitos e impressões. Você pode explorar, organizar e visualizar suas cartas, seja um colecionador experiente ou esteja começando agora.'
  ],
  [
    'This is only the beginning. Our goal is to expand beyond Pokémon to include other trading card games, and we rely on our global community to make it happen. Join the conversation on ',
    'Este é apenas o começo. Queremos ir além de Pokémon e incluir outros jogos de cartas colecionáveis, contando com a comunidade global para tornar isso possível. Participe da conversa no '
  ],
  [' or ', ' ou no '],
  [
    ', connect with fellow collectors, share tips, and stay updated on the latest additions.',
    ', conheça outros colecionadores, compartilhe dicas e acompanhe as novidades.'
  ],
  [
    'If you want to contribute directly, you can help grow the collection on ',
    'Se quiser contribuir diretamente, ajude a ampliar a coleção no '
  ],
  [
    ' — add new cards, improve details, and be part of building the ultimate TCG resource.',
    ' — adicione cartas, melhore informações e participe da criação do recurso definitivo para TCG.'
  ],
  [
    'Dive in, explore your favorite cards, and help shape the future of Collection.cards.',
    'Explore suas cartas favoritas e ajude a construir o futuro do Collection.cards.'
  ],
  [
    'This list features the illustrators whose artwork appears across a wide range of trading card games. Each artist brings a distinctive style and creative vision, shaping the visual identity and storytelling of the TCG world.',
    'Esta lista reúne ilustradores cujas artes aparecem em diversos jogos de cartas colecionáveis. Cada artista contribui com estilo e visão próprios para a identidade visual e as histórias do universo TCG.'
  ],
  [
    'Select an illustrator’s name to discover the cards they have created and explore the breadth of their artistic contributions.',
    'Selecione o nome de um ilustrador para descobrir suas cartas e conhecer melhor sua contribuição artística.'
  ],
  [
    'The Pokémon TCG is a strategic card game where players build decks, battle opponents, and explore a wide variety of Pokémon, Trainer, and Energy cards. Each series and expansion brings new mechanics, strategies, and collectible cards for players and collectors alike.',
    'O Pokémon Estampas Ilustradas é um jogo estratégico de cartas em que jogadores montam baralhos, enfrentam adversários e exploram uma grande variedade de cartas de Pokémon, Treinador e Energia. Cada série e expansão apresenta novas mecânicas, estratégias e cartas colecionáveis para jogadores e colecionadores.'
  ],
  ['We don’t like cookies either', 'Nós também não gostamos de cookies'],
  [
    'We only use cookies when they’re absolutely necessary — the kind that keep the website running properly. We don’t track you, sell your data, or use cookies for ads or analytics.',
    'Usamos cookies apenas quando são estritamente necessários para o funcionamento do site. Não rastreamos você, não vendemos seus dados e não usamos cookies para publicidade ou análise.'
  ],
  ['What our cookies do', 'Para que servem nossos cookies'],
  ['The few cookies we use are ', 'Os poucos cookies que usamos são '],
  ['strictly functional', 'estritamente funcionais'],
  [', for example:', ', por exemplo:'],
  [
    'To remember your session or login so the site works correctly.',
    'Lembrar sua sessão ou acesso para que o site funcione corretamente.'
  ],
  [
    'To save simple preferences (like your selected theme) between visits.',
    'Salvar preferências simples, como o tema escolhido, entre visitas.'
  ],
  [
    'That’s it. No hidden trackers, no marketing scripts, no third-party cookies.',
    'É só isso. Sem rastreadores ocultos, scripts de marketing ou cookies de terceiros.'
  ],
  ['Your choices', 'Suas escolhas'],
  [
    'Because we only use essential cookies, there’s nothing to opt out of — but you can block cookies entirely in your browser if you wish. Just note that some parts of the site might not work properly without them.',
    'Como usamos apenas cookies essenciais, não há cookies opcionais para recusar. Você pode bloquear todos os cookies no navegador, mas algumas partes do site talvez deixem de funcionar corretamente.'
  ],
  ['Updates', 'Atualizações'],
  [
    'If we ever decide to add any non-essential cookies (unlikely, but still), we’ll update this page and ask for your consent first.',
    'Se algum dia adicionarmos cookies não essenciais, atualizaremos esta página e pediremos seu consentimento antes.'
  ]
])

async function readJson(path: string): Promise<JsonObject> {
  return JSON.parse(await readFile(path, 'utf8')) as JsonObject
}

function translate(value: unknown): unknown {
  if (typeof value === 'string') return ptBR.get(value) ?? value
  if (Array.isArray(value)) return value.map(translate)
  if (!value || typeof value !== 'object') return value
  return Object.fromEntries(
    Object.entries(value).map(([key, child]) => [
      key,
      key.startsWith('_') ? child : translate(child)
    ])
  )
}

async function writeJsonIfChanged(path: string, value: JsonObject) {
  const next = `${JSON.stringify(value, null, 2)}\n`
  let current = ''
  try {
    current = await readFile(path, 'utf8')
  } catch {}
  // Published Alinea translations are editor-owned after their initial seed.
  // Never overwrite dashboard edits during an ordinary catalogue import.
  if (current && !force) return false
  if (current === next) return false
  await mkdir(dirname(path), {recursive: true})
  await writeFile(path, next, 'utf8')
  return true
}

async function seedSitePages() {
  let changed = 0
  const idMap = new Map<string, string>()
  for (const file of sitePages) {
    const source = await readJson(resolve('content/pages', file))
    const englishPath = resolve('content/site/en-us', file)
    let id = ''
    try {
      id = String((await readJson(englishPath))._id ?? '')
    } catch {}
    if (!id) id = createId()
    idMap.set(String(source._id), id)

    const english = {...source, _id: id}
    const portuguese = translate(english) as JsonObject
    if (await writeJsonIfChanged(englishPath, english)) changed++
    if (
      await writeJsonIfChanged(resolve('content/site/pt-br', file), portuguese)
    )
      changed++
  }
  return {changed, idMap}
}

function remapEntries(value: unknown, idMap: Map<string, string>): unknown {
  if (Array.isArray(value)) return value.map(child => remapEntries(child, idMap))
  if (!value || typeof value !== 'object') return value
  return Object.fromEntries(
    Object.entries(value).map(([key, child]) => [
      key,
      key === '_entry' && typeof child === 'string'
        ? (idMap.get(child) ?? child)
        : remapEntries(child, idMap)
    ])
  )
}

async function seedSharedLayout(idMap: Map<string, string>) {
  let changed = 0
  for (const file of ['header.json', 'footer.json']) {
    let source: JsonObject
    try {
      source = await readJson(resolve('content/general/en-us', file))
    } catch {
      source = await readJson(resolve('content/general', file))
    }
    const english = remapEntries(source, idMap) as JsonObject
    const portuguese = translate(english) as JsonObject
    if (
      await writeJsonIfChanged(
        resolve('content/general/en-us', file),
        english
      )
    )
      changed++
    if (
      await writeJsonIfChanged(
        resolve('content/general/pt-br', file),
        portuguese
      )
    )
      changed++
  }
  return changed
}

const site = await seedSitePages()
const changed = site.changed + (await seedSharedLayout(site.idMap))
console.log(
  changed
    ? `Seeded ${changed} localized Alinea content file(s).`
    : 'Localized Alinea content already exists; no editor content was overwritten.'
)
