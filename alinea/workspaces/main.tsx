import { IcOutlineSettings } from "@/icons/IcOutlineSettings";
import { Config } from "alinea";

export const main = Config.workspace("collection.cards", {
  source: "content",
  mediaDir: "public/media",
  roots: {
    pages: Config.root("Pages", {
      contains: ["Page", "Collections", "Illustrators"],
    }),
    site: Config.root("Translated site", {
      contains: ["Home", "Page", "Collections", "Illustrators"],
      i18n: {
        locales: ["en-US", "pt-BR"],
      },
    }),
    general: Config.root("General", {
      contains: [],
      icon: IcOutlineSettings,
      i18n: {
        locales: ["en-US", "pt-BR"],
      },
      preview: false,
    }),
    media: Config.media(),
  },
});
