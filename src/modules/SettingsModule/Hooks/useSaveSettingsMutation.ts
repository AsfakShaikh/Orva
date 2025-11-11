import {useMutation} from '@tanstack/react-query';
import {fetcher} from '@utils/Axios';
import {AxiosResponse} from 'axios';
import {queryClient} from '@utils/ReactQueryConfig';
import {CONFIG_QUERY_KEY} from './useGetSettingConfigQuery';
import {HeaderSnackbarHandler} from '@components/HeaderSnackbar';
import {Strings} from '@locales/Localization';
import {SETTINGS} from '@modules/SettingsModule/Types/CommonTypes';
import {SETTINGS_REQUEST} from '../Types/RequestTypes';

export const GET_HOSPITAL_CONFIG_QUERY_KEY = 'users-settings';

async function saveSettingConfig(
  req: SETTINGS_REQUEST,
): Promise<AxiosResponse<SETTINGS>> {
  return fetcher({
    url: 'users/settings',
    method: 'PATCH',
    data: req,
  });
}

export default function useSaveSettingsMutation(cb?: () => void) {
  return useMutation({
    mutationFn: saveSettingConfig,
    onSuccess: res => {
      const {status} = res;
      if (status > 200 && status < 299) {
        cb?.();
        HeaderSnackbarHandler.successToast(
          Strings.Your_changes_have_been_saved,
        );
        queryClient.refetchQueries({queryKey: [CONFIG_QUERY_KEY]});
      }
    },
  });
}
