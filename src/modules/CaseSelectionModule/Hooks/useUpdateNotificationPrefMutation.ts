// Not in use
import {useMutation} from '@tanstack/react-query';
import {fetcher} from '@utils/Axios';
import {UPDATE_NOTIFICATION_PREF_REQUEST} from '../Types/RequestTypes';
import {AxiosResponse} from 'axios';
import {GET_NOTIFICATION_PREF_RESPONSE} from '../Types/ResponseTypes';
import {queryClient} from '@utils/ReactQueryConfig';
import {GET_NOTIFICATION_PREF_QUERY_KEY} from './useGetNotificationPrefQuery';
import {HeaderSnackbarHandler} from '@components/HeaderSnackbar';
import {Strings} from '@locales/Localization';

async function updateNotificationPref(
  reqBody: UPDATE_NOTIFICATION_PREF_REQUEST,
): Promise<AxiosResponse<GET_NOTIFICATION_PREF_RESPONSE>> {
  return fetcher({
    url: 'users/notification/config',
    method: 'POST',
    data: reqBody,
  });
}

export default function useUpdateNotificationPrefMutation(cb?: () => void) {
  return useMutation({
    mutationFn: updateNotificationPref,
    onSuccess: res => {
      const {status, data} = res;

      if (status >= 200 && status <= 299) {
        cb?.();
        HeaderSnackbarHandler.successToast(
          Strings.Your_notification_settings_have_been_saved,
        );
        queryClient.setQueryData([GET_NOTIFICATION_PREF_QUERY_KEY], () => {
          return data;
        });
      }
    },
  });
}
