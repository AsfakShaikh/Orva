// Not in use
import {useQuery} from '@tanstack/react-query';
import {fetcher} from '@utils/Axios';
import {GET_NOTIFICATION_PREF_RESPONSE} from '../Types/ResponseTypes';

export const GET_NOTIFICATION_PREF_QUERY_KEY =
  'GET_NOTIFICATION_PREF_QUERY_KEY';

async function getNotificationPref(): Promise<GET_NOTIFICATION_PREF_RESPONSE> {
  const {data} = await fetcher({
    url: 'users/notification/config',
  });

  return data;
}

export default function useGetNotificationPrefQuery() {
  return useQuery({
    queryKey: [GET_NOTIFICATION_PREF_QUERY_KEY],
    queryFn: getNotificationPref,
    staleTime: Infinity,
  });
}
