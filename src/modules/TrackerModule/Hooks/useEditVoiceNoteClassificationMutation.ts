import {useMutation} from '@tanstack/react-query';
import {fetcher} from '@utils/Axios';
import {EDIT_VOCE_NOTE_CLASSIFICATION_REQUEST} from '../Types/RequestTypes';

async function editVoiceNoteClassification(
  req: EDIT_VOCE_NOTE_CLASSIFICATION_REQUEST,
) {
  const {noteId, classificationId, isEnabled, isAIGenerated} = req ?? {};
  return fetcher({
    url: `case/note/${noteId}/classifications/${classificationId}`,
    method: 'PATCH',
    data: {isEnabled, isAIGenerated},
  });
}

const useEditVoiceNoteClassificationMutation = (cb?: () => void) => {
  return useMutation({
    mutationFn: editVoiceNoteClassification,
    onSuccess: res => {
      if (res?.status >= 200 && res?.status <= 299) {
        cb?.();
      }
    },
  });
};

export default useEditVoiceNoteClassificationMutation;
