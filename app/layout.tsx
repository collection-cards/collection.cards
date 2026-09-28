import {cms} from '@/cms'
import Footer from '@/components/footer/Footer'
import Header from '@/components/header/Header'
import ScrollToTop from '@/components/scrolltotop/ScrollToTop'
import {SiteI18nProvider} from '@/components/sitei18n/SiteI18nProvider'
import ThemeProvider from '@/components/themeprovider/ThemeProvider'
import {getSiteLocale} from '@/lib/siteLocale.server'
import {getMessages} from '@/lib/i18n'
import {Analytics} from '@vercel/analytics/next'
import {SpeedInsights} from '@vercel/speed-insights/next'
import type {Metadata} from 'next'
import {Geist, Geist_Mono} from 'next/font/google'
import {NuqsAdapter} from 'nuqs/adapters/next/app'
import {Toaster} from 'sonner'
import {CardLanguageProvider} from '@/components/languageswitcher/CardLanguageContext'
import './globals.css'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin']
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin']
})

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getSiteLocale()
  const messages = getMessages(locale)
  return {
    title: messages.siteTitle,
    description: messages.siteDescription,
    other: {
      'apple-mobile-web-app-capable': 'yes'
    }
  }
}

export default async function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode
}>) {
  const siteLocale = await getSiteLocale()

  return (
    <html lang={siteLocale} suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <SiteI18nProvider locale={siteLocale}>
          <CardLanguageProvider>
            <ThemeProvider
              attribute="class"
              defaultTheme="system"
              enableSystem
              disableTransitionOnChange
            >
              <Header locale={siteLocale} />
              <div className="flex flex-col items-center justify-center font-sans pb-12 md:pb-18 lg:pb-24 bg-linear-to-b from-zinc-50 to-background dark:from-zinc-900">
                <NuqsAdapter>{children}</NuqsAdapter>
              </div>
              <ScrollToTop />
              <Toaster />
              <cms.previews widget />
              <Analytics />
              <SpeedInsights />
              <Footer locale={siteLocale} />
            </ThemeProvider>
          </CardLanguageProvider>
        </SiteI18nProvider>
      </body>
    </html>
  )
}
