import {useQuery} from '@tanstack/react-query';
import {GET_LANGUAGES_QUERY_KEY} from '../Types/CommonTypes';
import {fetcher} from '@utils/Axios';
import {GET_LANGUAGES_RESPONSE} from '../Types/ResponseTypes';

async function getLanguages(): Promise<GET_LANGUAGES_RESPONSE> {
  const {data} = await fetcher({
    url: 'users/languages',
  });
  return data;
}

function useGetLanguagesQuery() {
  return useQuery({
    queryKey: [GET_LANGUAGES_QUERY_KEY],
    queryFn: getLanguages,
  });
}

export default useGetLanguagesQuery;
