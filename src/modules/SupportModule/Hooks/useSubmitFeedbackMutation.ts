import {fetcher} from '@utils/Axios';
import {useMutation} from '@tanstack/react-query';
import {SUBMIT_FEEDBACK_REQUEST} from '../Types/RequestTypes';
import {AxiosResponse} from 'axios';
import {SUBMIT_FEEEDBACK_RESPONSE} from '../Types/ResponseTypes';
import {HeaderSnackbarHandler} from '@components/HeaderSnackbar';
import {Strings} from '@locales/Localization';

async function submitFeedback(
  reqBody: SUBMIT_FEEDBACK_REQUEST,
): Promise<AxiosResponse<SUBMIT_FEEEDBACK_RESPONSE>> {
  return fetcher({
    method: 'POST',
    url: 'users/feedback',
    data: reqBody,
  });
}

export default function useSubmitFeedbackMutation(cb?: () => void) {
  return useMutation({
    mutationFn: submitFeedback,
    onSuccess() {
      cb?.();
      HeaderSnackbarHandler.successToast(Strings.feedback_submit_success);
    },
    onError() {
      cb?.();
      HeaderSnackbarHandler.attentionToast(Strings.feedback_submit_error);
    },
  });
}
