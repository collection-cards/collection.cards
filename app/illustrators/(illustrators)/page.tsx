import {Illustrator} from '@/alinea/schemas/Illustrator'
import {Illustrators as IllustratorsSchema} from '@/alinea/schemas/Illustrators'
import {PokemonCard} from '@/alinea/schemas/PokemonCard'
import {cms} from '@/cms'
import Blocks from '@/components/blocks/Blocks'
import Container from '@/components/container/Container'
import Pattern from '@/components/pattern/Pattern'
import {Title} from '@/components/title/Title'
import {blurDataURL} from '@/lib/blurDataURL'
import {Query} from 'alinea'
import {Entry} from 'alinea/core'
import Image from 'next/image'
import Link from 'next/link'
import {notFound} from 'next/navigation'
import {getCardCountLabel} from '@/lib/i18n'
import {withSiteLocalePath} from '@/lib/locales'
import {
  getPreferredCardLanguage,
  getSiteLocale
} from '@/lib/siteLocale.server'

const fetchIllustrators = async () => {
  const locale = await getSiteLocale()
  const preferredCardLanguage = await getPreferredCardLanguage()
  const localizedPage = (await cms.first({
    root: 'site',
    locale,
    type: IllustratorsSchema
  })) ?? (await cms.first({root: 'pages', type: IllustratorsSchema}))
  const illustratorsData = await cms.first({
    root: 'pages',
    type: IllustratorsSchema,
    select: {
      ...Entry,
      ...IllustratorsSchema,
      illustrators: Query.children({
        type: Illustrator,
        orderBy: {asc: Illustrator.title}
      })
    }
  })
  if (!illustratorsData || !localizedPage) return null

  const illustratorsIds = (
    illustratorsData.illustrators as ({_id: string} & Illustrator)[]
  ).map(({_id}) => _id)

  const cardsWithIllustrators = await cms.find({
    type: PokemonCard,
    select: {
      id: Query.id,
      card: PokemonCard.card,
      title: PokemonCard.title,
      printingKey: PokemonCard.printingKey,
      language: PokemonCard.language,
      illustrator: PokemonCard.illustrator
    },
    filter: {
      illustrator: {has: {_entry: {in: illustratorsIds}}},
      language: preferredCardLanguage
    },
    orderBy: {asc: Query.id}
  })
  const cardsByPrinting = new Map<
    string,
    (typeof cardsWithIllustrators)[number]
  >()
  for (const card of cardsWithIllustrators) {
    const key = card.printingKey || card.id
    if (!cardsByPrinting.has(key)) cardsByPrinting.set(key, card)
  }
  const canonicalCards = [...cardsByPrinting.values()]

  return {
    ...localizedPage,
    illustrators: (
      illustratorsData.illustrators as ({_id: string} & Illustrator)[]
    )
      .map(illustrator => {
        const cards = canonicalCards.filter(
          card => card.illustrator?._entry === illustrator._id
        )
        return {
          ...illustrator,
          cards,
          cover: cards.find(card => card.card?.src)
        }
      })
      .filter(illustrator => illustrator.cover)
  }
}

export default async function Illustrators() {
  const illustratorsData = await fetchIllustrators()
  if (!illustratorsData) return notFound()
  const siteLocale = await getSiteLocale()

  return (
    <>
      <Container>
        <Title.H1>{illustratorsData.title}</Title.H1>
        <Blocks blocks={illustratorsData.blocks} />
      </Container>
      <Pattern className="pt-24">
        <Container>
          <div className="flex w-full flex-wrap justify-center gap-12 lg:gap-x-6 lg:gap-y-12">
            {illustratorsData.illustrators.map(illustrator => {
              return (
                <Link
                  key={illustrator._id}
                  href={withSiteLocalePath(
                    `/illustrators/${illustrator.path}`,
                    siteLocale
                  )}
                  className="group flex flex-col items-center gap-4 text-center w-1/3 sm:w-1/4 md:w-1/5 lg:w-1/7"
                >
                  <div className="flex flex-col items-center gap-4 z-1">
                    <span
                      data-slot="avatar"
                      className="relative flex size-8 shrink-0 overflow-hidden rounded-full h-16 w-16 border-1 transition-all"
                    >
                      <Image
                        className="group-hover:scale-150 transition-transform duration-300 ease-in-out"
                        alt={illustrator.title}
                        src={`/media${illustrator.cover!.card!.src}`}
                        style={{
                          backgroundColor:
                            illustrator.cover!.card!.averageColor,
                          objectFit: 'cover',
                          transform: 'scale(2.5)',
                          transformOrigin: `${
                            (illustrator.cover!.card!.focus?.x ?? 0.5) * 100
                          }% ${(illustrator.cover!.card!.focus?.y ?? 0.5) * 100}%`,
                          objectPosition: `${
                            (illustrator.cover!.card!.focus?.x ?? 0.5) * 100
                          }% ${(illustrator.cover!.card!.focus?.y ?? 0.5) * 100}%`
                        }}
                        fill={true}
                        sizes="256px"
                        loading="lazy"
                        placeholder="blur"
                        blurDataURL={blurDataURL(
                          illustrator.cover!.card!.thumbHash
                        )}
                      />
                    </span>
                    <div className="flex flex-col">
                      <p className="text-foreground text-base font-semibold">
                        {illustrator.title}
                      </p>
                      <p className="text-muted-foreground text-sm">
                        {getCardCountLabel(
                          illustrator.cards.length,
                          siteLocale
                        )}
                      </p>
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        </Container>
      </Pattern>
    </>
  )
}
