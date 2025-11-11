import removeEmptyKeys from '@helpers/removeEmptyKeys';
import {useMutation} from '@tanstack/react-query';
import {fetcher} from '@utils/Axios';
import {EDIT_TIMER_LABEL_REQUEST} from '../Types/RequestTypes';
import {AxiosResponse} from 'axios';
import {TIMER} from '@modules/TrackerModule/Types/CommonTypes';
import {updateCaseTimerDetailInCache} from './useGetCaseDetailQuery';

function editTimerLabel(
  reqBody: EDIT_TIMER_LABEL_REQUEST,
): Promise<AxiosResponse<TIMER>> {
  const {caseId, timerId, timerData} = reqBody;
  return fetcher({
    url: `cases/${caseId}/timers/${timerId}/description`,
    method: 'PATCH',
    data: removeEmptyKeys(timerData),
  });
}

export default function useEditTimerLabelMutation() {
  return useMutation({
    mutationFn: editTimerLabel,
    onSuccess: (res, req) => {
      if (req.caseId) {
        updateCaseTimerDetailInCache({
          caseId: req.caseId,
          data: {
            id: res?.data?.id,
            description: res?.data?.description,
          },
        });
      }
    },
  });
}
