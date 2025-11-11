import {useMutation} from '@tanstack/react-query';
import {AxiosResponse} from 'axios';
import {CASE_DETAIL} from '../Types/CommonTypes';
import {fetcher} from '@utils/Axios';
import {ANAESTHESIA_START_REQUEST} from '../Types/RequestTypes';
import {updateCaseDetailInCache} from '../../CasesModule/Hooks/useGetCaseDetailQuery';

async function anaesthesiaStartFn(
  reqBody: ANAESTHESIA_START_REQUEST,
): Promise<AxiosResponse<CASE_DETAIL>> {
  const {caseId, ...data} = reqBody;
  return fetcher({
    method: 'PATCH',
    url: `case/${caseId}`,
    data: data,
  });
}

export default function useAnaesthesiaStartMutation(cb?: () => void) {
  return useMutation({
    mutationFn: anaesthesiaStartFn,
    onSuccess: (res, {caseId, anaesthesiaStart}) => {
      const {status} = res;
      if (status >= 200 && status <= 299) {
        cb?.();
        updateCaseDetailInCache({
          caseId,
          data: {anaesthesiaStart},
        });
      }
    },
  });
}
