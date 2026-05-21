'use client'

import {cardType, CardType} from '@/consts/cardtype'
import {energy, Energy} from '@/consts/energy'
import {
  holofoilPatterns,
  Pattern,
  reverseHolofoilPatterns
} from '@/consts/pattern'
import {rarity, Rarity, rarityOrder} from '@/consts/rarity'
import {variant, Variant, variantPattern} from '@/consts/variant'
import {ImageLink} from 'alinea'
import {BookOpen, Download, GalleryHorizontal, Grid, Layers} from 'lucide-react'
import Link from 'next/link'
import {
  parseAsBoolean,
  parseAsInteger,
  parseAsStringEnum,
  useQueryState,
  useQueryStates
} from 'nuqs'
import React, {JSX, useEffect, useMemo, useRef} from 'react'
import Binder from '../binder/Binder'
import {CardProps} from '../card/Card'
import CardGrid from '../cardgrid/CardGrid'
import {PokemonCardDetailsProps} from '../pokemoncarddetails/PokemonCardDetails'
import Tooltip from '../tooltip/Tooltip'
import {Button} from '../ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '../ui/dropdown-menu'
import {ToggleGroup, ToggleGroupItem} from '../ui/toggle-group'
import EnergyFilter from './filters/EnergyFilter'
import HitPointsFilter from './filters/HitPointsFilter'
import PokemonFilter from './filters/PokemonFilter'
import RarityFilter from './filters/RarityFilter'
import TypeFilter from './filters/TypeFilter'
import VariantFilter from './filters/VariantFilter'

const pocketSizes = ['4', '9', '12', '16'] as const
const viewModes = ['grid', 'binder'] as const
const coverSizes = [
  {value: 'a4', label: 'A4'},
  {value: 'letter', label: 'Letter'}
] as const

type PocketSize = (typeof pocketSizes)[number]
type ViewMode = (typeof viewModes)[number]

type Card = PokemonCardDetailsProps & Omit<CardProps, 'onClick' | 'sizes'>

type PokemonSetOverviewProps = {
  cards: Card[]
  logo?: ImageLink<undefined> | JSX.Element
  setId?: string
}

const stackCards = (
  cards: Card[],
  stack: boolean
): Card[] | (Card & {variants: Card[]})[] => {
  if (!stack) return cards

  const cardMap: Record<string, Card & {variants: Card[]}> = {}

  return cards.reduce(
    (acc, card) => {
      const existingCard = cardMap[card.number]
      if (existingCard) {
        if (!existingCard.variants) existingCard.variants = []
        existingCard.variants.push({...card})
      } else {
        cardMap[card.number] = {...card, variants: []}
        acc.push(cardMap[card.number])
      }
      return acc
    },
    [] as (Card & {variants: Card[]})[]
  )
}

