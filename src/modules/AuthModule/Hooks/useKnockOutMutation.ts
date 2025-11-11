import {fetcher} from '@utils/Axios';
import {useMutation} from '@tanstack/react-query';

async function knockOut(otId: string) {
  return fetcher({
    url: 'users/knockout',
    method: 'POST',
    data: {
      otId: otId,
    },
  });
}

export default function useKnockoutMutation(cb?: () => void) {
  return useMutation({
    mutationFn: knockOut,
    onSuccess: () => {
      cb?.();
    },
  });
}
