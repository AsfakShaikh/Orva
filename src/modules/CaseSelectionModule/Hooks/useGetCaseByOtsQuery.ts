import {fetcher} from '@utils/Axios';
import {
  DELETE_CASE_REQUEST,
  GET_CASE_BY_OTS_REQUEST,
} from '../Types/RequestTypes';
import {useQuery} from '@tanstack/react-query';
import {GET_CASE_BY_OTS_RESPONSE} from '../Types/ResponseTypes';
import {queryClient} from '@utils/ReactQueryConfig';
import {CASE_DETAIL, CASE_STATUS} from '../Types/CommonTypes';
import formatDateTime, {FORMAT_DATE_TYPE} from '@helpers/formatDateTime';

export const GET_CASE_BY_OTS_QUERY_KEY = 'cases?ots=';

async function getCaseByOts(
  req: GET_CASE_BY_OTS_REQUEST,
): Promise<GET_CASE_BY_OTS_RESPONSE> {
  const {otIds, caseStatus = CASE_STATUS.ALL_CASES} = req;

  const now = new Date();
  const date = formatDateTime(now, FORMAT_DATE_TYPE.NONE, 'yyyy-MM-dd');
  const {data} = await fetcher({
    url: `cases?ots=${otIds}&startDate=${date}&caseStatus=${caseStatus}`,
  });

  const newData = data?.sort((a: any, b: any) => {
    return (
      new Date(a?.startTime)?.getTime() - new Date(b?.startTime)?.getTime()
    );
  });

  return newData;
}

export default function useGetCaseByOtsQuery(
  req: GET_CASE_BY_OTS_REQUEST,
  enabled: boolean = true,
) {
  const {otIds, caseStatus = CASE_STATUS.ALL_CASES} = req;

  return useQuery({
    queryKey: [GET_CASE_BY_OTS_QUERY_KEY, otIds, caseStatus],
    queryFn: () => getCaseByOts(req),
    enabled: otIds?.length > 0 && enabled,
  });
}

export function addCaseToCaseByOtListCache(
  caseDetail?: CASE_DETAIL,
  queryCaseStatus: CASE_STATUS = CASE_STATUS.ALL_CASES,
) {
  if (caseDetail) {
    const {otId} = caseDetail;
    queryClient.setQueryData(
      [GET_CASE_BY_OTS_QUERY_KEY, otId, queryCaseStatus],
      (oldData: GET_CASE_BY_OTS_RESPONSE = []) => {
        const newData: GET_CASE_BY_OTS_RESPONSE = [caseDetail, ...oldData];
        return newData;
      },
    );
  }
}

export function removeCaseFromCaseByOtListCache(
  caseDetail?: DELETE_CASE_REQUEST,
  queryCaseStatus: CASE_STATUS = CASE_STATUS.ALL_CASES,
) {
  if (caseDetail) {
    const {otId} = caseDetail;
    queryClient.setQueryData(
      [GET_CASE_BY_OTS_QUERY_KEY, otId, queryCaseStatus],
      (oldData: GET_CASE_BY_OTS_RESPONSE | undefined) => {
        if (oldData) {
          return oldData.filter(item => item?.id !== caseDetail?.id);
        }
        return oldData;
      },
    );
  }
}

// This update the old case if present else add new case at top of list
export function addOrUpdateCaseInCaseByOtListCache(
  caseDetail?: CASE_DETAIL,
  queryCaseStatus: CASE_STATUS = CASE_STATUS.ALL_CASES,
) {
  if (!caseDetail) {
    return;
  }

  const {id: caseId, otId} = caseDetail;

  queryClient.setQueryData(
    [GET_CASE_BY_OTS_QUERY_KEY, otId, queryCaseStatus],
    (oldData: GET_CASE_BY_OTS_RESPONSE = []) => {
      const existingIndex = oldData.findIndex(item => item?.id === caseId);

      if (existingIndex !== -1) {
        // Update existing case - create new array with updated item
        return oldData.map((item, index) =>
          index === existingIndex ? caseDetail : item,
        );
      } else {
        // Add new case at the beginning
        return [caseDetail, ...oldData];
      }
    },
  );
}

// This update the old case if present else refetch case list of prevent the order of cases
export function updateOrRefetchCaseInCaseByOtListCache(
  caseDetail?: CASE_DETAIL,
  queryCaseStatus: CASE_STATUS = CASE_STATUS.ALL_CASES,
) {
  if (!caseDetail) {
    return;
  }

  const {id: caseId, otId} = caseDetail;

  queryClient.setQueryData(
    [GET_CASE_BY_OTS_QUERY_KEY, otId, queryCaseStatus],
    (oldData: GET_CASE_BY_OTS_RESPONSE = []) => {
      const existingIndex = oldData.findIndex(item => item?.id === caseId);

      if (existingIndex !== -1) {
        // Update existing case - create new array with updated item
        return oldData.map((item, index) =>
          index === existingIndex ? caseDetail : item,
        );
      } else {
        // Refetch to maintain proper order
        queryClient.refetchQueries({
          queryKey: [GET_CASE_BY_OTS_QUERY_KEY, otId, queryCaseStatus],
        });
        return oldData; // Return unchanged data since we're refetching
      }
    },
  );
}
