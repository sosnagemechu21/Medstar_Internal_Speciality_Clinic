import { defaultLocale, locales, type Locale } from '../../i18n.config';

function capitalize(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim() !== '';
}

export function isLocale(value: string | null | undefined): value is Locale {
  return typeof value === 'string' && locales.includes(value as Locale);
}

export function resolveLocale(...candidates: Array<string | null | undefined>): Locale {
  for (const candidate of candidates) {
    if (isLocale(candidate)) {
      return candidate;
    }
  }

  return defaultLocale;
}

function getLocalizedKeys(fieldName: string, locale: Locale): string[] {
  return [`${fieldName}${capitalize(locale)}`, `${fieldName}_${locale}`];
}

/**
 * Retrieves a localized field value from an object whose fields follow the
 * Prisma localized field convention (e.g. `nameEn`, `nameAm`, `bioEn`,
 * `bioAm`). Snake_case fields are also supported.
 *
 * @param item      - The object containing the localized fields.
 * @param fieldName - The field name prefix, e.g. `"name"`, `"bio"`, `"firstName"`.
 * @param locale    - The active locale (`"en"` or `"am"`).
 * @returns The localized string value, or the English fallback if the localized
 *          value is absent/empty.
 *
 * @example
 * getLocalizedField(doctor, "bio", "am")
 * // Returns doctor.bio_am if non-empty, otherwise doctor.bio_en
 */
export function getLocalizedField<T extends Record<string, unknown>>(
  item: T,
  fieldName: string,
  locale: Locale
): string {
  for (const key of getLocalizedKeys(fieldName, locale)) {
    const value = item[key as keyof T];
    if (isNonEmptyString(value)) {
      return value;
    }
  }

  for (const key of getLocalizedKeys(fieldName, 'en')) {
    const value = item[key as keyof T];
    if (isNonEmptyString(value)) {
      return value;
    }
  }

  return '';
}
