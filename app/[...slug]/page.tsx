import {Page as PageSchema} from '@/alinea/schemas/Page'
import {cms} from '@/cms'
import Blocks from '@/components/blocks/Blocks'
import Container from '@/components/container/Container'
import {Title} from '@/components/title/Title'
import {Query} from 'alinea'
import {notFound} from 'next/navigation'
import {getSiteLocale} from '@/lib/siteLocale.server'

const fetchPage = async (slug: string) => {
  const locale = await getSiteLocale()
  return (await cms.first({
    root: 'site',
    locale,
    type: PageSchema,
    filter: {
      _status: 'published',
      path: slug
    }
  })) ?? (await cms.first({
    root: 'pages',
    type: PageSchema,
    filter: {_status: 'published', path: slug}
  }))
}

export async function generateStaticParams() {
  const data = await cms.find({
    root: 'pages',
    type: PageSchema,
    select: {
      slug: Query.path
    }
  })
  return data.map(({slug}) => ({
    slug: [slug]
  }))
}

export default async function Page({
  params
}: {
  params: Promise<{slug: string[]}>
}) {
  const slug = (await params).slug.join('/')
  const pageData = await fetchPage(slug)
  if (!pageData) return notFound()

  return (
    <Container>
      <Title.H1>{pageData.title}</Title.H1>
      <Blocks blocks={pageData.blocks} />
    </Container>
  )
}
