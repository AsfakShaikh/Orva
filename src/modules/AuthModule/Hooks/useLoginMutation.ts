import {useMutation} from '@tanstack/react-query';
import {enableApiHeaders, fetcher} from '@utils/Axios';
import {AxiosResponse} from 'axios';
import {updateAuthValue} from './useAuthValue';
import {LOGIN_REQUEST} from '../Types/RequestTypes';
import {LOGIN_RESPONSE} from '../Types/ResponseTypes';
import getJwtTokenPayload from '../Helpers/getJwtTokenPayload';
function login(req: LOGIN_REQUEST): Promise<AxiosResponse<LOGIN_RESPONSE>> {
  return fetcher({
    url: 'users/login',
    method: 'POST',
    data: req,
    authRequired: false,
    skipAuthRefresh: true,
  });
}

export default function useLoginMutation(cb?: () => void) {
  return useMutation({
    mutationFn: login,
    onSuccess: res => {
      const {
        access_token,
        refresh_token,
        expires_in,
        refresh_expires_in,
        tenantId,
        hospitalId,
        firstName,
        LastName,
        userId,
        session_state,
        realm,
      } = res?.data ?? {};

      enableApiHeaders({
        'x-tenant-id': tenantId,
        'x-hospital-id': hospitalId,
        'x-user-id': userId,
        'x-session-id': session_state,
        'x-realm': realm,
      });

      const expires_at = getJwtTokenPayload(access_token)?.exp * 1000;
      const refresh_expires_at = getJwtTokenPayload(refresh_token)?.exp * 1000;

      updateAuthValue({
        isLoggedIn: true,
        tenantId,
        hospitalId,
        access_token,
        refresh_token,
        expires_at,
        refresh_expires_at,
        expires_in,
        refresh_expires_in,
        firstName,
        LastName,
        userId,
        session_state,
        realm,
      });

      cb?.();
    },
  });
}
