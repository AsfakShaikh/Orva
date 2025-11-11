// Not in use
import useTrackerValue from '@modules/TrackerModule/Hooks/useTrackerValues';
import {useQuery} from '@tanstack/react-query';
import {fetcher} from '@utils/Axios';
import {
  GET_MILESTONE_REVISION_REQUEST,
  UPDATE_MILESTONE_REVISION_REQUEST,
} from '../Types/RequestTypes';
import {GET_MILESTONE_REVISION_RESPONSE} from '../Types/ResponseTypes';
import {queryClient} from '@utils/ReactQueryConfig';
import useAuthValue from '@modules/AuthModule/Hooks/useAuthValue';

export const GET_MILESTONE_REVISION_QUERY_KEY =
  'case/${caseId}/milestone/revisions?otId=${otId}';

async function getMilestoneRevision(
  reqBody: GET_MILESTONE_REVISION_REQUEST,
): Promise<GET_MILESTONE_REVISION_RESPONSE> {
  const {caseId, otId} = reqBody ?? {};
  const {data} = await fetcher({
    url: `case/${caseId}/milestone/revisions?otId=${otId}`,
  });

  return data;
}

export default function useGetMilestoneRevisionQuery(caseId?: number) {
  const {currentActiveCase} = useTrackerValue();
  const {selectedOt} = useAuthValue();
  const finalCaseId = caseId ?? currentActiveCase?.id;
  return useQuery({
    queryKey: [GET_MILESTONE_REVISION_QUERY_KEY, finalCaseId, selectedOt?.uuid],
    queryFn: () =>
      getMilestoneRevision({
        caseId: finalCaseId,
        otId: selectedOt?.uuid,
      }),
    enabled: !!finalCaseId && !!selectedOt?.uuid,
  });
}

export function appendRevisionToMilestoneRevisionsCache(
  updateData: UPDATE_MILESTONE_REVISION_REQUEST & {otId: string},
) {
  const {caseId, otId, ...rest} = updateData;
  queryClient.setQueryData(
    [GET_MILESTONE_REVISION_QUERY_KEY, caseId, otId],
    (oldData: GET_MILESTONE_REVISION_RESPONSE) => {
      if (oldData) {
        let newData = JSON.parse(JSON.stringify(oldData));

        const currentMilestoneIndex = oldData?.findIndex(
          i => i?.milestoneUUID === rest?.milestoneUUID,
        );

        if (currentMilestoneIndex >= 0) {
          newData[currentMilestoneIndex].revisions.push(rest);
        } else {
          newData.push({
            milestoneId: rest?.milestoneId,
            milestoneUUID: rest?.milestoneUUID,
            revisions: [rest],
          });
        }
        return newData;
      }

      return oldData;
    },
  );
}
