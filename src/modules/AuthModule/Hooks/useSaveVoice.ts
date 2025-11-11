// Not in use
import {useMutation} from '@tanstack/react-query';
import {fetcher} from '@utils/Axios';
import {VOICE} from '../Types/CommonTypes';
import {AxiosResponse} from 'axios';

export const GET_HOSPITAL_CONFIG_QUERY_KEY = 'voice-training';

async function saveVoiceConfig(req: VOICE): Promise<AxiosResponse<VOICE>> {
  const formData = new FormData();

  formData.append('nativeLanguage', req.nativeLanguage);
  formData.append('deviceType', req.deviceType);
  formData.append('intent', req.intent);
  formData.append('ipAddress', req.ipAddress);
  formData.append('file', {
    uri: req.file,
    name: 'sound.mp3',
    type: 'audio/mp3',
  });

  return fetcher({
    url: 'user/voice-training/sample',
    method: 'POST',
    data: formData,
    headers: {'Content-Type': 'multipart/form-data'},
  });
}

export default function useSaveVoiceConfigaQuery() {
  return useMutation({
    mutationFn: (req: VOICE) => saveVoiceConfig(req),
  });
}
