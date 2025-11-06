import type { resources as common } from 'public/locales/en/common';
import type { resources as glossary } from 'public/locales/en/glossary';
import type { resources as tx } from 'public/locales/en/tx';
import type { resources as validation } from 'public/locales/en/validation';
import { defaultNS } from '../i18n';

declare module 'i18next' {
  interface CustomTypeOptions {
    enableSelector: 'optimize';
    defaultNS: typeof defaultNS;
    resources: {
      common: typeof common;
      glossary: typeof glossary;
      validation: typeof validation;
      tx: typeof tx;
    };
  }
}
