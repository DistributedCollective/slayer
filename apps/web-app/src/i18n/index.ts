import i18n from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import Backend, { type HttpBackendOptions } from 'i18next-http-backend';
import { initReactI18next } from 'react-i18next';

export const defaultNS = 'common';

i18n
  .use(Backend)
  .use(LanguageDetector)
  .use(initReactI18next)
  .init<HttpBackendOptions>({
    load: 'languageOnly',
    fallbackLng: 'en',
    // debug: true,

    interpolation: {
      escapeValue: false, // react already safes from xss => https://www.i18next.com/translation-function/interpolation#unescape
    },

    backend: {
      loadPath: '/locales/{{lng}}/{{ns}}.json',
      // addPath: '/locales/{{lng}}/{{ns}}.missing.json',
    },

    defaultNS,
    // saveMissing: true,
  });

export default i18n;
