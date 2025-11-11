import {useMutation} from '@tanstack/react-query';
import {fetcher} from '@utils/Axios';
import {UPDATE_MILESTONE_REVISION_REQUEST} from '../Types/RequestTypes';
import removeEmptyKeys from '@helpers/removeEmptyKeys';
import {appendRevisionToCaseDetailCache} from '@modules/CasesModule/Hooks/useGetCaseDetailQuery';

async function updateMilestoneRevision(
  reqBody: UPDATE_MILESTONE_REVISION_REQUEST,
) {
  const {caseId, ...reset} = reqBody ?? {};
  return fetcher({
    url: `case/${caseId}/milestone/revision`,
    method: 'PATCH',
    data: removeEmptyKeys(reset),
  });
}

export default function useUpdateMilestoneRevisionMutation(
  isCurrentActiveCase?: boolean,
) {
  return useMutation({
    mutationFn: updateMilestoneRevision,
    onSuccess: (_, revision) => {
      appendRevisionToCaseDetailCache({
        isOptionalMilestone: false,
        revision,
        isCurrentActiveCase,
      });
    },
  });
}
