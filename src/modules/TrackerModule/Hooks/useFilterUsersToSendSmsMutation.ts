import {useMutation} from '@tanstack/react-query';
import {fetcher} from '@utils/Axios';
import {FILTER_USERS_TO_SEND_SMS_REQUEST} from '../Types/RequestTypes';
import {AxiosResponse} from 'axios';
import {FILTER_USERS_TO_SEND_SMS_RESPONSE} from '../Types/ResponseTypes';
import Config from 'react-native-config';

async function filterUsersToSendSms(
  reqBody: FILTER_USERS_TO_SEND_SMS_REQUEST,
): Promise<AxiosResponse<FILTER_USERS_TO_SEND_SMS_RESPONSE>> {
  return fetcher({
    baseURL: Config.ASR_STT_BASE_URL,
    url: 'api/v1/process_message',
    method: 'POST',
    data: reqBody,
    authRequired: false,
    skipAuthRefresh: true,
  });
}

const useFilterUsersToSendSmsMutation = () => {
  return useMutation({
    mutationFn: filterUsersToSendSms,
  });
};

export default useFilterUsersToSendSmsMutation;
