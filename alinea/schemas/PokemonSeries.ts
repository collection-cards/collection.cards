import { Config, Field, Infer } from "alinea";
import { defaultBlocks, seriesBlocks } from "../blocks/Blocks.schema";

export type PokemonSeries = Infer<typeof PokemonSeries>;

export const PokemonSeries = Config.type("Pokémon series", {
  fields: {
    title: Field.text("Title", { width: 0.5 }),
    path: Field.path("Path", { hidden: false, width: 0.5 }),
    language: Field.text("Language", {readOnly: true, width: 0.25}),
    blocks: Field.list("Blocks", {
      schema: { ...defaultBlocks, ...seriesBlocks },
    }),
  },
  contains: ["PokemonSerie"],
  insertOrder: "first",
});
