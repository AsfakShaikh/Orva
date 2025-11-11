import {NOTIFICATION_LOG_REQUEST} from '../Types/RequestTypes';
import {fetcher} from '@utils/Axios';
import {useMutation} from '@tanstack/react-query';
import {queryClient} from '@utils/ReactQueryConfig';
import {GET_NOTIFICATIONS_QUERY_KEY} from './useGetNotificationsListQuery';

async function notificationLog(reqBody: NOTIFICATION_LOG_REQUEST) {
  return fetcher({
    url: `cases/${reqBody.caseId}/notifications`,
    method: 'POST',
    data: reqBody,
  });
}

const useNotificationLogMutation = () => {
  return useMutation({
    mutationFn: notificationLog,
    onSuccess: (_, req) => {
      queryClient.invalidateQueries({
        queryKey: [GET_NOTIFICATIONS_QUERY_KEY, req.caseId],
      });
    },
  });
};

export default useNotificationLogMutation;
