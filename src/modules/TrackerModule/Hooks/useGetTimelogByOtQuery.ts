import {fetcher} from '@utils/Axios';
import {useQuery} from '@tanstack/react-query';
import {TIMELOG_RESPONSE} from '../Types/ResponseTypes';

export const GET_TIMELOG_BY_OT_QUERY_KEY = 'case/ot/timelogs?ots=${otIds}';

async function getTimelogByOt(otIds?: string): Promise<TIMELOG_RESPONSE> {
  const {data} = await fetcher({
    url: `case/ot/timelogs?ots=${otIds}`,
  });

  return data;
}

export default function useGetTimelogByOt(otIds?: string) {
  return useQuery({
    queryKey: [GET_TIMELOG_BY_OT_QUERY_KEY, otIds],
    queryFn: () => getTimelogByOt(otIds),
    enabled: !!otIds && otIds.length > 0,
  });
}
