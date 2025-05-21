'use client';

import { useEffect, useState } from 'react';
import i18next from 'i18next';
import { initReactI18next, useTranslation as useTranslationOrg } from 'react-i18next';
import resourcesToBackend from 'i18next-resources-to-backend';
import { getOptions } from './settings';
import { Locale } from './settings';

// 
i18next
  .use(initReactI18next)
  .use(resourcesToBackend((language: string, namespace: string) => 
    import(`../../../public/locales/${language}/${namespace}.json`)
  ))
  .init(getOptions());

export function useTranslation(lng: Locale, ns: string = 'common') {
  const [initialized, setInitialized] = useState(false);
  const ret = useTranslationOrg(ns);
  const { i18n } = ret;

  useEffect(() => {
    if (i18n.resolvedLanguage === lng) return;
    
    i18n
      .changeLanguage(lng)
      .then(() => setInitialized(true))
      .catch((e) => console.error('Failed to change language:', e));
  }, [lng, i18n]);

  if (!initialized && i18n.resolvedLanguage !== lng) {
    return { ...ret, t: () => '' };
  }

  return ret;
} 