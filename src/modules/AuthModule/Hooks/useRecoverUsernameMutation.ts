import {fetcher, onError} from '@utils/Axios';
import {RECOVER_USERNAME_REQUEST} from '../Types/RequestTypes';
import {useMutation} from '@tanstack/react-query';
import {HeaderSnackbarHandler} from '@components/HeaderSnackbar';
import extractErrorMessage from '@helpers/extractErrorMessage';

function recoverUsername(req: RECOVER_USERNAME_REQUEST) {
  return fetcher({
    url: '/users/recover/username',
    method: 'POST',
    data: req,
    authRequired: false,
  });
}

export default function useRecoverUsernameMutation(cb?: () => void) {
  return useMutation({
    mutationFn: recoverUsername,
    onSuccess: () => {
      cb?.();
    },
    onError: error => {
      onError(error);
      HeaderSnackbarHandler.attentionToast(extractErrorMessage(error) ?? '');
    },
  });
}
