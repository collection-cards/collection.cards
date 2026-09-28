## Importing sets from malie.io

The `fetch:set` script downloads a Pokémon TCG set from [malie.io](https://malie.io)
and creates the matching alinea entries (series, set, cards, illustrators) including
card images, foils and generated masks.

### Usage

```bash
yarn fetch:set <malie-key> [set-path] [--lang=en-US] [--dry-run] [--metadata-only]
yarn fetch:set --help
```

| Argument      | Description                                                             |
| ------------- | ----------------------------------------------------------------------- |
| `<malie-key>` | The malie set code, e.g. `me2` (required).                              |
| `[set-path]`  | Optional. Defaults to a value derived from the malie set name.          |
| `--lang=`     | Defaults to `en-US`. Selects the malie data **and** the content branch. |
| `--dry-run`   | Offline simulation — nothing is downloaded or committed.                |
| `--metadata-only` | Refreshes set metadata without rebuilding card rows.              |

### Examples

```bash
# Offline dry-run (no dev server needed, nothing is written)
yarn fetch:set me2 --dry-run

# Real import — the alinea dev server must be running
yarn dev               # terminal 1 (keep running)
yarn fetch:set me2     # terminal 2

# Import another language (auto-creates the fr branch, serie and set)
yarn fetch:set me2 --lang=fr-FR
```

A real run automatically creates every missing level in the hierarchy
(`PokemonSeries` → `PokemonSerie` → `PokemonSet` → `PokemonCard` + `Illustrator`),
downloads the images, generates the foil masks and commits everything through alinea.

## Incremental Malie synchronization

`sync:malie` compares the hashes in the live Malie index with the last locally
applied import. It is plan-only by default, so inspecting upstream changes does
not modify Alinea content.

```bash
# Review one Portuguese set without writing anything
yarn sync:malie --lang=pt-BR --keys=me5-5

# Apply the reviewed import (requires `yarn dev` in another terminal)
yarn sync:malie --lang=pt-BR --keys=me5-5 --apply

# Review more than one language or set
yarn sync:malie --lang=en-US,pt-BR --keys=me1,me2
```

Successful imports are recorded locally in `.malie-sync.json`. This generated
runtime state is ignored by Git and is written only after each set finishes,
so a failed import remains pending for the next run. Persist that file in the
execution environment when incremental synchronization must survive a fresh
checkout. Use `--force` to plan or apply an export even when its hash has not
changed.

For the complete architecture, safeguards, operating procedure and recovery
instructions, see [docs/malie-sync.md](docs/malie-sync.md).

## Internationalization

The interface language and the printed-card language are separate. A URL such
as `/pt-br/collections/pokemon/en/...` uses Portuguese interface text while
showing the English card edition. Alinea's localized `site` and `general` roots
store editorial pages and shared layout translations; catalogue rows remain in
the neutral `pages` root and are joined across languages by canonical set/card
keys.

The header contains the only card-language selector. On series, set and card
pages it automatically uses canonical sibling URLs, and on illustrator pages
it refreshes the gallery using only that exact language. Missing translations
fall back to the selected language's catalogue, never to a mixed-language
gallery.

Applied imports run the idempotent `setup:i18n` step automatically. To refresh
only the Alinea translation scaffolding, run:

```bash
yarn setup:i18n
```

The command only fills missing locale files and preserves later edits made in
the Alinea dashboard. Pass `--force` only when intentionally regenerating the
bundled seed translations.

See [docs/multilingual-card-model.md](docs/multilingual-card-model.md) for the
identity, routing and fallback rules.

## Development checks

Run the fast validation suite before committing:

```bash
yarn check
```

It runs ESLint, TypeScript and the subset-ordering tests. A production build is
the final verification for changes to routes, Alinea schemas or imported
content:

```bash
yarn build
```

The root `proxy.ts` belongs to this repository because it implements site and
card-language routing. Imported catalogue rows, `.malie-sync.json` and card
images are generated runtime data and are intentionally not part of feature
commits. The current local Alinea adapter writes images below the `assets`
submodule; production automation must publish those files to persistent asset
storage instead of adding multi-gigabyte imports to the source repository.

### Finding the malie key

The malie key is the short set code (e.g. `me2`) that malie uses. You can find it in
the malie index:

```bash
curl -s https://cdn.malie.io/file/malie-io/tcgl/export/index.json \
  | jq -r '.["en-US"] | to_entries[] | "\(.key)\t\(.value.name)"'
```

This prints the **key** and name for every set, for example:

```
me1   Mega Evolution
me2   Mega Evolution—Phantasmal Flames
me3   Mega Evolution—Perfect Order
sv1   Scarlet & Violet
```

The value in the **first column** (`me2`) is what you pass to the script. For another
language, replace the language code (e.g. `.["fr-FR"]`).

## License

The source code of this project is licensed under the MIT License.

Card images, artwork, logos, and trademarks belong to their respective owners
and are not covered by the MIT License.

## Credits & Attribution

This project uses third-party visual assets for display and tracking purposes only. All rights remain with their respective owners.

### Card Artwork & Icons

- **Pokédex SVG Icons**  
  Source: repositorio.sbrauble.com  
  URL: https://repositorio.sbrauble.com/arquivos/up/pokedex/*.svg  
  License: © The Pokémon Company (Pokémon), Nintendo, Game Freak, Creatures, and/or Wizards of the Coast

- **Dream World SVG Artwork**  
  Curated by: collectingdreamworld  
  Source: Community archive (Google Drive)  
  URL: https://drive.google.com/drive/folders/1DD84zq6yiQI90CtPU60F-mlI-qiFJI3U  
  License: © The Pokémon Company (Pokémon), Nintendo, Game Freak, Creatures, and/or Wizards of the Coast

- **Veekun – Dream World Art**  
  Source: Veekun Pokédex Project  
  URL: https://veekun.com/dex/downloads  
  License: © The Pokémon Company (Pokémon), Nintendo, Game Freak, Creatures, and/or Wizards of the Coast

- **Pokémon energy symbols**  
  Designed by: [Korapol](https://www.etsy.com/shop/Korapol)  
  URL: https://www.etsy.com/listing/1786031822/basic-energy-inspired-pokemon-cards
  If you want to use this icon set in any of your own projects, you should buy them.

## Icons

All icons are stored in the `/icons` directory and are saved as a **`.tsx`** file.  
Each icon is defined as a Typed React component using the following structure:

```tsx
import {SVGProps} from 'react'

export function Icon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...props}>
      <path fill="currentColor" d="..." />
    </svg>
  )
}
```

### Alinea

Within Alinea, icons are sourced exclusively from the **Google Material Icons** collection on [**icones.js.org**](https://icones.js.org/collection/ic?variant=Outline). We only use the **Outline** variant of these icons to ensure a consistent and cohesive visual style throughout the project.
