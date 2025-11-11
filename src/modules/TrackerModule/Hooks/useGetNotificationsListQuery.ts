import {useQuery} from '@tanstack/react-query';
import {fetcher} from '@utils/Axios';
import {GET_NOTIFICATIONS_LIST_RESPONSE} from '../Types/ResponseTypes';

export const GET_NOTIFICATIONS_QUERY_KEY = 'cases/${caseId}/notifications';

async function getNotificationsList(
  caseId?: number,
): Promise<GET_NOTIFICATIONS_LIST_RESPONSE> {
  const {data} = await fetcher({url: `cases/${caseId}/notifications`});
  return data;
}
export default function useGetNotificationsListQuery(caseId?: number) {
  return useQuery({
    queryKey: [GET_NOTIFICATIONS_QUERY_KEY, caseId],
    queryFn: () => getNotificationsList(caseId),
    enabled: !!caseId,
  });
}
