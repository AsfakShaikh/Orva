import useAuthValue, {
  getAuthValue,
} from '@modules/AuthModule/Hooks/useAuthValue';
import {useMutation} from '@tanstack/react-query';
import {fetcher, onError} from '@utils/Axios';
import {queryClient} from '@utils/ReactQueryConfig';
import {endOfDay, format, startOfDay} from 'date-fns';
import {GET_CASE_BY_OTS_QUERY_KEY} from './useGetCaseByOtsQuery';
import {HeaderSnackbarHandler} from '@components/HeaderSnackbar';
import {Strings} from '@locales/Localization';

async function syncCase() {
  const {selectedOt} = getAuthValue();

  const now = new Date();

  const todayStart = format(startOfDay(now), "yyyy-MM-dd'T'HH:mm:ss'Z'");
  const todayEnd = format(endOfDay(now), "yyyy-MM-dd'T'HH:mm:ss'Z'");

  return fetcher({
    url: `emr/sync/appointment?startDate=${todayStart}&endDate=${todayEnd}&otId=${selectedOt?.uuid}`,
    method: 'GET',
  });
}

export default function useSyncCasesMutation() {
  const {selectedOt} = useAuthValue();
  const otId = selectedOt?.uuid ?? '';

  return useMutation({
    mutationFn: syncCase,
    onSuccess: () => {
      queryClient.refetchQueries({
        queryKey: [GET_CASE_BY_OTS_QUERY_KEY, otId],
      });
      HeaderSnackbarHandler.successToast(Strings.Sync_OT_Cases_Successful);
    },
    onError: error => {
      onError(error);
      HeaderSnackbarHandler.attentionToast(Strings.Something_went_wrong);
    },
  });
}
