import {useQuery} from '@tanstack/react-query';
import {fetcher} from '@utils/Axios';
import {USER} from '../Types/CommonTypes';
import useAuthValue from './useAuthValue';

const GET_USER_CONFIG_QUERY_KEY = '/users/user';

async function getUserConfig(userId?: number): Promise<USER> {
  const {data} = await fetcher({
    url: `users/user/${userId}`,
  });

  return data;
}

export default function useGetUserConfigQuery() {
  const {userId} = useAuthValue();
  return useQuery({
    queryKey: [GET_USER_CONFIG_QUERY_KEY, userId],
    queryFn: () => getUserConfig(userId),
    staleTime: Infinity,
  });
}
