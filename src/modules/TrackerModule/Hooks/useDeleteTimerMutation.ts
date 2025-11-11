import {useMutation} from '@tanstack/react-query';
import {fetcher} from '@utils/Axios';
import {DELETE_TIMER_REQUEST} from '../Types/RequestTypes';
import {deleteTimerFromQueryCache} from './useGetTimersListQuery';

async function deleteTimer(reqBody: DELETE_TIMER_REQUEST) {
  return fetcher({
    url: `cases/${reqBody?.caseId}/timers/${reqBody?.timerId}`,
    method: 'DELETE',
  });
}

export default function useDeleteTimerMutation(cb?: () => void) {
  return useMutation({
    mutationFn: deleteTimer,
    onSuccess: (_, reqBody) => {
      deleteTimerFromQueryCache({
        caseId: reqBody?.caseId,
        timerId: reqBody?.timerId,
      });
      cb?.();
    },
  });
}
