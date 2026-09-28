# Malie synchronization

This document describes the supported process for importing and maintaining
Pokémon TCG content from the malie.io Pokémon TCG Live export.

## Goals

- Import complete sets in one or more supported languages.
- Preserve a review step before modifying CMS content.
- Re-run safely by detecting unchanged upstream exports.
- Resume after a failed set without marking incomplete work as synchronized.
- Store card images and structured card text in Alinea.

The synchronization is intentionally not an unattended production publisher.
Generated content must be reviewed, committed and deployed through the normal
repository workflow.

## Data flow

```text
Malie index.json
  -> language and set selection
  -> compare upstream hash with .malie-sync.json
  -> fetch:set for each changed set
  -> Alinea entries and media uploads
  -> update state after each successful set
  -> human review, commit and deployment
```

Malie provides one index entry per language and set. Each entry includes a
versioned export path and content hash. The synchronizer uses that hash as its
change detector; it does not rely on timestamps.

## Requirements

- A supported Node.js version and Corepack.
- Dependencies installed with Yarn 4.
- The public or private assets submodule initialized.
- `yarn dev` running so the Alinea mutation endpoint is available.
- Enough disk space for card fronts, foil layers, masks and previews.

When Alinea does not use port 4500, set its URL in the importing terminal:

```powershell
$env:ALINEA_DEV_SERVER = 'http://localhost:4501'
```

## Commands

Show command documentation:

```bash
yarn sync:malie --help
```

Plan all changed Portuguese sets without writing content:

```bash
yarn sync:malie --lang=pt-BR
```

Plan or apply a bounded selection:

```bash
yarn sync:malie --lang=pt-BR --keys=me1,me2,me5-5
yarn sync:malie --lang=pt-BR --keys=me1,me2,me5-5 --apply
```

Applying every changed set requires explicit acknowledgement:

```bash
yarn sync:malie --lang=pt-BR --all --apply
```

Every applied synchronization first runs `setup:i18n`. It creates or updates
the localized Alinea editorial pages and shared header/footer content
idempotently, so a fresh clone does not require manual CMS restructuring.
It can also be run directly:

```bash
yarn setup:i18n
```

The setup step only creates missing locale files; normal imports never
overwrite content edited in the Alinea dashboard. `yarn setup:i18n --force`
regenerates the bundled seed translations and must be used only after review.

Internally the language is stored as the BCP 47 tag `pt-BR` and published
under the canonical route `/collections/pokemon/pt-br`. The shorter `/pt` and
`/br` forms are compatibility redirects only.

This card language is separate from the site interface language. The site uses
an outer `/en` or `/pt-br` prefix, so `/pt-br/collections/pokemon/en/...`
renders Portuguese controls around English card scans and text.

To refresh only set metadata without rebuilding cards:

```bash
yarn fetch:set me1 --lang=pt-BR --metadata-only
```

Set metadata combines the Malie set key/code with localized TCGdex release
dates, logos and symbols. Curated official Pokémon assets can override sets
that are not yet available upstream. A localized description is always
created, and the UI falls back to the localized logo when editorial hero art
is absent.

Multiple languages may be selected with a comma-separated list:

```bash
yarn sync:malie --lang=en-US,pt-BR --keys=me1,me2 --apply
```

Use `--force` only when a reviewed upstream export must be reprocessed even
though its hash is unchanged.

## Imported data

For each new card, the importer creates:

- title, path and collector numbers;
- card type, Trainer subtype, stage, HP and energy type;
- rarity, illustrator and Pokédex reference when resolvable;
- regulation mark, weakness, resistance and retreat cost;
- structured attacks, abilities, rule boxes and reminder text;
- card front, foil or etched layers, generated masks and variants.

For an existing card, mapped metadata and structured text are updated. Existing
card media and variants are preserved to prevent duplicate uploads and orphaned
media records. Image replacement needs a separate reviewed maintenance mode.

## Safety controls

- Planning is the default; writes require `--apply`.
- Applying without `--keys` additionally requires `--all`.
- Unknown language and set keys fail before any import starts.
- Alinea availability is checked before writes.
- `.malie-sync.lock` prevents concurrent apply processes.
- State is written atomically after each successful set.
- A failed set is not recorded and remains pending for the next run.

Never delete `.malie-sync.lock` without confirming that no importer process is
still active.

## State and review

`.malie-sync.json` is generated on the first successful apply and is ignored by
Git. It records the upstream hash, export path and successful synchronization
time for every language/set pair. Keep it on a persistent volume or store its
equivalent in the deployment platform when incremental state must survive a
fresh checkout.

After every apply:

1. Review representative Pokémon, Trainer and Energy cards.
2. Verify fronts, holo/reverse variants, masks and card text.
3. Run lint, TypeScript and a production build against the populated instance.
4. Publish generated media and CMS data to their configured persistent stores.
5. Confirm that `git status` contains only deliberate source changes before
   committing the feature branch.

Do not commit imported catalogue rows, generated media or a local synchronization
state merely to move data between environments. The current development adapter
uses the assets submodule as local storage; production automation should target
persistent object storage or a dedicated content pipeline.

Do not commit `.part`, temporary conversion files or a stale lock.

## Recovery

If an import fails, keep the generated files for inspection and correct the
underlying error. Re-running the same command skips sets already recorded and
retries the failed and remaining sets.

If the process was forcibly terminated, first confirm that no Node, Yarn or
Alinea import is still running. Only then remove `.malie-sync.lock` and retry.

Do not edit `.malie-sync.json` merely to silence a pending import. The
state asserts that the corresponding CMS changes completed successfully.

### Auxiliary exports and incomplete catalog metadata

The Malie index contains a few feeds that are not standalone collections.
`mealt` and `svalt` contain alternate-art records belonging to other sets, and
the empty `me5-5c` feed contains no cards. The synchronizer reports and skips
these feeds instead of creating duplicate or empty collections.

Some valid sets have blank upstream names. Their localized names and hierarchy
are maintained centrally in `scripts/malie-catalog.mts`; this currently covers
the RGB mini set and the Mega Evolution and Scarlet & Violet energy sets, as
well as normalizing the promotional-set hierarchy.

## Automation

`.github/workflows/malie-sync-plan.yml` can be started manually to inspect the
live index in plan-only mode and stores the report as a workflow artifact. It
never mutates content, publishes assets or deploys the site. A schedule should
only be enabled after CI has persistent synchronization state; otherwise every
clean runner would report the whole catalogue as pending.

An unattended apply workflow should only be introduced after the assets
repository, credentials, validation and pull-request policy are available in
CI. The preferred future flow is: apply on a dedicated branch, validate, and
open a pull request rather than pushing directly to the default branch.

## Current limitations

- Upstream deletions are reported only indirectly and are not applied.
- Existing images are preserved instead of being automatically replaced.
- Editorial conflicts are not merged field by field.
- The assets repository can be large; importing all languages at once is not
  recommended.
- Malie currently covers Pokémon TCG Live-era data, not every historical set.
- The development adapter writes generated media into the assets checkout;
  production still needs a persistent publication/storage adapter.

Card imagery and trademarks remain the property of their respective owners and
are not covered by this repository's MIT source-code license.
