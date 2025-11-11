import {fetcher} from '@utils/Axios';
import {useQuery} from '@tanstack/react-query';
import {GET_SUBMITTED_CASES_RESPONSE} from '../Types/ResponseTypes';
import {getAuthValue} from '@modules/AuthModule/Hooks/useAuthValue';

export const GET_SUBMITTED_CASE_BY_OTS_QUERY_KEY = 'case-index/';

async function getCaseList(
  otid: string | undefined,
  isFromHome: boolean = false,
): Promise<GET_SUBMITTED_CASES_RESPONSE> {
  const {data} = await fetcher({
    url: `case-index/?otId=${otid}${isFromHome ? '&page=1&limit=5' : ''}`,
  });
  return data;
}

export default function useGetSubmitedCaseByOtsQuery(isFromHome: boolean) {
  const {selectedOt} = getAuthValue();
  return useQuery({
    queryKey: [GET_SUBMITTED_CASE_BY_OTS_QUERY_KEY],
    queryFn: () => getCaseList(selectedOt?.uuid, isFromHome),
    enabled: !!selectedOt?.uuid,
  });
}
