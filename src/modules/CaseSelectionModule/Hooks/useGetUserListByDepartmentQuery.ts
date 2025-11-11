// Not in use
import {useQuery} from '@tanstack/react-query';
import {fetcher} from '@utils/Axios';
import {queryClient} from '@utils/ReactQueryConfig';
import {GET_USER_LIST_BY_DEPARTMENT_RESPONSE} from '../Types/ResponseTypes';
import {USER} from '@modules/AuthModule/Types/CommonTypes';
import isNotNull from '@helpers/isNotNull';

export const GET_USER_LIST_BY_DEPARTMENT_QUERY_KEY =
  'users/department?department={departments}';

async function getUserListByRole(
  departments?: Array<string> | null,
): Promise<GET_USER_LIST_BY_DEPARTMENT_RESPONSE> {
  const {data} = await fetcher({
    url: `users/department?department=${departments?.join(',')}`,
  });
  return data;
}

export default function useGetUserListByDepartmentQuery(
  departments?: Array<string> | null,
) {
  return useQuery({
    queryKey: [GET_USER_LIST_BY_DEPARTMENT_QUERY_KEY, departments],
    queryFn: () => getUserListByRole(departments),
    enabled: isNotNull(departments),
  });
}

export function appendUserToUserByDepartmentListCache(userDetail: USER) {
  queryClient.setQueryData(
    [GET_USER_LIST_BY_DEPARTMENT_QUERY_KEY, [userDetail.department]],
    (oldData: GET_USER_LIST_BY_DEPARTMENT_RESPONSE) => {
      if (oldData) {
        return [...oldData, userDetail];
      }
      return [userDetail];
    },
  );
}
