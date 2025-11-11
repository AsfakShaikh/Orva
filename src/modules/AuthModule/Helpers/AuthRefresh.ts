import {getAuthValue} from '../Hooks/useAuthValue';
import refreshAccessToken from '../Hooks/useRefreshAccessTokenMutation';
import {AxiosInstance, AxiosResponse} from 'axios';
import {CustomInternalAxiosRequestConfig} from '@utils/Types';
import {onlineManager} from '@tanstack/react-query';
import {REFRESH_TOKEN_BEFORE_TIME} from '@utils/Constants';
import getJwtTokenPayload from './getJwtTokenPayload';

const cache: any = {
  refreshCall: undefined,
  forceRefresh: false,
};

let refreshTimeout: NodeJS.Timeout;

const forceRefreshToken = async () => {
  if (!cache.refreshCall) {
    cache.refreshCall = refreshAccessToken().finally(() => {
      cache.refreshCall = undefined;
      cache.forceRefresh = false;
    });
    cache.forceRefresh = true;
  }

  return cache.refreshCall;
};

const getAuthToken = async () => {
  if (cache.forceRefresh) {
    return cache.refreshCall;
  }
  const {access_token, expires_at = 0} = getAuthValue();

  if (!onlineManager.isOnline()) {
    return access_token;
  }
  const now = Date.now();
  const remainingTime = expires_at - now;

  if (remainingTime >= REFRESH_TOKEN_BEFORE_TIME) {
    return access_token;
  }

  if (remainingTime < REFRESH_TOKEN_BEFORE_TIME) {
    return forceRefreshToken();
  }
};

function createAddTokenInterceptor(instance: AxiosInstance) {
  return instance.interceptors.request.use(
    async (config: CustomInternalAxiosRequestConfig) => {
      if (config?.authRequired) {
        const accessToken = await getAuthToken();
        config.headers.Authorization = `Bearer ${accessToken}`;
      }
      return config;
    },
  );
}

function createRefreshAuthTokenInterceptor(instance: AxiosInstance) {
  return instance.interceptors.response.use(
    (response: AxiosResponse) => response,
    async (error: any) => {
      const originalRequest = error.config;

      if (
        error?.response?.status === 401 &&
        !originalRequest?.skipAuthRefresh
      ) {
        return forceRefreshToken()
          .catch(err => Promise.reject(err))
          .then(() => {
            error.config.skipAuthRefresh = true;
            return instance.request(error.config);
          });
      } else if (error?.response) {
        const data = JSON.stringify(error?.response?.data ?? {});
        error.message = error.message + `\n ${data}`;
      }

      return Promise.reject(error);
    },
  );
}

const startAutoRefreshTokenTimer = (refresh_token?: string) => {
  if (!refresh_token) {
    return;
  }
  const refresh_expires_at = getJwtTokenPayload(refresh_token)?.exp * 1000;
  if (refreshTimeout) {
    clearTimeout(refreshTimeout);
  }
  const now = Date.now();
  const remainingTime = refresh_expires_at - now - REFRESH_TOKEN_BEFORE_TIME;

  refreshTimeout = setTimeout(() => {
    forceRefreshToken();
  }, remainingTime);
};

function createAutoRefreshAuthTokenInterceptor(instance: AxiosInstance) {
  instance.interceptors.response.use(
    async (response: AxiosResponse) => {
      const isLoginOrRefreshToken =
        response.config.url === 'users/login' ||
        response.config.url === 'users/refresh/token';

      const isSuccess = response.status >= 200 && response.status <= 299;

      if (isLoginOrRefreshToken && isSuccess) {
        startAutoRefreshTokenTimer(response?.data?.refresh_token);
      }
      return response;
    },
    error => {
      return Promise.reject(error);
    },
  );
}

const clearAutoRefreshTokenTimer = () => {
  if (refreshTimeout) {
    clearInterval(refreshTimeout);
  }
};

export {
  createAddTokenInterceptor,
  createRefreshAuthTokenInterceptor,
  forceRefreshToken,
  getAuthToken,
  startAutoRefreshTokenTimer,
  clearAutoRefreshTokenTimer,
  createAutoRefreshAuthTokenInterceptor,
};
