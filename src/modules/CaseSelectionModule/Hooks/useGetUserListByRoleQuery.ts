import {useQuery} from '@tanstack/react-query';
import {fetcher} from '@utils/Axios';
import {queryClient} from '@utils/ReactQueryConfig';
import {GET_USER_LIST_BY_ROLE_RESPONSE} from '../Types/ResponseTypes';
import {USER} from '@modules/AuthModule/Types/CommonTypes';
import isNotNull from '@helpers/isNotNull';

export const GET_USER_LIST_BY_ROLE_QUERY_KEY = 'users/detail?roles={roles}';

async function getUserListByRole(
  roles?: Array<string> | null,
): Promise<GET_USER_LIST_BY_ROLE_RESPONSE> {
  const {data} = await fetcher({
    url: `users/detail?roles=${roles?.join(',')}`,
  });
  return data;
}

export default function useGetUserListByRoleQuery(
  roles?: Array<string> | null,
) {
  return useQuery({
    queryKey: [GET_USER_LIST_BY_ROLE_QUERY_KEY, roles],
    queryFn: () => getUserListByRole(roles),
    enabled: isNotNull(roles),
  });
}

export function appendUserToUserByRoleListCache(userDetail: USER) {
  queryClient.setQueryData(
    [GET_USER_LIST_BY_ROLE_QUERY_KEY, [userDetail.role]],
    (oldData: GET_USER_LIST_BY_ROLE_RESPONSE) => {
      if (oldData) {
        return [...oldData, userDetail];
      }
      return [userDetail];
    },
  );
}
