import {enableApiHeaders, fetcher, onError} from '@utils/Axios';
import {useMutation} from '@tanstack/react-query';
import {getAuthValue, resetAuthValue} from './useAuthValue';
import {
  getTrackerValue,
  resetTrackerValue,
} from '@modules/TrackerModule/Hooks/useTrackerValues';
import {pauseAllTimer} from '@modules/TrackerModule/Hooks/usePauseAllTimerMutation';
import {queryClient} from '@utils/ReactQueryConfig';
import {clearAutoRefreshTokenTimer} from '../Helpers/AuthRefresh';

export const appReset = () => {
  queryClient.clear();
  resetAuthValue();
  resetTrackerValue();
  clearAutoRefreshTokenTimer();
};

async function logout() {
  const {refresh_token} = getAuthValue();
  return fetcher({
    url: 'users/logout',
    method: 'POST',
    headers: {
      'x-refresh-token': refresh_token,
    },
  });
}

const pauseAllTimersForCurrentCase = async () => {
  const tracker = getTrackerValue();
  const caseId = tracker?.currentActiveCase?.id;
  if (caseId) {
    try {
      await pauseAllTimer({caseId});
    } catch (error) {
      console.log(error);
    }
  }
};

export default function useLogoutMutation(cb?: () => void) {
  return useMutation({
    mutationFn: async () => {
      await pauseAllTimersForCurrentCase();
      return logout();
    },
    onSuccess: () => {
      appReset();
      cb?.();
    },
    onError: error => {
      onError(error);
      enableApiHeaders();
    },
  });
}
