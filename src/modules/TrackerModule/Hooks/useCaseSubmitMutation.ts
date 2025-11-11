import {
  CASE_DETAIL,
  CASE_STATUS,
} from '../../CaseSelectionModule/Types/CommonTypes';
import {fetcher} from '@utils/Axios';
import {useMutation} from '@tanstack/react-query';
import {AxiosResponse} from 'axios';
import {updateTrackerValue} from './useTrackerValues';
import {
  addOrUpdateCaseInCaseByOtListCache,
  GET_CASE_BY_OTS_QUERY_KEY,
} from '@modules/CaseSelectionModule/Hooks/useGetCaseByOtsQuery';
import {HeaderSnackbarHandler} from '@components/HeaderSnackbar';
import {
  getAuthValue,
  updateAuthValue,
} from '@modules/AuthModule/Hooks/useAuthValue';
import {queryClient} from '@utils/ReactQueryConfig';
import {GET_TIMELOG_BY_OT_QUERY_KEY} from './useGetTimelogByOtQuery';
import {Strings} from '@locales/Localization';

async function caseSubmit(
  reqBody: CASE_DETAIL,
): Promise<AxiosResponse<CASE_DETAIL>> {
  return fetcher({
    method: 'POST',
    url: `/case/${reqBody?.id}/submit`,
    data: reqBody,
  });
}

export default function useCaseSubmitMutation(
  cb?: (isLastCase: boolean) => void,
) {
  return useMutation({
    mutationFn: caseSubmit,
    onSuccess: (res, caseDetail) => {
      const {selectedOt} = getAuthValue();

      selectedOt &&
        updateAuthValue({
          selectedOt: {
            ...selectedOt,
            caseId: undefined,
            mrn: undefined,
            userId: undefined,
            username: undefined,
          },
        });

      updateTrackerValue({
        currentActiveCase: undefined,
        caseboardCurrentActiveCases: undefined,
      });
      addOrUpdateCaseInCaseByOtListCache({
        ...caseDetail,
        status: CASE_STATUS.SUBMITTED,
      });

      queryClient.refetchQueries({
        queryKey: [GET_TIMELOG_BY_OT_QUERY_KEY, selectedOt?.uuid],
      });

      if (!caseDetail.isLastCase) {
        // Display success toast if it's not the last case
        const isCaseNotesAttached = (caseDetail?.caseNotes?.length ?? 0) > 0;
        HeaderSnackbarHandler.successToast(
          `Case (MRN ${caseDetail?.patient?.mrn}) has been submitted and closed`,
          isCaseNotesAttached ? Strings.Reviewing_logged_voice_notes_desc : '',
          {isBodyIcon: isCaseNotesAttached},
        );
      } else {
        queryClient.refetchQueries({
          queryKey: [
            GET_CASE_BY_OTS_QUERY_KEY,
            selectedOt?.uuid,
            CASE_STATUS.PLANNED,
          ],
        });
      }

      cb?.(caseDetail.isLastCase);
    },
  });
}
