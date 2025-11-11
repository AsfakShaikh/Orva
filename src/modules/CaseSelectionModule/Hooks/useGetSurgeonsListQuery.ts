//Not in use
import {fetcher} from '@utils/Axios';
import {useQuery} from '@tanstack/react-query';
import {GET_SURGEON_LIST_RESPONSE} from '../Types/ResponseTypes';
import {queryClient} from '@utils/ReactQueryConfig';
import {SURGEON} from '../Types/CommonTypes';

export const GET_SURGEONS_LIST_QUERY_KEY = 'admin/${hospitalId}/surgeons';

async function getSurgeonsList(
  hospitalId?: string,
): Promise<GET_SURGEON_LIST_RESPONSE> {
  const {data} = await fetcher({
    url: `admin/${hospitalId}/surgeons`,
  });

  return data;
}

export default function useGetSurgeonsListQuery(hospitalId?: string) {
  return useQuery({
    queryKey: [GET_SURGEONS_LIST_QUERY_KEY, hospitalId],
    queryFn: () => getSurgeonsList(hospitalId),
    enabled: !!hospitalId,
  });
}

export function appendSurgeonToSurgeonsListCache(surgeon: SURGEON) {
  queryClient.setQueryData(
    [GET_SURGEONS_LIST_QUERY_KEY, surgeon.hospitalId],
    (oldData: GET_SURGEON_LIST_RESPONSE) => {
      return [...oldData, surgeon];
    },
  );
}
