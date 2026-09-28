import {PokemonCollection} from '@/alinea/schemas/PokemonCollection'
import {PokemonSerie} from '@/alinea/schemas/PokemonSerie'
import {PokemonSeries} from '@/alinea/schemas/PokemonSeries'
import {PokemonSet} from '@/alinea/schemas/PokemonSet'
import {cms} from '@/cms'
import Blocks from '@/components/blocks/Blocks'
import Container from '@/components/container/Container'
import {Title} from '@/components/title/Title'
import LanguageSwitcher from '@/components/languageswitcher/LanguageSwitcher'
import {Query} from 'alinea'
import {notFound} from 'next/navigation'

const fetchSerieData = async (url: string) => {
  return await cms.first({
    type: PokemonSerie,
    filter: {
      _status: 'published',
      _url: url
    },
    select: {
      title: Query.title,
      language: PokemonSerie.language,
      blocks: PokemonSerie.blocks,
      sets: Query.children({
        type: PokemonSet,
        select: {
          id: Query.id,
          sourceSetKey: PokemonSet.sourceSetKey
        },
        filter: {
          _status: 'published'
        },
        orderBy: {desc: PokemonSet.releaseDate}
      })
    }
  })
}

const fetchSerieLanguageOptions = async (
  sourceSetKeys: (string | null | undefined)[],
  currentUrl: string,
  currentTitle: string,
  currentLanguage?: string | null
) => {
  const validKeys = sourceSetKeys.filter((key): key is string => Boolean(key))
  if (validKeys.length === 0) return []

  const siblingSets = await cms.find({
    type: PokemonSet,
    filter: {
      sourceSetKey: {in: validKeys},
      _status: 'published'
    },
    select: {
      parents: Query.parents({
        type: PokemonSerie,
        select: {
          title: Query.title,
          url: Query.url,
          language: PokemonSerie.language
        }
      })
    }
  })

  const seriesByLang = new Map<
    string,
    {href: string; language: string; title: string}
  >()
  if (currentLanguage) {
    seriesByLang.set(currentLanguage, {
      href: currentUrl,
      language: currentLanguage,
      title: currentTitle
    })
  }

  for (const set of siblingSets) {
    const parentSerie = set.parents?.[0]
    if (
      parentSerie?.url &&
      parentSerie?.language &&
      !seriesByLang.has(parentSerie.language)
    ) {
      seriesByLang.set(parentSerie.language, {
        href: parentSerie.url,
        language: parentSerie.language,
        title: parentSerie.title
      })
    }
  }

  return [...seriesByLang.values()]
}

export async function generateStaticParams() {
  const data = await cms.find({
    type: PokemonCollection,
    select: {
      collection: Query.path,
      series: Query.children({
        type: PokemonSeries,
        select: {
          series: Query.path,
          serie: Query.children({
            type: PokemonSerie,
            select: {
              serie: Query.path
            }
          })
        }
      })
    }
  })

  return data.flatMap(col =>
    col.series.flatMap(ser =>
      ser.serie.map(seri => ({
        collection: col.collection,
        series: ser.series,
        serie: seri.serie
      }))
    )
  )
}

export default async function Serie({
  params
}: {
  params: Promise<{collection: string; series: string; serie: string}>
}) {
  const {collection, series, serie} = await params
  const serieUrl = `/collections/${collection}/${series}/${serie}`
  const serieData = await fetchSerieData(serieUrl)
  if (!serieData) return notFound()

  const languageOptions = await fetchSerieLanguageOptions(
    serieData.sets.map(s => s.sourceSetKey),
    serieUrl,
    serieData.title,
    serieData.language || series
  )

  const blocksWithOverview = serieData.blocks || []
  const generatedCollectionSetsOverviewBlock = {
    _index: 'collection-sets-overview-block-generated',
    _type: 'CollectionSetsOverviewBlock' as const,
    _id: 'collection-sets-overview-block-generated',
    setIds: serieData.sets.map((set, index) => ({
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
      <Title.H1>{serieData.title}</Title.H1>
      <LanguageSwitcher
        currentLanguage={serieData.language || series}
        options={languageOptions}
      />
      <Blocks blocks={blocksWithOverview} />
    </Container>
  )
}
