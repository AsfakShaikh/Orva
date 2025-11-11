import {useMutation} from '@tanstack/react-query';
import {fetcher} from '@utils/Axios';
import {CREATE_MANUAL_TIMER_REQUEST} from '../Types/RequestTypes';
import {queryClient} from '@utils/ReactQueryConfig';
import {GET_TIMERS_QUERY_KEY} from './useGetTimersListQuery';

async function createManualTimer(reqBody: CREATE_MANUAL_TIMER_REQUEST) {
  const {caseId, ...restReqBody} = reqBody;
  return fetcher({
    url: `cases/${caseId}/timers`,
    method: 'POST',
    data: restReqBody,
  });
}

export default function useCreateManualTimerMutation(cb?: () => void) {
  return useMutation({
    mutationFn: createManualTimer,
    onSuccess: (_, reqBody) => {
      cb?.();
      queryClient.invalidateQueries({
        queryKey: [GET_TIMERS_QUERY_KEY, reqBody?.caseId],
      });
    },
  });
}
