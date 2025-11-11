import {useMutation} from '@tanstack/react-query';
import {fetcher} from '@utils/Axios';
import {editVoiceNoteOnListQueryCache} from './useGetVoiceNotesListQuery';
import {DELETE_VOCE_NOTE_REQUEST} from '../Types/RequestTypes';

async function deleteVoiceNote(reqBody: DELETE_VOCE_NOTE_REQUEST) {
  return fetcher({
    url: `case/note/${reqBody?.noteId}`,
    method: 'DELETE',
    data: {
      isEnabled: false,
    },
  });
}

export default function useDeleteVoiceNoteMutation(cb?: () => void) {
  return useMutation({
    mutationFn: deleteVoiceNote,
    onSuccess: (res, req) => {
      if (res?.status >= 200 && res?.status <= 299) {
        cb?.();
        editVoiceNoteOnListQueryCache({
          ...req,
          noteData: {
            active: false,
          },
        });
      }
    },
  });
}
