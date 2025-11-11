import {useMutation} from '@tanstack/react-query';
import {fetcher, onError} from '@utils/Axios';
import {SUBMIT_DELAY_REASON_REQUEST} from '../Types/RequestTypes';
import {HeaderSnackbarHandler} from '@components/HeaderSnackbar';
import {Strings} from '@locales/Localization';

function submitDelayReason(data: SUBMIT_DELAY_REASON_REQUEST) {
  return fetcher({
    url: 'delay-reasons',
    method: 'POST',
    data,
  });
}

export default function useSubmitDelayReasonMutation(cb?: () => void) {
  return useMutation({
    mutationFn: submitDelayReason,
    onSuccess: () => {
      cb?.();
    },
    onError: error => {
      onError(error);
      HeaderSnackbarHandler.attentionToast(Strings.Delay_Reason_Submit_Error);
    },
  });
}
