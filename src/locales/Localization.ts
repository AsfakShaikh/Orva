import LocalizedStrings from 'react-native-localization';
import en from './en.json';
import errorsEn from './errorsEn.json';

const enJson = {
  ...en,
  ...errorsEn,
};

export const Strings = new LocalizedStrings({
  en: enJson,
});
export type LocaleString = keyof typeof Strings;
export type OptionalLocaleString = LocaleString | string | number;
