import React, {useMemo, useState} from 'react';
import SideModalDrawer, {
  SideModalDrawerBody,
} from '@components/SideModalDrawer';
import {Strings} from '@locales/Localization';
import useEventEmitter, {emitEvent} from '@hooks/useEventEmitter';
import Switch from '@components/Switch';
import useEditVoiceNoteClassificationMutation from '../Hooks/useEditVoiceNoteClassificationMutation';
import useFetchCaseNoteCategoriesQuery, {
  editVoiceNoteClassificationInQueryCache,
} from '../Hooks/useFetchCaseNoteCategoriesQuery';
import {editVoiceNoteClassificationInNotesQueryCache} from '../Hooks/useGetVoiceNotesListQuery';

type VoiceNoteClassificationEditModalProps = {
  caseId?: number;
  noteId?: number;
};

const VOICE_NOTE_CLASSIFICATION_EDIT_MODAL_EVENT =
  'VOICE_NOTE_CLASSIFICATION_EDIT_MODAL_EVENT';

export const toggleVoiceNoteClassificationEditModal = (
  data?: VoiceNoteClassificationEditModalProps,
) => {
  emitEvent(VOICE_NOTE_CLASSIFICATION_EDIT_MODAL_EVENT, data);
};

const VoiceNoteClassificationEditModal = () => {
  const [visible, setVisible] = useState(false);
  const [classificationEditData, setClassificationEditData] =
    useState<VoiceNoteClassificationEditModalProps>();
  const {noteId, caseId} = classificationEditData ?? {};

  const {data: classificationsListData} =
    useFetchCaseNoteCategoriesQuery(noteId);
  const classificationsList = useMemo(
    () =>
      [...(classificationsListData ?? [])].sort((a, b) =>
        a.type.localeCompare(b.type),
      ),
    [classificationsListData],
  );

  const {mutate: editClassificationMutate} =
    useEditVoiceNoteClassificationMutation();

  useEventEmitter(
    VOICE_NOTE_CLASSIFICATION_EDIT_MODAL_EVENT,
    (data?: VoiceNoteClassificationEditModalProps) => {
      setVisible(prev => !prev);
      if (data) {
        setClassificationEditData(data);
      }
    },
  );
  const handleSwitchChange = (
    val: boolean,
    type: string,
    classificationId?: number,
  ) => {
    const updatePayload = {
      noteId,
      classificationType: type,
      classificationData: {
        isEnabled: val,
      },
    };
    editVoiceNoteClassificationInNotesQueryCache({
      ...updatePayload,
      caseId,
    });
    editVoiceNoteClassificationInQueryCache(updatePayload);
    editClassificationMutate({
      noteId,
      classificationId: classificationId,
      isEnabled: val,
      isAIGenerated: false,
    });
  };
  return (
    <SideModalDrawer
      title={Strings.Edit_Classifications}
      visible={visible}
      onClose={() => {
        setVisible(false);
      }}>
      <SideModalDrawerBody>
        {classificationsList?.map(classification => {
          const {id, type, colorCode, isEnabled, isAIGenerated} =
            classification ?? {};
          return (
            <Switch
              key={id}
              title={type}
              bulletColor={colorCode}
              value={isEnabled}
              isAIGenerated={isAIGenerated}
              onValueChange={val => handleSwitchChange(val, type, id)}
            />
          );
        })}
      </SideModalDrawerBody>
    </SideModalDrawer>
  );
};

export default VoiceNoteClassificationEditModal;
