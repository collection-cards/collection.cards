import assert from 'node:assert/strict'
import test from 'node:test'

import {selectPreferredCardEditions} from './pokemonCardLocales'

test('returns one row per canonical printing in the preferred language', () => {
  const cards = [
    {_id: 'en-24', printingKey: 'me5-5:24', language: 'en-US'},
    {_id: 'pt-24', printingKey: 'me5-5:24', language: 'pt-BR'},
    {_id: 'en-25', printingKey: 'me5-5:25', language: 'en-US'}
  ]

  assert.deepEqual(
    selectPreferredCardEditions(cards, 'pt-BR').map(card => card._id),
    ['pt-24', 'en-25']
  )
})

test('uses the first available edition as a deterministic fallback', () => {
  const cards = [
    {_id: 'en-24', printingKey: 'me5-5:24', language: 'en-US'},
    {_id: 'fr-24', printingKey: 'me5-5:24', language: 'fr-FR'}
  ]

  assert.deepEqual(
    selectPreferredCardEditions(cards, 'pt-BR').map(card => card._id),
    ['en-24']
  )
})

test('does not merge legacy rows that have no canonical printing key', () => {
  const cards = [
    {_id: 'legacy-a', language: 'en-US'},
    {_id: 'legacy-b', language: 'pt-BR'}
  ]

  assert.deepEqual(
    selectPreferredCardEditions(cards, 'pt-BR').map(card => card._id),
    ['legacy-a', 'legacy-b']
  )
})
