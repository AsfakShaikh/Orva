import {fetcher, onError} from '@utils/Axios';
import {RECOVER_PASSWORD_REQUEST} from '../Types/RequestTypes';
import {useMutation} from '@tanstack/react-query';
import {HeaderSnackbarHandler} from '@components/HeaderSnackbar';
import {Strings} from '@locales/Localization';
import extractErrorMessage from '@helpers/extractErrorMessage';

function recoverPassword(req: RECOVER_PASSWORD_REQUEST) {
  return fetcher({
    url: '/users/recover/password',
    method: 'POST',
    data: req,
    authRequired: false,
  });
}

export default function useRecoverPasswordMutation(
  cb?: (val?: string) => void,
) {
  return useMutation({
    mutationFn: recoverPassword,
    onSuccess: (res, req) => {
      cb?.(req?.email);
      HeaderSnackbarHandler.successToast(
        Strings.One_Time_Password_Sent,
        Strings.Check_Inbox_Associated_With_Account,
      );
    },
    onError: error => {
      onError(error);
      HeaderSnackbarHandler.attentionToast(extractErrorMessage(error) ?? '');
    },
  });
}
