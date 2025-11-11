import {useMutation} from '@tanstack/react-query';
import {fetcher} from '../../../utils/Axios';
import {VERIFY_OTP_REQUEST} from '../types/RequestTypes';
import {HeaderSnackbarHandler} from '@components/HeaderSnackbar';
import {Strings} from '@locales/Localization';

function verifyOtpRequest({email, otp}: VERIFY_OTP_REQUEST) {
  const reqBody = {email, params: {otp}};
  return fetcher({
    url: '/users/verify/otp',
    method: 'POST',
    data: reqBody,
    authRequired: false,
  });
}

function useVerifyOTPMutation(cb?: () => void) {
  return useMutation({
    mutationFn: verifyOtpRequest,
    onSuccess: () => {
      cb?.();
      HeaderSnackbarHandler.successToast(Strings.Authentication_Successful);
    },
  });
}

export default useVerifyOTPMutation;
