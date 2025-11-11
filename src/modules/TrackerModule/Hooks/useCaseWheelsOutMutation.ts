import {CASE_DETAIL} from '../../CaseSelectionModule/Types/CommonTypes';
import {fetcher} from '@utils/Axios';
import {useMutation} from '@tanstack/react-query';
import {AxiosResponse} from 'axios';
import {CASE_WHEELS_OUT_REQUEST} from '../Types/RequestTypes';
import {GET_CASE_DETAIL_QUERY_KEY} from '@modules/CasesModule/Hooks/useGetCaseDetailQuery';
import {queryClient} from '@utils/ReactQueryConfig';

async function caseWheelsOut(
  reqBody: CASE_WHEELS_OUT_REQUEST,
): Promise<AxiosResponse<CASE_DETAIL>> {
  const {caseId, ...rest} = reqBody;
  return fetcher({
    method: 'POST',
    url: `/v2/case/${caseId}/submit`,
    data: rest,
  });
}

export default function useCaseWheelsOutMutation() {
  return useMutation({
    mutationFn: caseWheelsOut,
    onSuccess: (_, {caseId}) => {
      queryClient.refetchQueries({
        queryKey: [GET_CASE_DETAIL_QUERY_KEY, caseId],
      });
    },
  });
}
