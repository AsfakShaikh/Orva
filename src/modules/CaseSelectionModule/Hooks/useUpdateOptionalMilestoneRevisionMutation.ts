import {useMutation} from '@tanstack/react-query';
import {fetcher} from '@utils/Axios';
import {UPDATE_OPTIONAL_MILESTONE_REVISION_REQUEST} from '../Types/RequestTypes';
import removeEmptyKeys from '@helpers/removeEmptyKeys';
import {appendRevisionToCaseDetailCache} from '@modules/CasesModule/Hooks/useGetCaseDetailQuery';

async function updateOptionalMilestoneRevision(
  reqBody: UPDATE_OPTIONAL_MILESTONE_REVISION_REQUEST,
) {
  const body = {...reqBody};
  const {caseId, ...reset} = body ?? {};
  return fetcher({
    url: `v2/case/${caseId}/optional-milestone/revision`,
    method: 'PATCH',
    data: removeEmptyKeys(reset),
  });
}

export default function useUpdateOptionalMilestoneRevisionMutation(
  isCurrentActiveCase?: boolean,
) {
  return useMutation({
    mutationFn: updateOptionalMilestoneRevision,
    onSuccess: (_, revision) => {
      appendRevisionToCaseDetailCache({
        isOptionalMilestone: true,
        revision,
        isCurrentActiveCase,
      });
    },
  });
}
