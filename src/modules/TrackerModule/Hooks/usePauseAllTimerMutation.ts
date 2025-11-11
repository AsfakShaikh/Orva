import {useMutation} from '@tanstack/react-query';
import {fetcher} from '@utils/Axios';
import {PAUSE_ALL_TIMER_REQUEST} from '../Types/RequestTypes';
import {queryClient} from '@utils/ReactQueryConfig';
import {GET_TIMERS_QUERY_KEY} from './useGetTimersListQuery';

export async function pauseAllTimer(reqBody: PAUSE_ALL_TIMER_REQUEST) {
  const {caseId} = reqBody;
  const response = await fetcher({
    url: `cases/${caseId}/timers/pause/all`,
    method: 'POST',
  });
  return response;
}

export default function usePauseAllTimerMutation(cb?: () => void) {
  return useMutation({
    mutationFn: pauseAllTimer,
    onSuccess: (_, _reqBody) => {
      queryClient.invalidateQueries({
        queryKey: [GET_TIMERS_QUERY_KEY, _reqBody?.caseId],
      });
      cb?.();
    },
  });
}
