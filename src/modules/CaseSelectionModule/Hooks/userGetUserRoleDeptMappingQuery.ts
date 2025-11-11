import {useQuery} from '@tanstack/react-query';
import {fetcher} from '@utils/Axios';
import {GET_USER_ROLE_DEPT_MAPPING_RESPONSE} from '../Types/ResponseTypes';

export const GET_USER_ROLE_DEPT_MAPPING_QUERY_KEY = 'role-department-mapping';

async function getUserRoleDeptMapping(): Promise<GET_USER_ROLE_DEPT_MAPPING_RESPONSE> {
  const {data} = await fetcher({
    url: 'role-department-mapping',
  });
  return data;
}

const useGetUserRoleDeptMappingQuery = (enabled: boolean = true) => {
  return useQuery({
    queryKey: [GET_USER_ROLE_DEPT_MAPPING_QUERY_KEY],
    queryFn: () => getUserRoleDeptMapping(),
    enabled,
  });
};

export default useGetUserRoleDeptMappingQuery;
