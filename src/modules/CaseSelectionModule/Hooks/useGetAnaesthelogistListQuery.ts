//Not in use
import {fetcher} from '@utils/Axios';
import {useQuery} from '@tanstack/react-query';
import {GET_AESTHELOGIST_LIST_RESPONSE} from '../Types/ResponseTypes';
import {queryClient} from '@utils/ReactQueryConfig';
import {ANESTHELOGIST} from '../Types/CommonTypes';

export const GET_ANAESTHELOGIST_LIST_QUERY_KEY =
  'admin/${hospitalId}/anaesthelogists';

async function getAnaesthelogistList(
  hospitalId?: string,
): Promise<GET_AESTHELOGIST_LIST_RESPONSE> {
  const {data} = await fetcher({
    url: `admin/${hospitalId}/anaesthelogists`,
  });

  return data;
}

export default function useGetAnaesthelogistListQuery(hospitalId?: string) {
  return useQuery({
    queryKey: [GET_ANAESTHELOGIST_LIST_QUERY_KEY, hospitalId],
    queryFn: () => getAnaesthelogistList(hospitalId),
    enabled: !!hospitalId,
  });
}

export function appendAnesthesiologistToListCache(
  anaesthelogist: ANESTHELOGIST,
) {
  queryClient.setQueryData(
    [GET_ANAESTHELOGIST_LIST_QUERY_KEY, anaesthelogist.hospitalId],
    (oldData: GET_AESTHELOGIST_LIST_RESPONSE) => {
      return [...oldData, anaesthelogist];
    },
  );
}
