import {useQuery} from '@tanstack/react-query';
import {fetcher} from '@utils/Axios';
import {SETTINGS} from '../Types/CommonTypes';

export const CONFIG_QUERY_KEY = 'users-settings';

async function getSettingConfig(): Promise<SETTINGS> {
  const {data} = await fetcher({
    url: 'users/settings',
  });

  return data;
}

export default function useGetSettingConfigQuery() {
  return useQuery({
    queryKey: [CONFIG_QUERY_KEY],
    queryFn: () => getSettingConfig(),
    staleTime: Infinity,
  });
}
