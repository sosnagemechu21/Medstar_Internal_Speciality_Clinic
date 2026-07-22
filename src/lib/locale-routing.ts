import type { Locale } from '../../i18n.config';

import { isLocale } from '@/lib/i18n-utils';

function splitPathAndSuffix(path: string): [string, string] {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  const match = normalizedPath.match(/^([^?#]*)(.*)$/);

  if (!match) {
    return [normalizedPath, ''];
  }

  return [match[1] || '/', match[2] || ''];
}

export function getLocalizedPath(locale: Locale, path: string): string {
  if (/^[a-z]+:\/\//i.test(path)) {
    return path;
  }

  const [pathname, suffix] = splitPathAndSuffix(path);
  const segments = pathname.split('/');

  if (isLocale(segments[1])) {
    segments[1] = locale;
    return `${segments.join('/') || '/'}${suffix}`;
  }

  if (pathname === '/') {
    return `/${locale}${suffix}`;
  }

  return `/${locale}${pathname}${suffix}`;
}

export function swapLocaleInPathname(pathname: string, locale: Locale): string {
  return getLocalizedPath(locale, pathname || '/');
}