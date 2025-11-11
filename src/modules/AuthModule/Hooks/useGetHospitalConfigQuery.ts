import {useQuery} from '@tanstack/react-query';
import {fetcher} from '@utils/Axios';
import {HOSPITAL} from '../Types/CommonTypes';

export const GET_HOSPITAL_CONFIG_QUERY_KEY = 'hospital/${hospitalId}';

async function getHospitalConfig(hospitalId?: string): Promise<HOSPITAL> {
  const {data} = await fetcher({
    url: `hospital/${hospitalId}`,
  });

  return data;
}

export default function useGetHospitalConfigQuery(hospitalId?: string) {
  return useQuery({
    queryKey: [GET_HOSPITAL_CONFIG_QUERY_KEY, hospitalId],
    queryFn: () => getHospitalConfig(hospitalId),
    staleTime: Infinity,
    enabled: !!hospitalId,
  });
}
