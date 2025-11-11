import {VOICE_NOTE_CLASSIFICATON} from '@modules/TrackerModule/Types/CommonTypes';
import {useQuery} from '@tanstack/react-query';
import {fetcher} from '@utils/Axios';
import {queryClient} from '@utils/ReactQueryConfig';

export const GET_CASE_NOTES_CLASSIFICATION_QUERY_KEY =
  'case/note/${noteId}/classifications';

async function fetchCaseNoteCategories(
  noteId?: number,
): Promise<VOICE_NOTE_CLASSIFICATON[]> {
  const {data} = await fetcher({url: `/case/note/${noteId}/classifications`});
  return data;
}

export default function useFetchCaseNoteCategoriesQuery(
  noteId?: number,
  enabled: boolean = true,
) {
  return useQuery({
    queryKey: [GET_CASE_NOTES_CLASSIFICATION_QUERY_KEY, noteId],
    queryFn: () => fetchCaseNoteCategories(noteId),
    enabled: !!noteId && enabled,
  });
}

export function editVoiceNoteClassificationInQueryCache(updateData?: {
  noteId?: number;
  classificationType?: string; // this must be replaced with id
  classificationData?: Partial<VOICE_NOTE_CLASSIFICATON>;
}) {
  const {noteId, classificationType, classificationData} = updateData ?? {};

  if (noteId && classificationType && classificationData) {
    queryClient.setQueryData(
      [GET_CASE_NOTES_CLASSIFICATION_QUERY_KEY, noteId],
      (oldData: Array<VOICE_NOTE_CLASSIFICATON>) => {
        if (oldData) {
          const newData = oldData?.map(classification => {
            if (classification?.type === classificationType) {
              return {
                ...classification,
                ...classificationData,
              };
            }
            return classification;
          });

          return newData;
        }

        return oldData;
      },
    );
  }
}
