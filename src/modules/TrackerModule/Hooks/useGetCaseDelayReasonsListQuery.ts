import {useQuery} from '@tanstack/react-query';
import {fetcher} from '@utils/Axios';
import {GET_CASE_DELAY_REASON_RESPONSE} from '../Types/ResponseTypes';

const GET_CASE_DELAY_REASONS_LIST_QUERY_KEY = '/delay-reasons/case/:caseId';

export async function getCaseDelayReasonsList(
  caseId?: number,
): Promise<GET_CASE_DELAY_REASON_RESPONSE> {
  const {data} = await fetcher({
    url: `delay-reasons/case/${caseId}`,
  });
  return data;
}

export default function useGetCaseDelayReasonsListQuery(caseId?: number) {
  return useQuery({
    queryKey: [GET_CASE_DELAY_REASONS_LIST_QUERY_KEY, caseId],
    queryFn: () => getCaseDelayReasonsList(caseId),
    enabled: !!caseId,
  });
}
