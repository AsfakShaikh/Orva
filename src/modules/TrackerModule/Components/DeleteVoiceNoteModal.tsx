import React, {useState} from 'react';
import useEventEmitter, {emitEvent} from '@hooks/useEventEmitter';
import {Strings} from '@locales/Localization';
import CommonAlert from '@components/CommonAlert';
import useDeleteVoiceNoteMutation from '../Hooks/useDeleteVoiceNoteMutation';

const DELETE_VOICE_NOTE_MODAL_EVENT = 'DELETE_VOICE_NOTE_MODAL_EVENT';

type DeleteVoiceNoteModalProps = {
  noteId?: number;
  caseId?: number;
};

export function toggleDeleteVoiceNoteModal(
  noteData?: DeleteVoiceNoteModalProps,
) {
  emitEvent(DELETE_VOICE_NOTE_MODAL_EVENT, noteData);
}

const DeleteVoiceNoteModal = () => {
  const [visible, setVisible] = useState(false);
  const [voiceNoteData, setVoiceNoteData] =
    useState<DeleteVoiceNoteModalProps>();

  useEventEmitter(
    DELETE_VOICE_NOTE_MODAL_EVENT,
    (noteData?: DeleteVoiceNoteModalProps) => {
      setVisible(prev => !prev);
      setVoiceNoteData(noteData);
    },
  );

  const {mutate: deleteVoiceNoteMutate} = useDeleteVoiceNoteMutation(
    toggleDeleteVoiceNoteModal,
  );

  return (
    <CommonAlert
      visible={visible}
      onDismiss={toggleDeleteVoiceNoteModal}
      heading={Strings.Delete_Voice_Note}
      subHeading={Strings.Delete_Voice_Note_Subheading}
      headerTextAlign="left"
      buttonsArr={[
        {
          id: '1',
          title: Strings.Delete_Note,
          onPress: () => {
            voiceNoteData && deleteVoiceNoteMutate(voiceNoteData);
          },
        },
        {
          id: '2',
          title: Strings.Cancel,
          onPress: () => toggleDeleteVoiceNoteModal(),
        },
      ]}
    />
  );
};

export default DeleteVoiceNoteModal;
