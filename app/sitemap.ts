import {cms} from '@/cms'
import {Query} from 'alinea'
import type {MetadataRoute} from 'next'

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
  const pages = await cms.find({
    workspace: 'main',
    root: 'pages',
    select: {
      url: Query.url,
      type: Query.type
    },
    filter: {
      _root: 'pages',
      _type: {
        isNot: 'PokemonCard'
      }
    },
    orderBy: [{asc: Query.url}]
  })

  return pages.map(page => ({
    url: `https://collection.cards${page.url}`,
    changeFrequency: getChangeFrequency(page.type),
    priority: getPriority(page.type)
  })) as MetadataRoute.Sitemap
}
