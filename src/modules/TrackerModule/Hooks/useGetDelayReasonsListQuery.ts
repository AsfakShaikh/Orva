import {useQuery} from '@tanstack/react-query';
import {fetcher} from '@utils/Axios';
import {GET_DELAY_REASON_RESPONSE} from '../Types/ResponseTypes';

const GET_DELAY_REASONS_LIST_QUERY_KEY = 'delay-reason/catalog';

async function getDelayReasonsList(): Promise<GET_DELAY_REASON_RESPONSE> {
  const {data} = await fetcher({
    url: 'delay-reason/catalog',
  });
  return data;
}

export default function useGetDelayReasonsListQuery() {
  return useQuery({
    queryKey: [GET_DELAY_REASONS_LIST_QUERY_KEY],
    queryFn: getDelayReasonsList,
  });
}
