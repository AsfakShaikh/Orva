import {useQuery} from '@tanstack/react-query';
import {fetcher} from '@utils/Axios';
import {OTS_LIST_RESPONSE} from '../Types/ResponseTypes';

const GET_OTS_LIST_QUERY_KEY = '/admin/${hospitalId}/ots';

async function getOtsList(
  hospitalId?: string | null,
): Promise<OTS_LIST_RESPONSE> {
  const {data} = await fetcher({
    url: `admin/${hospitalId}/ots`,
  });

  return data;
}

export default function useGetOtsListQuery(hospitalId?: string | null) {
  return useQuery({
    queryKey: [GET_OTS_LIST_QUERY_KEY, hospitalId],
    queryFn: () => getOtsList(hospitalId),
    enabled: !!hospitalId,
  });
}
