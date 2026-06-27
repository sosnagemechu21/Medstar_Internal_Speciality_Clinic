import { getRequestConfig } from 'next-intl/server';
import { locales } from '../../i18n.config';

export default getRequestConfig(async ({ requestLocale }) => {
  let locale = await requestLocale;

  // Ensure a valid locale is used
  if (!locale || !locales.includes(locale as any)) {
    locale = 'en';
  }

  return {
    locale,
    messages: (await import(`../../dictionaries/${locale}.json`)).default
  };
});