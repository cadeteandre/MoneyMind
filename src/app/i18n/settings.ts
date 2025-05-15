export const i18n = {
  defaultLocale: 'en',
  locales: ['pt', 'en', 'es', 'de'],
} as const;

export type Locale = (typeof i18n)['locales'][number];

export function getOptions(lng: Locale = i18n.defaultLocale, ns = 'common') {
  return {
    // debug: true,
    supportedLngs: i18n.locales,
    fallbackLng: i18n.defaultLocale,
    lng,
    fallbackNS: 'common',
    defaultNS: 'common',
    ns
  };
} 