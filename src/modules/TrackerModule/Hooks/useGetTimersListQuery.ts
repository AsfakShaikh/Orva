import {useQuery} from '@tanstack/react-query';
import {fetcher} from '@utils/Axios';
import {queryClient} from '@utils/ReactQueryConfig';
import {GET_TIMERS_LIST_RESPONSE} from '../Types/ResponseTypes';
import {UPDATE_TIMER_REQUEST} from '../Types/RequestTypes';

export const GET_TIMERS_QUERY_KEY = 'cases/${caseId}/timers';

async function getTimersList(
  caseId?: number,
): Promise<GET_TIMERS_LIST_RESPONSE> {
  const {data} = await fetcher({url: `cases/${caseId}/timers`});
  return data;
}
export default function useGetTimersListQuery(caseId?: number) {
  return useQuery({
    queryKey: [GET_TIMERS_QUERY_KEY, caseId],
    queryFn: () => getTimersList(caseId),
    enabled: !!caseId,
  });
}

export function editTimerFromQueryCache(updateData?: UPDATE_TIMER_REQUEST) {
  const {caseId, timerId, timerData} = updateData ?? {};

  if (caseId && timerId) {
    queryClient.setQueryData(
      [GET_TIMERS_QUERY_KEY, caseId],
      (oldData: GET_TIMERS_LIST_RESPONSE) => {
        if (oldData) {
          const newData = oldData?.map(timer => {
            if (timerId === timer?.id) {
              return {
                ...timer,
                ...timerData,
              };
            }
            return timer;
          });

          return newData;
        }

        return oldData;
      },
    );
  }
}

export function deleteTimerFromQueryCache(updateData?: {
  caseId?: number;
  timerId?: number;
}) {
  const {caseId, timerId} = updateData ?? {};

  if (caseId && timerId) {
    queryClient.setQueryData(
      [GET_TIMERS_QUERY_KEY, caseId],
      (oldData: GET_TIMERS_LIST_RESPONSE) => {
        return oldData?.filter(timer => timer?.id !== timerId);
      },
    );
  }
}
export function deleteAllTimerFromQueryCache(updateData?: {caseId?: number}) {
  const {caseId} = updateData ?? {};

  if (caseId) {
    queryClient.setQueryData([GET_TIMERS_QUERY_KEY, caseId], () => {
      return [];
    });
  }
}
