## Importing sets from malie.io

The `fetch:set` script downloads a Pokémon TCG set from [malie.io](https://malie.io)
and creates the matching alinea entries (series, set, cards, illustrators) including
card images, foils and generated masks.

### Usage

```bash
yarn fetch:set <malie-key> [set-path] [--lang=en-US] [--dry-run]
```

| Argument      | Description                                                             |
| ------------- | ----------------------------------------------------------------------- |
| `<malie-key>` | The malie set code, e.g. `me2` (required).                              |
| `[set-path]`  | Optional. Defaults to a value derived from the malie set name.          |
| `--lang=`     | Defaults to `en-US`. Selects the malie data **and** the content branch. |
| `--dry-run`   | Offline simulation — nothing is downloaded or committed.                |

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
