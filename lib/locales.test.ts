import assert from 'node:assert/strict'
import test from 'node:test'

import {
  cardLanguageFromPath,
  normalizeLocale,
  stripSiteLocaleFromPath,
  withLocalePreferences,
  withSiteLocalePath
} from './locales'

test('normalizes regional tags, routes and compatibility aliases', () => {
  assert.equal(normalizeLocale('pt-BR'), 'pt-BR')
  assert.equal(normalizeLocale('pt'), 'pt-BR')
  assert.equal(normalizeLocale('br'), 'pt-BR')
  assert.equal(normalizeLocale('es-419'), 'es-419')
  assert.equal(normalizeLocale('unknown'), null)
})

test('reads card language independently from the site locale', () => {
  assert.equal(
    cardLanguageFromPath('/pt-br/collections/pokemon/en/mega-evolution')
      ?.tag,
    'en-US'
  )
  assert.equal(cardLanguageFromPath('/pt-br/illustrators'), null)
})

test('changes the site locale without losing the card language', () => {
  assert.equal(
    withSiteLocalePath('/en/collections/pokemon/pt-br/me/set', 'pt-BR'),
    '/pt-br/collections/pokemon/pt-br/me/set'
  )
})

test('changes both language axes only when the route contains card language', () => {
  assert.equal(
    withLocalePreferences(
      '/en/collections/pokemon/en/mega-evolution',
      'pt-BR',
      'pt-BR'
    ),
    '/pt-br/collections/pokemon/pt-br/mega-evolution'
  )
  assert.equal(
    withLocalePreferences('/en/illustrators/nelnal', 'pt-BR', 'pt-BR'),
    '/pt-br/illustrators/nelnal'
  )
})

test('leaves external links untouched and strips only supported site locales', () => {
  assert.equal(
    withLocalePreferences('https://github.com/collection-cards', 'pt-BR'),
    'https://github.com/collection-cards'
  )
  assert.equal(stripSiteLocaleFromPath('/pt-br/collections'), '/collections')
  assert.equal(stripSiteLocaleFromPath('/fr/collections'), '/fr/collections')
})
