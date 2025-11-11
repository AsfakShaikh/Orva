import {Strings} from '@locales/Localization';
import {
  createAddTokenInterceptor,
  createAutoRefreshAuthTokenInterceptor,
  createRefreshAuthTokenInterceptor,
} from '@modules/AuthModule/Helpers/AuthRefresh';
import {getAuthValue} from '@modules/AuthModule/Hooks/useAuthValue';
import axios, {AxiosHeaders, RawAxiosRequestHeaders} from 'axios';
import Config from 'react-native-config';
import {CustomAxiosRequestConfig} from './Types';
import {captureSentryApiError} from './Sentry';
import {HeaderSnackbarHandler} from '@components/HeaderSnackbar';

export const axiosInstance = axios.create({
  baseURL: Config.API_BASE_URL,
  timeout: 1000 * 60 * 1, // 1 minutes
  timeoutErrorMessage: 'request.timed.out',
});

createAddTokenInterceptor(axiosInstance);
createRefreshAuthTokenInterceptor(axiosInstance);
createAutoRefreshAuthTokenInterceptor(axiosInstance);

export const enableApiHeaders = (
  headers?: RawAxiosRequestHeaders | AxiosHeaders,
  includeHospitalId: boolean = true,
) => {
  const {tenantId, hospitalId, userId, session_state, realm} = getAuthValue();
  const commonHeaders: any = {
    'x-tenant-id': tenantId,
    'x-user-id': userId,
    'x-session-id': session_state,
    'x-realm': realm,
    'Content-Type': 'application/json',
    ...headers,
  };

  if (includeHospitalId) {
    commonHeaders['x-hospital-id'] = hospitalId ?? headers?.['x-hospital-id'];
  }
  axiosInstance.defaults.headers.common = commonHeaders;
};

export const fetcher = async (config: CustomAxiosRequestConfig) => {
  const {
    url,
    method,
    data,
    headers,
    baseURL,
    authRequired = true,
    includeHospitalId = true,
  } = config;
  if (baseURL) {
    axiosInstance.defaults.baseURL = baseURL;
  }
  if (headers) {
    enableApiHeaders(headers, includeHospitalId);
  }

  console.log(JSON.stringify({url, data}));
  return await axiosInstance.request({
    url,
    method: method ?? 'GET',
    data,
    authRequired,
    ...config,
  });
};

export const onError = (error: any) => {
  captureSentryApiError(error);
  console.error('API ERROR: ', error);
};

export const onSuccess = (res: any) => {
  if (!(res?.status >= 200 && res?.status <= 299)) {
    captureSentryApiError(res);
    console.error('API SUCCESS ERROR:', res);
    HeaderSnackbarHandler.attentionToast(Strings.Something_went_wrong);
  }
};
