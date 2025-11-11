export const GET_LANGUAGES_QUERY_KEY = 'user/languages';

export type SETTINGS = {
  timeFormat: string;
  enableEarcons: boolean;
  languageId?: number;
};

export type LANGUAGE = {
  id: number;
  name: string;
  active: boolean;
};
