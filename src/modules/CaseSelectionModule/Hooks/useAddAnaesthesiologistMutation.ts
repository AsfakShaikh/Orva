import {useMutation} from '@tanstack/react-query';
import {fetcher} from '@utils/Axios';
import {AxiosResponse} from 'axios';
import {ADD_ANAESTHESIOLOGIST_REQUEST} from '../Types/RequestTypes';
import {appendAnesthesiologistToListCache} from './useGetAnaesthelogistListQuery';
import {ANESTHELOGIST} from '../Types/CommonTypes';

async function addAnaesthesiologist(
  reqBody: ADD_ANAESTHESIOLOGIST_REQUEST,
): Promise<AxiosResponse<ANESTHELOGIST>> {
  const {hospitalId, ...restReqBody} = reqBody;
  return fetcher({
    method: 'POST',
    url: `admin/${hospitalId}/anaesthelogist`,
    data: restReqBody,
  });
}

export default function useAddAnaesthesiologistMutation() {
  return useMutation({
    mutationFn: addAnaesthesiologist,
    onSuccess: res => {
      appendAnesthesiologistToListCache(res?.data);
    },
  });
}
