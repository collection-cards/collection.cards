import assert from 'node:assert/strict'
import test from 'node:test'

import {sortPokemonCardsBySubset} from './pokemonCardOrder'

test('keeps the larger main set before a smaller subset', () => {
  const cards = [
    {printingKey: 'me5-5-rgb:2', collectorNumber: '2'},
    {printingKey: 'me5-5:2', collectorNumber: '2'},
    {printingKey: 'me5-5:1', collectorNumber: '1'},
    {printingKey: 'me5-5-rgb:1', collectorNumber: '1'},
    {printingKey: 'me5-5:3', collectorNumber: '3'}
  ]

  assert.deepEqual(
    sortPokemonCardsBySubset(cards).map(card => card.printingKey),
    ['me5-5:1', 'me5-5:2', 'me5-5:3', 'me5-5-rgb:1', 'me5-5-rgb:2']
  )
})

test('sorts collector numbers naturally inside each group', () => {
  const cards = [
    {printingKey: 'set:10', collectorNumber: '10'},
    {printingKey: 'set:2', collectorNumber: '2'},
    {printingKey: 'set:1', collectorNumber: '1'}
  ]

  assert.deepEqual(
    sortPokemonCardsBySubset(cards).map(card => card.collectorNumber),
    ['1', '2', '10']
  )
})

test('preserves first-seen group order when subsets have equal sizes', () => {
  const cards = [
    {printingKey: 'set-b:2', collectorNumber: '2'},
    {printingKey: 'set-a:2', collectorNumber: '2'},
    {printingKey: 'set-b:1', collectorNumber: '1'},
    {printingKey: 'set-a:1', collectorNumber: '1'}
  ]

  assert.deepEqual(
    sortPokemonCardsBySubset(cards).map(card => card.printingKey),
    ['set-b:1', 'set-b:2', 'set-a:1', 'set-a:2']
  )
})
