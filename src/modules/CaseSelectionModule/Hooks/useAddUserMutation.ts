import {USER} from '@modules/AuthModule/Types/CommonTypes';
import {useMutation} from '@tanstack/react-query';
import {fetcher} from '@utils/Axios';
import {AxiosResponse} from 'axios';
import removeEmptyKeys from '@helpers/removeEmptyKeys';
import {ADD_USER_REQUEST} from '../Types/RequestTypes';
import {appendUserToUserByRoleListCache} from './useGetUserListByRoleQuery';
import {getAuthValue} from '@modules/AuthModule/Hooks/useAuthValue';

async function addUser(
  reqBody: ADD_USER_REQUEST,
): Promise<AxiosResponse<USER>> {
  const {realm, hospitalId, tenantId} = getAuthValue();
  return fetcher({
    url: 'users',
    method: 'POST',
    data: removeEmptyKeys({...reqBody, realm, hospitalId, tenantId}),
  });
}

function useAddUserMutation() {
  return useMutation({
    mutationFn: addUser,
    onSuccess: res => {
      appendUserToUserByRoleListCache(res?.data);
    },
  });
}

export default useAddUserMutation;
