import {Pokemon} from '@/alinea/schemas/Pokemon'
import {PokemonCard} from '@/alinea/schemas/PokemonCard'
import {cms} from '@/cms'
import Blocks from '@/components/blocks/Blocks'
import Container from '@/components/container/Container'
import Evolutions from '@/components/evolutions/Evolutions'
import NoResults from '@/components/noresults/NoResults'
import PokedexIcon from '@/components/pokedexicon/PokedexIcon'
import PokemonSetOverview from '@/components/pokemonsetoverview/PokemonSetOverview'
import {Title} from '@/components/title/Title'
import {fetchPokemonCards} from '@/server/fetchPokemonCards'
import {Query} from 'alinea'
import {notFound} from 'next/navigation'
import {Suspense} from 'react'
import {getMessages} from '@/lib/i18n'
import {
  getPreferredCardLanguage,
  getSiteLocale
} from '@/lib/siteLocale.server'

const fetchPokemonData = async (pokemonId: string) => {
  const pokemonCardIds = await cms.find({
    type: PokemonCard,
    select: {id: Query.id},
    filter: {
      _status: 'published',
      pokemon: {has: {_entry: {in: [pokemonId]}}}
    },
    orderBy: {asc: Query.id}
  })

  return await fetchPokemonCards(
    pokemonCardIds.map(pc => pc.id),
    await getPreferredCardLanguage()
  )
}

export async function generateStaticParams() {
  const data = await cms.find({
    type: Pokemon,
    select: {
      path: Query.path
    },
    orderBy: {
      asc: Pokemon.number
    }
  })

  return data.map(pokemon => ({
    collection: 'pokemon',
    pokemon: pokemon.path
  }))
}

export default async function PokemonPage({
  params
}: {
  params: Promise<{collection: string; pokemon: string}>
}) {
  const {pokemon} = await params

  const pokemonData = await cms.first({
    type: Pokemon,
    select: {
      blocks: Pokemon.blocks,
      evolvesFrom: Pokemon.evolvesFrom,
      evolvesTo: Pokemon.evolvesTo,
      id: Query.id,
      number: Pokemon.number,
      title: Query.title
    },
    filter: {
      path: pokemon
    }
  })

  if (!pokemonData) return notFound()

  const evolvesFrom = await cms.find({
    type: Pokemon,
    select: {
      title: Query.title,
      path: Query.path
    },
    filter: {
      evolvesTo: {
        includes: {
          _entry: {
            in: pokemonData.evolvesFrom ? [pokemonData.evolvesFrom._entry] : []
          }
        }
      }
    }
  })
  evolvesFrom.push(pokemonData.evolvesFrom)

  const evolvesAfterTo = (
    await cms.find({
      type: Pokemon,
      select: {
        title: Query.title,
        path: Query.path,
        number: Pokemon.number
      },
      filter: {
        evolvesFrom: {
          has: {
            _entry: {
              in: (pokemonData.evolvesTo &&
              Object.keys(pokemonData.evolvesTo).length
                ? pokemonData.evolvesTo
                : []
              ).map(e => e._entry)
            }
          }
        }
      }
    })
  ).sort((a, b) => (a.number || 0) - (b.number || 0))

  const cards = await fetchPokemonData(pokemonData.id)
  const messages = getMessages(await getSiteLocale())

  return (
    <Container>
      <div className="flex flex-col sm:flex-row sm:flex-wrap gap-4 pb-5 items-start">
        <Title.H1>
          {pokemonData.title}
          <span className="ml-2 text-gray-400 dark:text-gray-300/75 font-normal text-sm">
            #{pokemonData.number}
          </span>
        </Title.H1>
        <Evolutions
          evolvesFrom={evolvesFrom}
          evolvesTo={pokemonData.evolvesTo}
          evolvesAfterTo={evolvesAfterTo}
          currentPokemonTitle={pokemonData.title}
        />
      </div>
      <Blocks blocks={pokemonData.blocks} />
      {!cards || cards.length === 0 ? (
        <NoResults
          contribute={true}
          title={`${messages.noCardsFor} ${pokemonData.title}`}
          description={messages.pokemonNoCardsDescription}
        />
      ) : (
        <Suspense>
          <PokemonSetOverview
            cards={cards}
            logo={
              pokemonData.number ? (
                <PokedexIcon
                  number={pokemonData.number}
                  width={92}
                  height={92}
                  aria-label={pokemonData.title}
                />
              ) : undefined
            }
          />
        </Suspense>
      )}
    </Container>
  )
}
