import {MILESTONE} from '../../CaseSelectionModule/Types/CommonTypes';
import {fetcher} from '@utils/Axios';
import {useMutation} from '@tanstack/react-query';
import {AxiosResponse} from 'axios';
import {
  UPDATE_MILESTONE_REQUEST,
  UPDATE_ROOM_CLEAN_MILESTONE_REQUEST,
} from '../Types/RequestTypes';
import {queryClient} from '@utils/ReactQueryConfig';
import {GET_CASE_DETAIL_QUERY_KEY} from '@modules/CasesModule/Hooks/useGetCaseDetailQuery';
import useAuthValue from '@modules/AuthModule/Hooks/useAuthValue';
import {GET_TIMELOG_BY_OT_QUERY_KEY} from './useGetTimelogByOtQuery';

async function submitMilestone(
  reqBody: UPDATE_MILESTONE_REQUEST | UPDATE_ROOM_CLEAN_MILESTONE_REQUEST,
): Promise<AxiosResponse<MILESTONE>> {
  const isRoomClean = !('currentMilestone' in reqBody);
  const endUrl = isRoomClean ? 'milestone/room-clean' : 'milestone';
  const reqBodyData = isRoomClean ? reqBody : reqBody?.currentMilestone;

  return fetcher({
    method: 'PATCH',
    url: `case/${reqBody?.caseId}/${endUrl}`,
    data: reqBodyData,
  });
}

export default function useUpdateMilestone(cb?: () => void) {
  const {selectedOt} = useAuthValue();
  return useMutation({
    mutationFn: submitMilestone,
    onSuccess(_, {caseId}) {
      queryClient.refetchQueries({
        queryKey: [GET_CASE_DETAIL_QUERY_KEY, caseId],
      });
      queryClient.refetchQueries({
        queryKey: [GET_TIMELOG_BY_OT_QUERY_KEY, selectedOt?.uuid],
      });
      cb?.();
    },
  });
}
