import {Strings} from '../locales/Localization';

export default function extractErrorMessage(err: any, defaultMessage?: string) {
  let errorMessage = defaultMessage ?? Strings.Something_went_wrong;
  if (err?.message.includes('{')) {
    const parsedError = JSON.parse(err.message.split('\n')[1]); // Extract JSON part
    errorMessage = parsedError.message || errorMessage;
  }
  return err ? errorMessage : null;
}
