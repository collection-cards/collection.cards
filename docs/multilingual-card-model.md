# Multilingual card model

Status: implemented for the current English and Brazilian Portuguese catalogue.

## Problem

The current Pokémon tree uses locale nodes (`en`, `pt-br`) as ordinary content
parents. Importing the same set in a second language therefore creates another
`PokemonSet` and another `PokemonCard`. Global set lists, Pokédex pages,
illustrator pages, search and totals can count the same physical printing more
than once.

Language is presentation data, not card identity. A translated name, rules
text or scan must not create a second canonical card.

## Reference behaviour

Limitless keeps the set code and collector number as the card identity and
switches the displayed language. For example, `30C/24` is Pikachu #24 in both
English and Portuguese; the localized route changes the text and scan while
the printing remains the same.

## Decision

Use one canonical logical identity per set and card printing. Locale editions
remain separate CMS rows so the existing content tree and public URLs stay
compatible, but every row carries the same canonical key and is deduplicated
before totals or global card views are produced.

Canonical set identity:

```text
source = malie
sourceSetKey = me5-5
```

Canonical card identity:

```text
source = malie
printingKey = me5-5:24
```

The canonical identity, collector number, regulation mark, game mechanics,
Pokédex link and illustrator link are shared. Set/card titles, rules text and
card scans are localized. A localized scan may have its own media references
and foil assets without creating another `PokemonCard`.

## Two independent language axes

The site language and printed-card language are intentionally independent:

```text
/pt-br/collections/pokemon/en/...     Portuguese UI, English cards
/en/collections/pokemon/pt-br/...     English UI, Brazilian Portuguese cards
```

The site language controls navigation, buttons, filters, dates and editorial
pages. It is stored in `collection-cards-site-locale`, appears as the first URL
segment and uses Alinea's native localized roots. The card language selects the
localized product row and scan and is stored separately in
`collection-cards-card-language`.

The interface currently ships with `en-US` and `pt-BR`. The independent card
catalogue registry already recognizes every language currently exposed by the
Malie feed: `en-US`, `pt-BR`, `fr-FR`, `it-IT`, `de-DE`, `es-ES` and `es-419`.
Regional products keep distinct BCP 47 codes and routes (`es` versus
`es-419`, just as `pt-BR` remains distinct from a future `pt-PT`).

## Alinea structure

`PokemonSet.sourceSetKey` and `PokemonCard.printingKey` are read-only identity
fields populated by the importer. `language` identifies the localized row.
This incremental model is intentional. The `site` and `general` roots use
Alinea i18n for editorial pages and shared layout content. The `pages` root is
the language-neutral catalogue tree and must not enable root i18n: printed-card
languages are explicit localized rows joined by canonical keys.

Parents must be translated before their children:

```text
PokemonCollection
  -> PokemonSerie
    -> PokemonSet
      -> PokemonCard
```

The existing public URL shape can remain compatible through the Next.js route
layer:

```text
/collections/pokemon/en/mega-evolution/30th-celebration/24-pikachu
/collections/pokemon/pt-br/megaevolucao/celebracao-de-30-anos/24-pikachu
```

Both routes resolve rows with the same canonical set/card keys. Set and card
pages discover sibling languages by those keys.

Locale editions use BCP 47 tags (`en-US`, `pt-BR`) in content. Brazilian
Portuguese uses the canonical `/pt-br` URL segment; `/pt` and `/br` are
permanent compatibility redirects. This leaves `/pt-pt` available for a
future Portuguese (Portugal) catalogue without conflating the two products.

## Counting and navigation rules

- Count canonical `printingKey` values, never locale rows.
- Count finish variants only when the UI explicitly reports physical variants.
- Illustrator pages query only the selected card locale and return each
  canonical printing once; they never mix fallback-language rows or expand
  finish variants into apparent duplicate cards.
- A single card-language selector is shown in the header. Set and card pages
  register their canonical sibling URLs with that selector instead of
  rendering a second, competing control.
- Changing card language opens the exact canonical set/card when that locale
  is available. If it has not been imported, navigation falls back to the
  selected language's catalogue rather than showing a page in the wrong
  language.
- Changing the site language preserves the selected card language and route.
- Search uses the requested locale and may optionally search fallback locales,
  but merges matches by canonical ID.
- When collector numbers restart inside a subset, cards are grouped by their
  printing-key prefix. The largest group is treated as the main set and smaller
  groups follow it, with natural numeric ordering inside every group.

## Set metadata and visual fallbacks

The importer stores the upstream set key separately from the public display
code. Pages and cards always show the source set key for unambiguous support
and debugging, while the set symbol uses the imported image when available and
falls back to a text badge containing the display code.

Set metadata is localized per card language. TCGdex and reviewed catalogue
overrides provide release dates, logos and symbols that Malie's card export
does not contain. Collection cards prefer editorial hero artwork and fall back
to the localized set logo when no usable hero exists; a broken media reference
is cleared during a metadata refresh instead of permanently hiding the
fallback.

## Import flow

1. Resolve the Malie set key to a localized set row and assign `sourceSetKey`.
2. Resolve each collector number to `printingKey = <setKey>:<number>`.
3. Create/update the requested locale row with that canonical key.
4. Link an existing English set/card row to the same key when present.
5. Upload localized scans to ASCII-only media filenames.
6. Validate counts, locale fallback, language links and representative images.
7. Record the source hash only after the entire locale import succeeds.

Before an applied import, `scripts/setup-site-i18n.mts` idempotently seeds the
Alinea `site` and `general` translations. This makes a fresh installation use
the same locale structure and default translations without manual dashboard
repairs.

Auxiliary feeds (`mealt`, `svalt`, and empty `me5-5c`) remain excluded until
alternate-art mapping is implemented explicitly.

## Migration sequence

1. Add canonical set/card keys and language metadata.
2. Treat matching English and Portuguese rows as locale editions of one key.
3. Import both 30th Celebration editions and verify the merged identity.
4. Verify that the collection, set, Pokédex and illustrator totals do not
   change when Portuguese is enabled.
5. Verify English/Portuguese switching for Pikachu #24, Nidoran♀ #87,
   Poké Tablet #126 and Substituição #127.
6. Resume the remaining Portuguese imports incrementally.

## Acceptance criteria

- One canonical key (`me5-5:24`) across every locale.
- English and Portuguese scans/text render correctly from that ID.
- Adding Portuguese does not double set/card/Pokédex/illustrator totals.
- Locale fallback is deterministic when a translation is unavailable.
- Re-running the importer is idempotent and uploads no duplicate media.
- No Unicode characters are used in generated paths or physical media names.
