import {enableApiHeaders, fetcher} from '@utils/Axios';
import {REFRESH_ACCESS_TOKEN_REQUEST} from '../Types/RequestTypes';
import {getAuthValue, updateAuthValue} from './useAuthValue';
import {captureSentryApiError} from '@utils/Sentry';
import {toggleSessionTimeoutAlert} from '../Components/SessionTimeoutAlert';
import {REFRESH_ACCESS_TOKEN_RESPONSE} from '../Types/ResponseTypes';
import getJwtTokenPayload from '../Helpers/getJwtTokenPayload';

async function refreshAccessToken(): Promise<REFRESH_ACCESS_TOKEN_RESPONSE> {
  const {refresh_token: refreshToken, user, isLoggedIn} = getAuthValue();

  const reqBody: REFRESH_ACCESS_TOKEN_REQUEST = {
    refreshToken: refreshToken,
    realm: user?.realm,
  };
  return fetcher({
    url: 'users/refresh/token',
    method: 'POST',
    data: reqBody,
    authRequired: false,
    skipAuthRefresh: true,
  })
    .then(
      res => {
        const {
          access_token,
          refresh_token,
          expires_in,
          refresh_expires_in,
          session_state,
        } = res?.data ?? {};

        const expires_at = getJwtTokenPayload(access_token)?.exp * 1000;
        const refresh_expires_at =
          getJwtTokenPayload(refresh_token)?.exp * 1000;

        updateAuthValue({
          access_token,
          refresh_token,
          expires_at,
          refresh_expires_at,
          expires_in,
          refresh_expires_in,
          session_state,
        });

        enableApiHeaders();
        return access_token;
      },
      error => {
        captureSentryApiError(error);
        if (isLoggedIn) {
          toggleSessionTimeoutAlert();
        }
      },
    )
    .catch(error => {
      captureSentryApiError(error);
      if (isLoggedIn) {
        toggleSessionTimeoutAlert();
      }
    });
}

export default refreshAccessToken;
