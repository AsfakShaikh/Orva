import {useMutation} from '@tanstack/react-query';
import {fetcher} from '@utils/Axios';
import {EDIT_VOCE_NOTE_REQUEST} from '../Types/RequestTypes';

async function editVoiceNote(reqBody: EDIT_VOCE_NOTE_REQUEST) {
  return fetcher({
    url: `case/note/${reqBody?.noteId}`,
    method: 'PATCH',
    data: {
      note: reqBody?.note,
    },
  });
}

export default function useEditVoiceNoteMutation() {
  return useMutation({
    mutationFn: editVoiceNote,
  });
}
