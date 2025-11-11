import {useQuery} from '@tanstack/react-query';
import {fetcher} from '@utils/Axios';
import {GET_ALL_USER_LIST_RESPONSE} from '../Types/ResponseTypes';

export const GET_ALL_USER_LIST_QUERY_KEY = 'users/all';

async function getAllUserList(): Promise<GET_ALL_USER_LIST_RESPONSE> {
  const {data} = await fetcher({
    url: 'users/all',
  });
  return data;
}

export default function useGetAllUserListQuery(enabled: boolean = true) {
  return useQuery({
    queryKey: [GET_ALL_USER_LIST_QUERY_KEY],
    queryFn: () => getAllUserList(),
    enabled,
  });
}
