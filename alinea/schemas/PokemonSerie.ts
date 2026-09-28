import { Config, Field, Infer } from "alinea";
import { defaultBlocks, serieBlocks } from "../blocks/Blocks.schema";
import { PokemonSet } from "./PokemonSet";

export type PokemonSerie = Infer<typeof PokemonSerie>;

export const PokemonSerie = Config.type("Pokémon series", {
  fields: {
    title: Field.text("Title", { width: 1 }),
    path: Field.path("Path", { hidden: false }),
    language: Field.text("Language", {readOnly: true, width: 0.25}),
    blocks: Field.list("Blocks", {
      schema: { ...defaultBlocks, ...serieBlocks },
    }),
  },
  contains: ["PokemonSet"],
  orderChildrenBy: { desc: PokemonSet.releaseDate },
});
