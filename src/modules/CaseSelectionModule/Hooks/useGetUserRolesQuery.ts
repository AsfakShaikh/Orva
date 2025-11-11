import {useQuery} from '@tanstack/react-query';
import {fetcher} from '@utils/Axios';
import {GET_USER_ROLES_RESPONSE} from '../Types/ResponseTypes';

export const GET_USER_ROLES_QUERY_KEY = 'users/roles';

async function getUserRoles(): Promise<GET_USER_ROLES_RESPONSE> {
  const {data} = await fetcher({
    url: 'users/roles',
  });
  return data?.roles;
}

const useGetUserRolesQuery = (enabled: boolean = true) => {
  return useQuery({
    queryKey: [GET_USER_ROLES_QUERY_KEY],
    queryFn: () => getUserRoles(),
    enabled,
  });
};

export default useGetUserRolesQuery;
