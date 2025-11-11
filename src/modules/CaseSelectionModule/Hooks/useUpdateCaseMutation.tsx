import {useMutation} from '@tanstack/react-query';
import {AxiosResponse} from 'axios';
import {CASE_DETAIL} from '../Types/CommonTypes';
import {fetcher} from '@utils/Axios';
import {UPDATE_CASE_REQUEST} from '../Types/RequestTypes';
import {updateCaseDetailInCache} from '../../CasesModule/Hooks/useGetCaseDetailQuery';
import removeEmptyKeys from '@helpers/removeEmptyKeys';

async function updateCase(
  reqBody: UPDATE_CASE_REQUEST,
): Promise<AxiosResponse<CASE_DETAIL>> {
  const {caseId, ...rest} = reqBody;

  const data = removeEmptyKeys(rest);
  return fetcher({
    method: 'PATCH',
    url: `case/${caseId}`,
    data: data,
  });
}

export default function useUpdateCaseMutation(
  isCurrentActiveCase: boolean = true,
) {
  return useMutation({
    mutationFn: updateCase,
    onSuccess: (_, {caseId, ...rest}) => {
      updateCaseDetailInCache({
        caseId,
        data: rest,
        isCurrentActiveCase,
      });
    },
  });
}
