import {useMutation} from '@tanstack/react-query';
import {fetcher} from '@utils/Axios';
import {RESUME_ALL_TIMER_REQUEST} from '../Types/RequestTypes';
import {queryClient} from '@utils/ReactQueryConfig';
import {GET_TIMERS_QUERY_KEY} from './useGetTimersListQuery';

export async function resumeAllTimer(reqBody: RESUME_ALL_TIMER_REQUEST) {
  const {caseId} = reqBody;
  const response = await fetcher({
    url: `cases/${caseId}/timers/resume/all`,
    method: 'POST',
  });
  return response;
}

export default function useResumeAllTimerMutation(cb?: () => void) {
  return useMutation({
    mutationFn: resumeAllTimer,
    onSuccess: (_, _reqBody) => {
      queryClient.invalidateQueries({
        queryKey: [GET_TIMERS_QUERY_KEY, _reqBody?.caseId],
      });
      cb?.();
    },
  });
}
