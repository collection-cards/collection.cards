import {
  cardLanguageCookie,
  cardLanguageFromPath,
  siteLocaleCookie,
  siteLocaleFromRoute
} from '@/lib/locales'
import {NextRequest, NextResponse} from 'next/server'

export function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname
  const segments = pathname.split('/').filter(Boolean)
  const siteLocale = siteLocaleFromRoute(segments[0])
  const cardLocale = cardLanguageFromPath(pathname)

  if (!siteLocale && !cardLocale) return NextResponse.next()

  const requestHeaders = new Headers(request.headers)
  if (siteLocale) {
    requestHeaders.set('x-site-locale', siteLocale.tag)
  }
  if (cardLocale) {
    requestHeaders.set('x-card-language', cardLocale.tag)
  }

  const target = request.nextUrl.clone()
  if (siteLocale) {
    target.pathname = `/${segments.slice(1).join('/')}`
  }

  const response = siteLocale
    ? NextResponse.rewrite(target, {request: {headers: requestHeaders}})
    : NextResponse.next({request: {headers: requestHeaders}})

  if (siteLocale) {
    response.cookies.set(siteLocaleCookie, siteLocale.tag, {
      maxAge: 60 * 60 * 24 * 365,
      path: '/',
      sameSite: 'lax'
    })
  }
  if (cardLocale) {
    response.cookies.set(cardLanguageCookie, cardLocale.tag, {
      maxAge: 60 * 60 * 24 * 365,
      path: '/',
      sameSite: 'lax'
    })
  }

  return response
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|media|admin\\.html|favicon\\.ico).*)'
  ]
}
