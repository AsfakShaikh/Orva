// Not in use
import {fetcher} from '@utils/Axios';
import {GET_OPTIONAL_MILESTONES_RESPONSE} from '../Types/ResponseTypes';
import {useQuery} from '@tanstack/react-query';
import useTrackerValue from '@modules/TrackerModule/Hooks/useTrackerValues';
import {
  GET_MILESTONE_REVISION_REQUEST,
  UPDATE_OPTIONAL_MILESTONE_REVISION_REQUEST,
} from '../Types/RequestTypes';
import {queryClient} from '@utils/ReactQueryConfig';
import useAuthValue from '@modules/AuthModule/Hooks/useAuthValue';

export const GET_CASE_OPTIONAL_MILESTONES_QUERY_KEY =
  'case/${caseId}/optional/milestone/revisions';

async function getOptionalMilestonesRevisionQuery(
  reqBody: GET_MILESTONE_REVISION_REQUEST,
): Promise<GET_OPTIONAL_MILESTONES_RESPONSE> {
  const {caseId, otId} = reqBody ?? {};

  const {data} = await fetcher({
    url: `case/${caseId}/optional/milestone/revisions?otId=${otId}`,
  });

  return data;
}

export default function useGetOptionalMilestonesRevisionQuery(caseId?: number) {
  const {currentActiveCase} = useTrackerValue();
  const {selectedOt} = useAuthValue();
  const finalCaseId = caseId ?? currentActiveCase?.id;
  return useQuery({
    queryKey: [
      GET_CASE_OPTIONAL_MILESTONES_QUERY_KEY,
      finalCaseId,
      selectedOt?.uuid,
    ],
    queryFn: () =>
      getOptionalMilestonesRevisionQuery({
        caseId: finalCaseId,
        otId: selectedOt?.uuid,
      }),
    enabled: !!finalCaseId && !!selectedOt?.uuid,
  });
}

export function appendRevisionToOptionalMilestoneRevisionsCache(
  updateData: UPDATE_OPTIONAL_MILESTONE_REVISION_REQUEST & {otId: string},
) {
  const {caseId, otId, ...rest} = updateData;
  queryClient.setQueryData(
    [GET_CASE_OPTIONAL_MILESTONES_QUERY_KEY, caseId, otId],
    (oldData: GET_OPTIONAL_MILESTONES_RESPONSE) => {
      if (oldData) {
        let newData = JSON.parse(JSON.stringify(oldData));

        const currentMilestoneIndex = oldData?.findIndex(
          i => i?.milestoneName === rest?.milestoneName,
        );

        if (currentMilestoneIndex >= 0) {
          newData[currentMilestoneIndex].revisions.push(rest);
        } else {
          newData.push({
            milestoneName: rest?.milestoneName,
            revisions: [rest],
          });
        }

        return newData;
      }

      return oldData;
    },
  );
}
