import {useMutation} from '@tanstack/react-query';
import {fetcher, onError} from '@utils/Axios';
import {
  GET_CASE_BY_OTS_QUERY_KEY,
  removeCaseFromCaseByOtListCache,
} from './useGetCaseByOtsQuery';
import {DELETE_CASE_REQUEST} from '../Types/RequestTypes';
import {HeaderSnackbarHandler} from '@components/HeaderSnackbar';
import {Strings} from '@locales/Localization';
import {
  getTrackerValue,
  resetTrackerValue,
} from '@modules/TrackerModule/Hooks/useTrackerValues';
import {queryClient} from '@utils/ReactQueryConfig';
import {GET_TIMELOG_BY_OT_QUERY_KEY} from '@modules/TrackerModule/Hooks/useGetTimelogByOtQuery';
import {
  getAuthValue,
  updateAuthValue,
} from '@modules/AuthModule/Hooks/useAuthValue';

function deleteCase({id}: DELETE_CASE_REQUEST) {
  return fetcher({
    url: `case/${id}`,
    method: 'DELETE',
  });
}

function useDeleteCaseMutation(onSuccess?: () => void) {
  return useMutation({
    mutationFn: deleteCase,
    onSuccess: (_, req) => {
      const {currentActiveCase} = getTrackerValue();
      const {selectedOt} = getAuthValue();
      if (currentActiveCase?.id === req?.id) {
        resetTrackerValue();
        updateAuthValue({
          selectedOt: selectedOt
            ? {
                ...selectedOt,
                caseId: undefined,
                mrn: undefined,
              }
            : undefined,
        });
        queryClient.invalidateQueries({
          queryKey: [GET_TIMELOG_BY_OT_QUERY_KEY],
        });
        queryClient.invalidateQueries({
          queryKey: [GET_CASE_BY_OTS_QUERY_KEY],
        });
      }
      removeCaseFromCaseByOtListCache(req);
      HeaderSnackbarHandler.successToast(Strings.Case_Deleted_Successfully);
    },
    onError: error => {
      onError(error);
      HeaderSnackbarHandler.attentionToast(Strings.Case_Deleted_Error);
    },
    onSettled: () => {
      onSuccess?.();
    },
  });
}

export default useDeleteCaseMutation;
