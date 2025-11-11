import {useMutation} from '@tanstack/react-query';
import {fetcher} from '@utils/Axios';
import {DISMISS_ALL_TIMER_REQUEST} from '../Types/RequestTypes';
import {queryClient} from '@utils/ReactQueryConfig';
import {GET_TIMERS_QUERY_KEY} from './useGetTimersListQuery';

export async function dismissAllTimers(reqBody: DISMISS_ALL_TIMER_REQUEST) {
  const {caseId, excludeTimerIds} = reqBody;
  const response = await fetcher({
    url: `cases/${caseId}/timers/dismiss/all`,
    method: 'POST',
    data: {
      excludeTimerIds,
    },
  });
  return response;
}

export default function useDismissAllTimersMutation(cb?: () => void) {
  return useMutation({
    mutationFn: dismissAllTimers,
    onSuccess: (_, _reqBody) => {
      queryClient.invalidateQueries({
        queryKey: [GET_TIMERS_QUERY_KEY, _reqBody?.caseId],
      });
      cb?.();
    },
  });
}
