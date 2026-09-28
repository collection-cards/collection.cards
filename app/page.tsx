import {Home as HomeSchema} from '@/alinea/schemas/Home'
import {cms} from '@/cms'
import Blocks from '@/components/blocks/Blocks'
import Container from '@/components/container/Container'
import {notFound} from 'next/navigation'
import {getSiteLocale} from '@/lib/siteLocale.server'

const fetchPage = async () => {
  const locale = await getSiteLocale()
  return (await cms.first({
    root: 'site',
    locale,
    type: HomeSchema,
    filter: {
      _status: 'published'
    }
  })) ?? (await cms.first({
    root: 'pages',
    type: HomeSchema,
    filter: {_status: 'published'}
  }))
}

export default async function Home() {
  const homeData = await fetchPage()
  if (!homeData) return notFound()

  return (
    <Container className="pt-12 md:pt-18 lg:pt-24">
      <Blocks blocks={homeData.blocks} />
    </Container>
  )
}
