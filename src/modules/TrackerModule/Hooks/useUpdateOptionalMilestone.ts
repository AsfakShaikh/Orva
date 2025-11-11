import {MILESTONE} from '../../CaseSelectionModule/Types/CommonTypes';
import {fetcher} from '@utils/Axios';
import {useMutation} from '@tanstack/react-query';
import {AxiosResponse} from 'axios';
import {UPDATE_MILESTONE_REQUEST} from '../Types/RequestTypes';
import {queryClient} from '@utils/ReactQueryConfig';
import {GET_CASE_DETAIL_QUERY_KEY} from '@modules/CasesModule/Hooks/useGetCaseDetailQuery';

async function submitOptionalMilestone(
  reqBody: UPDATE_MILESTONE_REQUEST,
): Promise<AxiosResponse<MILESTONE>> {
  return fetcher({
    method: 'PATCH',
    url: `case/${reqBody?.caseId}/optional-milestone`,
    data: reqBody?.currentMilestone,
  });
}

export default function useUpdateOptionalMilestone(cb?: () => void) {
  return useMutation({
    mutationFn: submitOptionalMilestone,
    onSuccess(_, {caseId}) {
      queryClient.refetchQueries({
        queryKey: [GET_CASE_DETAIL_QUERY_KEY, caseId],
      });
      cb?.();
    },
  });
}
