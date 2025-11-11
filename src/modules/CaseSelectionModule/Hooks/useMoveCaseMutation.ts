import { useMutation } from '@tanstack/react-query';
import { fetcher } from '@utils/Axios';
import { MOVE_CASE_REQUEST } from '../Types/RequestTypes';

async function moveCase(
  reqBody: MOVE_CASE_REQUEST,
) {
  const body = { ...reqBody };
  const { newOtId, caseDetail } = body ?? {};
  return fetcher({
    url: `v2/case?newOtId=${newOtId}`,
    method: 'POST',
    data: caseDetail,
  });
}

export default function usemoveCaseMutation(
) {
  return useMutation({
    mutationFn: moveCase,
    onSuccess: (_) => {
      
    },
  });
}
