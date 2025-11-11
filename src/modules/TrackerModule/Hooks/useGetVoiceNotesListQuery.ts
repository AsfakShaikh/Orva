import {useQuery} from '@tanstack/react-query';
import {fetcher} from '@utils/Axios';
import {queryClient} from '@utils/ReactQueryConfig';
import {GET_VOICE_NOTES_LIST_RESPONSE} from '../Types/ResponseTypes';
import {
  VOICE_NOTE,
  VOICE_NOTE_CLASSIFICATON,
} from '@modules/TrackerModule/Types/CommonTypes';

const GET_VOICE_NOTES_QUERY_KEY = 'case/${caseId}/notes';

async function getVoiceNotesList(
  caseId?: number,
): Promise<GET_VOICE_NOTES_LIST_RESPONSE> {
  const {data} = await fetcher({url: `case/${caseId}/notes`});
  return data;
}
export default function useGetVoiceNotesListQuery(
  caseId?: number,
  enabled: boolean = true,
) {
  return useQuery({
    queryKey: [GET_VOICE_NOTES_QUERY_KEY, caseId],
    queryFn: () => getVoiceNotesList(caseId),
    enabled: !!caseId && enabled,
  });
}

export function addVoiceNoteToQueryCache(updateData?: {
  caseId?: number;
  noteData?: Partial<VOICE_NOTE>;
}) {
  const {caseId, noteData} = updateData ?? {};

  queryClient.setQueryData(
    [GET_VOICE_NOTES_QUERY_KEY, caseId],
    (oldData?: GET_VOICE_NOTES_LIST_RESPONSE) => {
      if (oldData) {
        return [...oldData, noteData];
      }

      return [noteData];
    },
  );
}

export function editVoiceNoteOnListQueryCache(updateData?: {
  caseId?: number | null;
  noteId?: number | null;
  noteData?: Partial<VOICE_NOTE>;
}) {
  const {caseId, noteId, noteData} = updateData ?? {};

  if (caseId && noteId) {
    queryClient.setQueryData(
      [GET_VOICE_NOTES_QUERY_KEY, caseId],
      (oldData: GET_VOICE_NOTES_LIST_RESPONSE) => {
        if (oldData) {
          const newData = oldData?.map(note => {
            if (noteId === note?.id) {
              return {
                ...note,
                ...noteData,
              };
            }
            return note;
          });

          return newData;
        }

        return oldData;
      },
    );
  }
}

export function editVoiceNoteClassificationInNotesQueryCache(updateData?: {
  caseId?: number | null;
  noteId?: number | null;
  classificationType?: string; // this must be replaced with id
  classificationData?: Partial<VOICE_NOTE_CLASSIFICATON>;
}) {
  const {caseId, noteId, classificationType, classificationData} =
    updateData ?? {};

  if (caseId && noteId && classificationType && classificationData) {
    queryClient.setQueryData(
      [GET_VOICE_NOTES_QUERY_KEY, caseId],
      (oldData: GET_VOICE_NOTES_LIST_RESPONSE) => {
        if (oldData) {
          let newData: GET_VOICE_NOTES_LIST_RESPONSE = JSON.parse(
            JSON.stringify(oldData),
          );
          const currentNote = newData?.find(note => note?.id === noteId);
          if (!currentNote?.classifications) {
            return newData;
          }

          const currentClassification = currentNote?.classifications?.find(
            classification => classification?.type === classificationType,
          );

          if (!currentClassification) {
            return newData;
          }

          Object.assign(currentClassification, classificationData);

          return newData;
        }

        return oldData;
      },
    );
  }
}
