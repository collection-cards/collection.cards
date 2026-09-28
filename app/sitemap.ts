import {cms} from '@/cms'
import {Query} from 'alinea'
import type {MetadataRoute} from 'next'
import {supportedSiteLocales, withSiteLocalePath} from '@/lib/locales'

const getChangeFrequency = (
  type: string
): MetadataRoute.Sitemap[number]['changeFrequency'] => {
  switch (type) {
    case 'Home':
      return 'daily'
    case 'Page':
      return 'weekly'
    case 'Illustrators':
    case 'Pokedex':
    case 'PokemonCollection':
    case 'PokemonSet':
      return 'yearly'
    case 'Collections':
    case 'Illustrator':
    case 'Pokemon':
    case 'PokemonSeries':
    case 'PokemonSerie':
      return 'monthly'
    default:
      console.log(`Missing change frequency for type: ${type}`)
      return 'monthly'
  }
}

const getPriority = (type: string): number => {
  switch (type) {
    case 'Page':
    case 'PokemonCollection':
    case 'Collections':
      return 0.5
    case 'PokemonSeries':
      return 0.7
    case 'Illustrators':
    case 'Pokedex':
    case 'PokemonSerie':
      return 0.8
    case 'Home':
      return 0.9
    case 'Illustrator':
    case 'Pokemon':
    case 'PokemonSet':
      return 1.0
    default:
      console.log(`Missing priority for type: ${type}`)
      return 0.5
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [catalogPages, localizedPages] = await Promise.all([
    cms.find({
      workspace: 'main',
      root: 'pages',
      select: {
        url: Query.url,
        type: Query.type
      },
      filter: {
        _root: 'pages',
        _type: {
          notIn: ['PokemonCard', 'Home', 'Page', 'Collections', 'Illustrators']
        }
      },
      orderBy: [{asc: Query.url}]
    }),
    cms.find({
      workspace: 'main',
      root: 'site',
      select: {
        url: Query.url,
        type: Query.type
      }
    })
  ])

  return [
    ...localizedPages.map(page => ({
      url: `https://collection.cards${page.url.replace(/^\/en-us(?=\/|$)/, '/en')}`,
      changeFrequency: getChangeFrequency(page.type),
      priority: getPriority(page.type)
    })),
    ...catalogPages.flatMap(page =>
      supportedSiteLocales.map(locale => ({
        url: `https://collection.cards${withSiteLocalePath(page.url, locale.tag)}`,
        changeFrequency: getChangeFrequency(page.type),
        priority: getPriority(page.type)
      }))
    )
  ] as MetadataRoute.Sitemap
}
