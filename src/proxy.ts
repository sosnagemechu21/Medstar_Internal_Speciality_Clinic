import createMiddleware from 'next-intl/middleware';
import type { NextRequest } from 'next/server';
import { locales, defaultLocale } from '../i18n.config';

// next-intl's internal routing engine still works perfectly here
const intlProvider = createMiddleware({
  locales,
  defaultLocale,
  localePrefix: 'always'
});

// Next.js 16 middleware proxy
export function proxy(request: NextRequest) {
  return intlProvider(request);
}

export const config = {
  // A cleaner, explicit matcher ensuring internal NextJS assets never get caught
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next (static assets, chunks, images)
     * - api (REST endpoints)
     * - favicon.ico, images, etc.
     */
    '/((?!api|_next|static|favicon.ico|.*\\..*).*)'
  ]
};