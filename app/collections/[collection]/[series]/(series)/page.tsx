import {PokemonCollection} from '@/alinea/schemas/PokemonCollection'
import {PokemonSeries} from '@/alinea/schemas/PokemonSeries'
import {PokemonSet} from '@/alinea/schemas/PokemonSet'
import {cms} from '@/cms'
import Blocks from '@/components/blocks/Blocks'
import Container from '@/components/container/Container'
import {Title} from '@/components/title/Title'
import {Query} from 'alinea'
import {notFound} from 'next/navigation'
import LanguageSwitcher from '@/components/languageswitcher/LanguageSwitcher'
import {localeFromRoute, normalizeLocale} from '@/lib/locales'

const fetchLanguageOptions = async (collection: string) => {
  const branches = await cms.find({
    type: PokemonSeries,
    select: {
      href: Query.url,
      language: PokemonSeries.language,
      path: Query.path,
      title: Query.title,
      parents: Query.parents({select: {path: Query.path}})
    },
    filter: {_status: 'published'}
  })

  return branches
    .filter(branch => branch.parents.some(parent => parent.path === collection))
    .map(branch => ({
      href: branch.href,
      language: normalizeLocale(branch.language || branch.path),
      title: branch.title
    }))
    .filter(option => option.language)
}

const fetchSeriesData = async (url: string) => {
  return await cms.first({
    type: PokemonSeries,
    filter: {
      _status: 'published',
      _url: url
    },
    select: {
      title: Query.title,
      blocks: PokemonSeries.blocks,
      sets: Query.children({
        depth: 2,
        type: PokemonSet,
        select: {
          id: Query.id
        },
        filter: {
          _status: 'published'
        },
        orderBy: {desc: PokemonSet.releaseDate}
      })
    }
  })
}

export async function generateStaticParams() {
  const data = await cms.find({
    type: PokemonCollection,
    select: {
      collection: Query.path,
      series: Query.children({
        type: PokemonSeries,
        select: {
          series: Query.path
        }
      })
    }
  })

  return data.flatMap(col =>
    col.series.map(ser => ({
      collection: col.collection,
      series: ser.series
    }))
  )
}

export default async function Series({
  params
}: {
  params: Promise<{collection: string; series: string}>
}) {
  const {collection, series} = await params
  const seriesData = await fetchSeriesData(
    `/collections/${collection}/${series}`
  )
  if (!seriesData) return notFound()

  const currentLocale = localeFromRoute(series)
  const languageOptions = currentLocale
    ? await fetchLanguageOptions(collection)
    : []

  const blocksWithOverview = seriesData.blocks || []
  const generatedCollectionSetsOverviewBlock = {
    _index: 'collection-sets-overview-block-generated',
    _type: 'CollectionSetsOverviewBlock' as const,
    _id: 'collection-sets-overview-block-generated',
    setIds: seriesData.sets.map((set, index) => ({
      _id: `set-${index}`,
      _index: `a${index}`,
      _type: 'entry' as const,
      _entry: set.id
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    })) as any[]
  }

  const index = blocksWithOverview.findIndex(
    block => block._type === 'CollectionSetsOverviewBlock'
  )
  if (index === -1) {
    blocksWithOverview.push(generatedCollectionSetsOverviewBlock)
  } else {
    blocksWithOverview[index] = generatedCollectionSetsOverviewBlock
  }

  return (
    <Container>
      <div className="flex flex-wrap items-start justify-between gap-4 pb-5">
        <Title.H1>{seriesData.title}</Title.H1>
        <LanguageSwitcher
          currentLanguage={currentLocale?.tag}
          options={languageOptions}
        />
      </div>
      <Blocks blocks={blocksWithOverview} />
    </Container>
  )
}
