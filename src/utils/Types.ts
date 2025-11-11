import {AxiosRequestConfig, AxiosRequestHeaders} from 'axios';

export type INPUT_TYPES =
  | 'text'
  | 'email'
  | 'password'
  | 'select'
  | 'radioPair'
  | 'phone'
  | 'date'
  | 'custom'
  | 'autocomplete'
  | 'geoLocation';

export type SELECT_OPTIONS = Array<{
  key: string | number;
  value: any;
  [key: string | number]: any;
}>;

export type RADIO_OPTIONS = Array<{
  key: string | number | boolean;
  value: string;
  [key: string]: any;
}>;

export enum API_STATUS {
  SUCCESS = 'success',
}

export enum SNACKBAR_TYPE {
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR',
  NORMAL = 'NORMAL',
}

export enum HEADER_SNACKBAR_TYPE {
  SUCCESS = 'SUCCESS',
  ATTENTION = 'ERROR',
  NEUTRAL = 'NORMAL',
  SUPPORT = 'SUPPORT',
  DEFAULT = 'DEFAULT',
}

export type DATE_TYPE = string | Date | number;

export interface CustomAxiosRequestConfig<D = any>
  extends AxiosRequestConfig<D> {
  authRequired?: boolean;
  skipAuthRefresh?: boolean;
  includeHospitalId?: boolean;
}

export interface CustomInternalAxiosRequestConfig<D = any>
  extends CustomAxiosRequestConfig<D> {
  headers: AxiosRequestHeaders;
}

export type noteClassificationProp = {
  categories: string[];
  caseNoteId: number;
};
