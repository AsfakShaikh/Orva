import {useMutation} from '@tanstack/react-query';
import {fetcher} from '@utils/Axios';
import {DELETE_ALL_TIMER_REQUEST} from '../Types/RequestTypes';
import {deleteAllTimerFromQueryCache} from './useGetTimersListQuery';

export async function deleteAllTimers(reqBody: DELETE_ALL_TIMER_REQUEST) {
  const {caseId} = reqBody;
  const response = await fetcher({
    url: `cases/${caseId}/timers/delete/all`,
    method: 'DELETE',
  });
  return response;
}

export default function useDeleteAllTimersMutation(cb?: () => void) {
  return useMutation({
    mutationFn: deleteAllTimers,
    onSuccess: (_, _reqBody) => {
      deleteAllTimerFromQueryCache({caseId: _reqBody?.caseId});
      cb?.();
    },
  });
}
