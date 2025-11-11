import {useMutation} from '@tanstack/react-query';
import {fetcher} from '@utils/Axios';
import {UPDATE_TIMER_REQUEST} from '../Types/RequestTypes';
import {editTimerFromQueryCache} from './useGetTimersListQuery';
import removeEmptyKeys from '@helpers/removeEmptyKeys';

async function updateTimer(reqBody: UPDATE_TIMER_REQUEST) {
  return fetcher({
    url: `cases/${reqBody?.caseId}/timers/${reqBody?.timerId}`,
    method: 'PATCH',
    data: removeEmptyKeys(reqBody?.timerData),
  });
}

export default function useUpdateTimerMutation(cb?: () => void) {
  return useMutation({
    mutationFn: updateTimer,
    onSuccess: (res, req) => {
      editTimerFromQueryCache({
        caseId: req?.caseId,
        timerId: req?.timerId,
        timerData: res?.data,
      });
      cb?.();
    },
  });
}
