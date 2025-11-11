import {useMutation} from '@tanstack/react-query';
import {fetcher} from '@utils/Axios';
import {AxiosResponse} from 'axios';
import {ADD_SURGEON_REQUEST} from '../Types/RequestTypes';
import {appendSurgeonToSurgeonsListCache} from './useGetSurgeonsListQuery';
import {SURGEON} from '../Types/CommonTypes';

async function addSurgeon(
  reqBody: ADD_SURGEON_REQUEST,
): Promise<AxiosResponse<SURGEON>> {
  const {hospitalId, ...restReqBody} = reqBody;
  return fetcher({
    method: 'POST',
    url: `admin/${hospitalId}/surgeon`,
    data: restReqBody,
  });
}

export default function useAddSurgeonMutation() {
  return useMutation({
    mutationFn: addSurgeon,
    onSuccess: res => {
      appendSurgeonToSurgeonsListCache(res?.data);
    },
  });
}
