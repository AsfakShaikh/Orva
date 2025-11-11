import {useMutation} from '@tanstack/react-query';
import {fetcher} from '@utils/Axios';
import {SWICTH_CASE_SELECTION_REQUEST} from '../Types/RequestTypes';
import {AxiosResponse} from 'axios';
import {SWICTH_CASE_SELECTION_RESPONSE} from '../Types/ResponseTypes';
import {API_STATUS} from '@utils/Types';
import {NavigationProp, useNavigation} from '@react-navigation/native';
import {MainStackParamList} from '@navigation/Types/CommonTypes';
import {MAIN_STACK_ROUTE_NAME} from '@utils/Constants';

function switchCaseOwner(
  data: SWICTH_CASE_SELECTION_REQUEST,
): Promise<AxiosResponse<SWICTH_CASE_SELECTION_RESPONSE>> {
  return fetcher({
    url: 'switch_case_owner/',
    method: 'POST',
    data: {
      ...data,
    },
  });
}

export default function useSwitchCaseOwnerMutation(cb?: () => void) {
  const {navigate} =
    useNavigation<
      NavigationProp<MainStackParamList, MAIN_STACK_ROUTE_NAME.OT_SELECTION>
    >();
  return useMutation({
    mutationFn: switchCaseOwner,
    onSuccess: res => {
      const {status, data} = res;
      if (status === 200 && data?.status === API_STATUS.SUCCESS) {
        cb?.();
        navigate(MAIN_STACK_ROUTE_NAME.HOME_DRAWER);
      }
    },
  });
}
