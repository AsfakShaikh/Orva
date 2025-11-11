import {
  OptionalLocaleString,
  Strings,
  LocaleString,
} from '@locales/Localization';
import {checkIsLocale} from './checkIsLocale';

export function translate(label: OptionalLocaleString) {
  const isLocaleText = checkIsLocale(label);

  if (isLocaleText) {
    return Strings[label as LocaleString] as string;
  } else {
    return label;
  }
}