const PokemonSetOverview: React.FC<PokemonSetOverviewProps> = ({
  cards,
  logo,
  setId
}) => {
  const energyParser = parseAsStringEnum<Energy>(
    Object.keys(energy) as Energy[]
  )
  const rarityParser = parseAsStringEnum<Rarity>(
    Object.keys(rarity) as Rarity[]
  )
  const cardTypeParser = parseAsStringEnum<CardType>(
    Object.keys(cardType) as CardType[]
  )
  const variantParser = parseAsStringEnum<Variant | Pattern>([
    ...(Object.keys(variant) as Variant[]),
    ...(Object.keys(holofoilPatterns) as Pattern[]),
    ...(Object.keys(reverseHolofoilPatterns) as Pattern[])
  ])
  const pokemonParser = parseAsStringEnum<string>(
    cards.map(card => card.pokemon?.path || '')
  )
  const [filters, setFilters] = useQueryStates({
    energy: energyParser,
    hp: parseAsInteger,
    rarity: rarityParser,
    cardtype: cardTypeParser,
    variant: variantParser,
    pokemon: pokemonParser
  })
  const [viewMode, setViewMode] = useQueryState(
    'view',
    parseAsStringEnum([...viewModes]).withDefault('grid' as ViewMode)
  )
  const [pockets, setPockets] = useQueryState(
    'pockets',
    parseAsStringEnum([...pocketSizes]).withDefault('9' as PocketSize)
  )
  const [stack, setStack] = useQueryState(
    'stack',
    parseAsBoolean.withDefault(false)
  )
  const [page, setPage] = useQueryState('page', parseAsInteger.withDefault(1))

  const didMount = useRef(false)
  useEffect(() => {
    if (!didMount.current) {
      didMount.current = true
      return
    }
    setPage(null)
  }, [filters, pockets, stack, viewMode, setPage])

  const selectedEnergy = filters.energy
  const selectedHitPoints = filters.hp
  const selectedRarity = filters.rarity
  const selectedCardType = filters.cardtype
  const selectedVariant = filters.variant
  const selectedPokemon = filters.pokemon

  const availableEnergies = Array.from(
    new Set(cards.map(card => card.energy).filter(Boolean))
  )
    .filter(Boolean)
    .sort((a, b) => a!.localeCompare(b!)) as Energy[]

  const availableHitPoints = Array.from(
    new Set(
      cards
        .map(card => card.hp)
        .filter(hitPoints => hitPoints !== null && hitPoints !== undefined)
    )
  )
    .filter(Boolean)
    .sort((a, b) => a! - b!) as number[]

  const availableRarities = (
    Array.from(new Set(cards.map(card => card.rarity).filter(Boolean))).filter(
      Boolean
    ) as Rarity[]
  ).sort((a, b) => rarityOrder.indexOf(a) - rarityOrder.indexOf(b))

  const availableTypes = Array.from(
    new Set(cards.map(card => card.cardtype).filter(Boolean))
  ).filter(Boolean) as CardType[]

  const variantPatterns = Object.keys(variantPattern) as (Variant | Pattern)[]
  const availableVariants = (
    Array.from(
      new Set(
        cards
          .map(card => card.pattern || card.variant)
          .filter(
            v =>
              v &&
              (v in variant ||
                v in holofoilPatterns ||
                v in reverseHolofoilPatterns)
          )
      )
    ) as (Variant | Pattern)[]
  ).sort((a, b) => {
    const indexA = variantPatterns.indexOf(a)
    const indexB = variantPatterns.indexOf(b)
    return indexA - indexB
  })

  const availablePokemonsMap = new Map<string, {label: string; value: string}>()
  cards.forEach(card => {
    if (card.pokemon) {
      availablePokemonsMap.set(card.pokemon.path, {
        label: card.pokemon.title,
        value: card.pokemon.path
      })
    }
  })
  const availablePokemons = Array.from(availablePokemonsMap.values()).sort(
    (a, b) => a.label.localeCompare(b.label)
  )

  const filteredCards = useMemo(
    () =>
      stackCards(
        cards.filter(card => {
          if (selectedEnergy && card.energy !== selectedEnergy) return false
          if (selectedHitPoints && card.hp !== selectedHitPoints) return false
          if (selectedRarity && card.rarity !== selectedRarity) return false
          if (selectedCardType && card.cardtype !== selectedCardType)
            return false
          if (selectedVariant) {
            const cardVariant = card.pattern || card.variant
            if (cardVariant !== selectedVariant) return false
          }
          if (selectedPokemon && card.pokemon?.path !== selectedPokemon)
            return false
          return true
        }),
        stack
      ),
    [
      cards,
      selectedEnergy,
      selectedHitPoints,
      selectedRarity,
      selectedCardType,
      selectedPokemon,
      selectedVariant,
      stack
    ]
  )

  return (
    <>
      <div className="pb-10 flex gap-4 flex-wrap items-end justify-between">
        <div className="flex items-center gap-2 lg:gap-4 flex-wrap">
          <EnergyFilter
            options={availableEnergies}
            onChange={({value}) => {
              setFilters({energy: value})
            }}
            selected={selectedEnergy}
          />
          <HitPointsFilter
            options={availableHitPoints}
            onChange={({value}) => {
              setFilters({hp: value})
            }}
            selected={selectedHitPoints}
          />
          <RarityFilter
            options={availableRarities}
            onChange={({value}) => {
              setFilters({rarity: value})
            }}
            selected={selectedRarity}
          />
          <TypeFilter
            options={availableTypes}
            onChange={({value}) => {
              setFilters({cardtype: value})
            }}
            selected={selectedCardType}
          />
          <VariantFilter
            options={availableVariants}
            onChange={({value}) => {
              setFilters({variant: value})
            }}
            selected={selectedVariant}
          />
          <PokemonFilter
            options={availablePokemons}
            onChange={({value}) => {
              setFilters({pokemon: value})
            }}
            selected={selectedPokemon}
          />
        </div>
        <div className="flex items-center gap-2 lg:gap-4">
          <div className="flex items-center gap-1 lg:gap-2">
            <span className="hidden text-xs whitespace-nowrap text-muted-foreground xl:inline-block">
              View Mode
            </span>
            <ToggleGroup
              size="sm"
              type="single"
              variant="outline"
              style={{'--radius': '8px'} as React.CSSProperties}
            >
              <Tooltip text="Grid view">
                <ToggleGroupItem
                  aria-checked={viewMode === 'grid' ? 'true' : 'false'}
                  aria-label="Grid view"
                  className="p-1.5 cursor-pointer aria-[checked=true]:bg-accent aria-[checked=true]:text-accent-foreground"
                  onClick={() => {
                    setViewMode('grid')
                    setPockets(null)
                  }}
                  tabIndex={undefined}
                  value="grid"
                >
                  <Grid />
                </ToggleGroupItem>
              </Tooltip>
              <Tooltip text="Binder view">
                <ToggleGroupItem
                  aria-checked={viewMode === 'binder' ? 'true' : 'false'}
                  aria-label="Binder view"
                  className="p-1.5 cursor-pointer font-normal aria-[checked=true]:bg-accent aria-[checked=true]:text-accent-foreground"
                  onClick={() => setViewMode('binder')}
                  tabIndex={undefined}
                  value="binder"
                >
                  <BookOpen />
                </ToggleGroupItem>
              </Tooltip>
            </ToggleGroup>
          </div>
          {viewMode === 'binder' && (
            <div className="flex items-center gap-1 lg:gap-2">
              <span className="hidden text-xs whitespace-nowrap text-muted-foreground xl:inline-block">
                Pockets
              </span>
              <ToggleGroup
                size="sm"
                type="single"
                variant="outline"
                style={{'--radius': '8px'} as React.CSSProperties}
              >
                {pocketSizes.map(p => (
                  <Tooltip text={`${p}-pocket`} key={p}>
                    <ToggleGroupItem
                      aria-checked={pockets === p ? 'true' : 'false'}
                      aria-label={`${p}-pocket`}
                      className="p-1.5 px-2.5 cursor-pointer font-normal aria-[checked=true]:bg-accent aria-[checked=true]:text-accent-foreground"
                      onClick={() => {
                        setPockets(p)
                      }}
                      tabIndex={undefined}
                      value={p}
                    >
                      {p}
                    </ToggleGroupItem>
                  </Tooltip>
                ))}
              </ToggleGroup>
            </div>
          )}
          <ToggleGroup
            size="sm"
            type="single"
            variant="outline"
            style={{'--radius': '8px'} as React.CSSProperties}
          >
            <Tooltip text={stack ? 'Unstack variants' : 'Stack variants'}>
              <ToggleGroupItem
                aria-checked={stack}
                aria-label={stack ? 'Unstack variants' : 'Stack variants'}
                className="px-1.75 cursor-pointer "
                onClick={() => {
                  setStack(s => !s)
                }}
                tabIndex={undefined}
                value="stack"
              >
                {stack ? <GalleryHorizontal /> : <Layers />}
              </ToggleGroupItem>
            </Tooltip>
          </ToggleGroup>
          {setId && (
            <DropdownMenu>
              <Tooltip text="Download binder cover">
                <DropdownMenuTrigger asChild>
                  <Button
                    aria-label="Download binder cover"
                    className="px-1.75 cursor-pointer bg-transparent"
                    size="sm"
                    style={{'--radius': '8px'} as React.CSSProperties}
                    variant="outline"
                  >
                    <Download />
                  </Button>
                </DropdownMenuTrigger>
              </Tooltip>
              <DropdownMenuContent
                align="end"
                side="bottom"
                style={{'--radius': '8px'} as React.CSSProperties}
              >
                <div
                  data-slot="select-label"
                  className="text-muted-foreground px-2 py-1.5 text-xs"
                >
                  Cover size
                </div>
                {coverSizes.map(({value, label}) => (
                  <DropdownMenuItem key={value} asChild>
                    <Link
                      href={`/api/download/${setId}/binder/front/${value}`}
                      rel="noopener noreferrer"
                      className="cursor-pointer"
                    >
                      {label}
                    </Link>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>
      {viewMode === 'binder' ? (
        <Binder
          cards={filteredCards}
          isStacked={stack}
          logo={logo}
          page={page}
          pockets={Number(pockets)}
          setPage={setPage}
        />
      ) : (
        <CardGrid cards={filteredCards} isStacked={stack} />
      )}
    </>
  )
}

export default PokemonSetOverview
