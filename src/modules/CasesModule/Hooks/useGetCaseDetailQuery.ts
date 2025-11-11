import {useQuery} from '@tanstack/react-query';
import {fetcher} from '@utils/Axios';
import {
  CASE_DETAIL,
  MILESTONE,
  REVISION,
} from '../../CaseSelectionModule/Types/CommonTypes';
import {updateTrackerValue} from '@modules/TrackerModule/Hooks/useTrackerValues';
import {queryClient} from '@utils/ReactQueryConfig';
import {TIMER, VOICE_NOTE} from '@modules/TrackerModule/Types/CommonTypes';
import {
  UPDATE_MILESTONE_REVISION_REQUEST,
  UPDATE_OPTIONAL_MILESTONE_REVISION_REQUEST,
} from '@modules/CaseSelectionModule/Types/RequestTypes';

export const GET_CASE_DETAIL_QUERY_KEY = 'case/${caseId}';

async function getCaseDetail(
  caseId?: number | null,
  isCurrentActiveCase?: boolean,
): Promise<CASE_DETAIL> {
  const {data, status} = await fetcher({url: `case/${caseId}`});
  if (isCurrentActiveCase && status >= 200 && status <= 299) {
    updateTrackerValue({
      currentActiveCase: data,
    });
  }
  return data;
}

export default function useGetCaseDetailQuery(
  caseId?: number | null,
  isCurrentActiveCase?: boolean,
) {
  return useQuery({
    queryKey: [GET_CASE_DETAIL_QUERY_KEY, caseId],
    queryFn: () => getCaseDetail(caseId, isCurrentActiveCase),
    enabled: !!caseId,
  });
}

export function updateCaseDetailInCache(updateData: {
  caseId: number;
  data: Partial<CASE_DETAIL>;
  isCurrentActiveCase?: boolean;
}) {
  const {caseId, data, isCurrentActiveCase} = updateData;
  queryClient.setQueryData(
    [GET_CASE_DETAIL_QUERY_KEY, caseId],
    (oldData?: CASE_DETAIL) => {
      if (oldData) {
        const newData = {
          ...oldData,
          ...data,
        };
        isCurrentActiveCase &&
          updateTrackerValue({
            currentActiveCase: newData,
          });
        return newData;
      }
      return oldData;
    },
  );
}

export function updateCaseVoiceNoteDetailInCache(updateData: {
  caseId: number;
  data: Partial<VOICE_NOTE>;
}) {
  const {caseId, data} = updateData;
  queryClient.setQueryData(
    [GET_CASE_DETAIL_QUERY_KEY, caseId],
    (oldData?: CASE_DETAIL) => {
      if (oldData) {
        const newData = {
          ...oldData,
          caseNotes: oldData?.caseNotes?.map(note => {
            if (note?.id === data?.id) {
              return {
                ...note,
                ...data,
              };
            }
            return note;
          }),
        };

        return newData;
      }
      return oldData;
    },
  );
}

export function updateCaseTimerDetailInCache(updateData: {
  caseId: number;
  data: Partial<TIMER>;
}) {
  const {caseId, data} = updateData;
  queryClient.setQueryData(
    [GET_CASE_DETAIL_QUERY_KEY, caseId],
    (oldData?: CASE_DETAIL) => {
      if (oldData) {
        const newData = {
          ...oldData,
          timers: oldData?.timers?.map(timer => {
            if (timer?.id === data?.id) {
              return {
                ...timer,
                ...data,
              };
            }
            return timer;
          }),
        };

        return newData;
      }
      return oldData;
    },
  );
}

export function appendRevisionToCaseDetailCache(updateData: {
  isOptionalMilestone?: boolean;
  revision:
    | (UPDATE_MILESTONE_REVISION_REQUEST & {optionalMilestoneId?: number})
    | (UPDATE_OPTIONAL_MILESTONE_REVISION_REQUEST & {milestoneId?: number});
  isCurrentActiveCase?: boolean;
}) {
  const {isCurrentActiveCase, isOptionalMilestone} = updateData;
  const {caseId, ...revisionData} = updateData?.revision ?? {};
  queryClient.setQueryData(
    [GET_CASE_DETAIL_QUERY_KEY, caseId],
    (oldData?: CASE_DETAIL) => {
      if (!oldData) {
        return null;
      }
      const milestones = isOptionalMilestone
        ? oldData?.procedure?.optionalMilestones
        : oldData?.procedure?.milestones;

      const updatedMilestones: Array<MILESTONE> = milestones.map(milestone => {
        const milestoneId = isOptionalMilestone
          ? revisionData?.optionalMilestoneId
          : revisionData?.milestoneId;
        if (milestone.id === milestoneId) {
          return {
            ...milestone,
            completedTimestamp:
              revisionData?.milestoneEndTime ??
              revisionData?.milestoneStartTime,
            loggedBy: revisionData?.milestoneRevisedByUserName,
            skipped: false,
            revisions: [...milestone.revisions, revisionData as REVISION],
          };
        }
        return milestone;
      });

      const newData: CASE_DETAIL = {
        ...oldData,
        procedure: isOptionalMilestone
          ? {
              ...oldData.procedure,
              optionalMilestones: updatedMilestones,
            }
          : {
              ...oldData.procedure,
              milestones: updatedMilestones,
            },
      };

      isCurrentActiveCase &&
        updateTrackerValue({
          currentActiveCase: newData,
        });

      return newData;
    },
  );
}
