import {fetcher} from '@utils/Axios';
import {useQuery} from '@tanstack/react-query';
import {GET_PROCEDURE_LIST_RESPONSE} from '../Types/ResponseTypes';
import {getAuthValue} from '@modules/AuthModule/Hooks/useAuthValue';
import {PROCEDURE} from '../Types/CommonTypes';
import {queryClient} from '@utils/ReactQueryConfig';

export const GET_PROCEDURE_LIST_QUERY_KEY = 'admin/${hospitalId}/procedures';

async function getProcedureList(
  searchQuery: string = '',
): Promise<GET_PROCEDURE_LIST_RESPONSE> {
  const {hospitalRegion, hospitalId} = getAuthValue();
  const region = hospitalRegion?.toUpperCase()?.replace(' ', '_');

  const {data} = await fetcher({
    url: `v2/admin/${hospitalId}/procedures?userRegion=${region}&term=${searchQuery}&status=Active,Incomplete`,
  });
  return data;
}

export default function useGetProcedureListQuery(searchQuery?: string) {
  const queryKey = searchQuery
    ? [GET_PROCEDURE_LIST_QUERY_KEY, searchQuery]
    : [GET_PROCEDURE_LIST_QUERY_KEY];

  return useQuery({
    queryKey,
    queryFn: () => getProcedureList(searchQuery),
  });
}

export function appendProcedureToListCache(procedure: PROCEDURE) {
  queryClient.setQueryData(
    [GET_PROCEDURE_LIST_QUERY_KEY],
    (oldData: GET_PROCEDURE_LIST_RESPONSE) => {
      return [...oldData, procedure];
    },
  );
}
