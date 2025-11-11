import {fetcher, onError} from '@utils/Axios';
import {RESET_PASSWORD_REQUEST} from '../Types/RequestTypes';
import {useMutation} from '@tanstack/react-query';
import {HeaderSnackbarHandler} from '@components/HeaderSnackbar';
import {Strings} from '@locales/Localization';

function resetPassword(req: RESET_PASSWORD_REQUEST) {
  const {authRequired, ...restReq} = req;
  return fetcher({
    url: 'users/update/password',
    method: 'PATCH',
    data: restReq,
    authRequired: !!authRequired,
  });
}

export default function useResetPasswordMutation(cb?: () => void) {
  return useMutation({
    mutationFn: resetPassword,
    onSuccess: () => {
      cb?.();
      HeaderSnackbarHandler.successToast(Strings.Password_updated_successfully);
    },
    onError: error => {
      cb?.();
      onError(error);
      HeaderSnackbarHandler.attentionToast(Strings.Password_was_not_updated);
    },
  });
}
