import {fetcher} from '@utils/Axios';
import {useQuery} from '@tanstack/react-query';
import {GET_ACTIVE_CASES_LIST_RESPONSE} from '../Types/ResponseTypes';

const GET_ACTIVE_CASES_QUERY_KEY = '/active-cases';

async function getActiveCases(): Promise<GET_ACTIVE_CASES_LIST_RESPONSE> {
  const {data} = await fetcher({
    url: 'active-cases',
  });

  return data;
}

export default function useGetActiveCasesQuery() {
  return useQuery({
    queryKey: [GET_ACTIVE_CASES_QUERY_KEY],
    queryFn: getActiveCases,
  });
}
