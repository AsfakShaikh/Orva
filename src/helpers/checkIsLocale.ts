import {OptionalLocaleString, Strings} from '@locales/Localization';

export function checkIsLocale(label?: OptionalLocaleString) {
  // @ts-ignore
  return label ? typeof Strings[label] === 'string' : false;
}
