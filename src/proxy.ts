import createMiddleware from 'next-intl/middleware';
import { locales, defaultLocale } from '../i18n.config';

// next-intl's internal routing engine still works perfectly here
const intlProvider = createMiddleware({
  locales,
  defaultLocale,
  localePrefix: 'always'
});

// Next.js 16 expects an explicit "proxy" function export
export function proxy(request: any) {
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