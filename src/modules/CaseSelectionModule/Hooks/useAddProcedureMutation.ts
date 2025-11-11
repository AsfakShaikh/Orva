import {useMutation} from '@tanstack/react-query';
import {fetcher} from '@utils/Axios';
import {AxiosResponse} from 'axios';
import {UPSERT_PROCEDURE_REQUEST} from '../Types/RequestTypes';
import {appendProcedureToListCache} from './useGetProcedureListQuery';
import {PROCEDURE, PROCEDURE_STATUS} from '../Types/CommonTypes';
import removeEmptyKeys from '@helpers/removeEmptyKeys';
async function upsertProcedure(
  reqBody: UPSERT_PROCEDURE_REQUEST,
): Promise<AxiosResponse<PROCEDURE>> {
  const {hospitalId, ...restReqBody} = reqBody;
  const payload = {
    displayName: restReqBody.name.trim(),
    name: restReqBody.name.trim(),
    status: PROCEDURE_STATUS.INCOMPLETE,
    cptCode: restReqBody.cptCode?.trim(),
  };

  return fetcher({
    method: 'POST',
    url: `admin/${hospitalId}/procedure/upsert`,
    data: removeEmptyKeys(payload),
  });
}

export default function useAddProcedureMutation(cb?: (res: PROCEDURE) => void) {
  return useMutation({
    mutationFn: upsertProcedure,
    onSuccess: res => {
      appendProcedureToListCache(res?.data);
      cb?.(res?.data);
    },
  });
}
