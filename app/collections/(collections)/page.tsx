import {Collections as CollectionsSchema} from '@/alinea/schemas/Collections'
import {cms} from '@/cms'
import Blocks from '@/components/blocks/Blocks'
import Container from '@/components/container/Container'
import {Title} from '@/components/title/Title'
import {notFound} from 'next/navigation'
import {getSiteLocale} from '@/lib/siteLocale.server'

const fetchPage = async () => {
  const locale = await getSiteLocale()
  return (await cms.first({
    root: 'site',
    locale,
    type: CollectionsSchema,
    filter: {
      _status: 'published'
    }
  })) ?? (await cms.first({
    root: 'pages',
    type: CollectionsSchema,
    filter: {_status: 'published'}
  }))
}

export default async function Collections() {
  const collectionsData = await fetchPage()
  if (!collectionsData) return notFound()

  return (
    <Container>
      <Title.H1>{collectionsData.title}</Title.H1>
      <Blocks blocks={collectionsData.blocks} />
    </Container>
  )
}
