import {useMutation} from '@tanstack/react-query';
import {fetcher, onError} from '@utils/Axios';
import {CREATE_CASE_REQUEST} from '../Types/RequestTypes';
import {CASE_DETAIL, CASE_STATUS} from '../Types/CommonTypes';
import {AxiosResponse} from 'axios';
import {GET_CASE_BY_OTS_QUERY_KEY} from './useGetCaseByOtsQuery';
import {setTrackerValue} from '@modules/TrackerModule/Hooks/useTrackerValues';
import {
  getAuthValue,
  updateAuthValue,
} from '@modules/AuthModule/Hooks/useAuthValue';
import removeEmptyKeys from '@helpers/removeEmptyKeys';
import {queryClient} from '@utils/ReactQueryConfig';
import {GET_TIMELOG_BY_OT_QUERY_KEY} from '@modules/TrackerModule/Hooks/useGetTimelogByOtQuery';
import {GET_CASE_DETAIL_QUERY_KEY} from '../../CasesModule/Hooks/useGetCaseDetailQuery';
import {HeaderSnackbarHandler} from '@components/HeaderSnackbar';
import {Strings} from '@locales/Localization';

async function createCase(
  reqBody: CREATE_CASE_REQUEST,
): Promise<AxiosResponse<CASE_DETAIL>> {
  const {newOtId, ...restReq} = reqBody;
  const req = removeEmptyKeys(restReq);

  return fetcher({
    method: 'POST',
    url: `v2/case?newOtId=${newOtId ?? ''}`,
    data: req,
  });
}

export default function useCreateCaseMutation(
  cb?: () => void,
  isConfirmScreen?: boolean,
) {
  return useMutation({
    mutationFn: createCase,
    onSuccess: (res, req) => {
      const {data} = res;
      const {selectedOt, userId, user} = getAuthValue();
      queryClient.refetchQueries({
        queryKey: [GET_TIMELOG_BY_OT_QUERY_KEY, selectedOt?.uuid],
      });

      queryClient.refetchQueries({
        queryKey: [
          GET_CASE_BY_OTS_QUERY_KEY,
          selectedOt?.uuid,
          CASE_STATUS.ALL_CASES,
        ],
      });

      if (data?.status === CASE_STATUS.ACTIVE) {
        setTrackerValue({currentActiveCase: data});

        if (selectedOt && userId) {
          updateAuthValue({
            selectedOt: {
              ...selectedOt,
              userId: userId,
              username: user?.username ?? '',
              mrn: data?.patient?.mrn,
              caseId: data?.id,
            },
          });
        }

        queryClient.refetchQueries({
          queryKey: [GET_CASE_DETAIL_QUERY_KEY, data?.id],
        });

        setTimeout(() => {
          cb?.();
        }, 300);
      }

      !isConfirmScreen &&
        HeaderSnackbarHandler.successToast(
          req?.id
            ? Strings.Case_Update_Successfully
            : Strings.Case_Created_Successfully,
        );
    },
    onError: (error: any, req) => {
      onError(error);
      !isConfirmScreen &&
        HeaderSnackbarHandler.attentionToast(
          req?.id ? Strings.Case_Update_Error : Strings.Case_Create_Error,
        );
    },
  });
}
