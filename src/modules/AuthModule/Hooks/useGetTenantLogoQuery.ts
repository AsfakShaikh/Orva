import {useQuery} from '@tanstack/react-query';
import {enableApiHeaders, fetcher} from '@utils/Axios';

export const GET_TENANT_LOGO_QUERY_KEY = 'admin/file';

async function getTenantLogo(): Promise<any> {
  const {data} = await fetcher({
    url: 'admin/file',
    headers: {entityType: 'tenant'},
    includeHospitalId: false,
  });
  enableApiHeaders();
  return data;
}

export default function useGetTenantLogoQuery() {
  return useQuery({
    queryKey: [GET_TENANT_LOGO_QUERY_KEY],
    queryFn: () => getTenantLogo(),
    staleTime: Infinity,
    throwOnError: () => {
      enableApiHeaders();
      return false;
    },
  });
}
