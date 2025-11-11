import {useMutation} from '@tanstack/react-query';
import {fetcher} from '@utils/Axios';
import {RECORD_CASE_NOTE_REQUEST} from '../Types/RequestTypes';
import {addVoiceNoteToQueryCache} from './useGetVoiceNotesListQuery';

async function recordCaseNote(reqBody: RECORD_CASE_NOTE_REQUEST) {
  return fetcher({
    url: 'case/note',
    method: 'POST',
    data: reqBody,
  });
}

export default function useRecordCaseNoteMutation(cb?: (data: any) => void) {
  return useMutation({
    mutationFn: recordCaseNote,
    onSuccess: res => {
      const {status, data} = res;
      if (status >= 200 && status <= 299) {
        cb?.(data);
        addVoiceNoteToQueryCache({
          caseId: data?.caseId,
          noteData: data,
        });
      }
    },
  });
}
