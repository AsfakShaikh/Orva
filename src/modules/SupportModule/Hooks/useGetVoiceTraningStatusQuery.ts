import {useQuery} from '@tanstack/react-query';
import {fetcher} from '@utils/Axios';

export const GET_VOICE_TRANING_STATUS_KEY = 'GET_VOICE_TRANING_STATUS_KEY';

async function getVoiceTraningStatus() {
  const {data} = await fetcher({
    url: 'users/voice-training/status',
  });

  return data;
}

export default function useGetVoiceTraningStatusQuery() {
  return useQuery({
    queryKey: [GET_VOICE_TRANING_STATUS_KEY],
    queryFn: getVoiceTraningStatus,
  });
}
