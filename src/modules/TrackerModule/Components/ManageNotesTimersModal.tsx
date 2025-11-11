import Button from '@components/Button';
import InputText from '@components/InputText';
import SideModalDrawer, {
  SideModalDrawerBody,
} from '@components/SideModalDrawer';
import useEventEmitter, {emitEvent} from '@hooks/useEventEmitter';
import {Strings} from '@locales/Localization';
import {globalStyles} from '@styles/GlobalStyles';
import scaler from '@utils/Scaler';
import React, {useCallback, useMemo, useState} from 'react';
import {useForm} from 'react-hook-form';
import {StyleSheet, View} from 'react-native';
import {SegmentedButtons} from 'react-native-paper';
import {TIMER_STATUS, TIMER_TYPE, VOICE_NOTE_TYPE} from '../Types/CommonTypes';
import useRecordCaseNoteMutation from '../Hooks/useRecordCaseNoteMutation';
import SpeechDetection from '@nativeModules/SpeechDetection';
import useAuthValue from '@modules/AuthModule/Hooks/useAuthValue';
import {fireVoiceNoteListScrollEvent} from './VoiceNotesList';
import useCreateManualTimerMutation from '../Hooks/useCreateManualTimerMutation';
import {VOICE_NOTE} from '@modules/TrackerModule/Types/CommonTypes';
import useEditVoiceNoteMutation from '../Hooks/useEditVoiceNoteMutation';
import {addSeconds} from 'date-fns';
import InputDuration from '@components/InputDuration';
import {editVoiceNoteOnListQueryCache} from '../Hooks/useGetVoiceNotesListQuery';
import {EDIT_VOCE_NOTE_REQUEST} from '../Types/RequestTypes';

const MANAGE_NOTES_TIMER_MODAL_EVENT = 'MANAGE_NOTES_TIMER_MODAL_EVENT';

interface ManageNotesTimersModalProps {
  type?: VOICE_NOTE_TYPE;
  caseId?: number;
  voiceNote?: VOICE_NOTE;
}

export const toggleManageNotesTimerModal = (
  data?: ManageNotesTimersModalProps,
) => {
  emitEvent(MANAGE_NOTES_TIMER_MODAL_EVENT, data);
};

const ManageNotesTimersModal = () => {
  const {user, userId} = useAuthValue();
  const [visible, setVisible] = useState(false);
  const [detail, setDetail] = useState<ManageNotesTimersModalProps>();
  const [type, setType] = useState<VOICE_NOTE_TYPE>(VOICE_NOTE_TYPE.VOICE_NOTE);

  const isEdit = useMemo(() => {
    return !!detail?.voiceNote;
  }, [detail?.voiceNote]);

  const {control, watch, reset, handleSubmit} = useForm();

  const onClose = useCallback(() => {
    reset();
    setVisible(false);
  }, [reset]);

  const classifyVoiceNote = useCallback(
    (data: any) => {
      const {note, id} = data;
      if (data) {
        SpeechDetection.processCaseNoteClassification(note, id, user?.username);
      }
    },
    [user?.username],
  );

  const {mutate: recordCaseNoteMutate, isPending: isRecordingCaseNote} =
    useRecordCaseNoteMutation(classifyVoiceNote);

  const {mutate: editVoiceNoteMutate, isPending: isEditingVoiceNote} =
    useEditVoiceNoteMutation();

  const {mutate: createManualTimerMutate, isPending: isCreatingManualTimer} =
    useCreateManualTimerMutation();

  const setFormData = useCallback(
    (data?: ManageNotesTimersModalProps) => {
      const formDefaultValues = {
        note: data?.voiceNote?.note ?? '',
        timerTitle: '',
        timerDuration: '',
      };
      reset(formDefaultValues);
    },
    [reset],
  );

  useEventEmitter(
    MANAGE_NOTES_TIMER_MODAL_EVENT,
    (data?: ManageNotesTimersModalProps) => {
      setVisible(prev => !prev);
      setDetail(data);
      setFormData(data);
      setType(data?.type ?? VOICE_NOTE_TYPE.VOICE_NOTE);
    },
  );

  const renderContent = () => {
    if (type === VOICE_NOTE_TYPE.VOICE_NOTE) {
      return (
        <InputText
          control={control}
          name="note"
          label={Strings.Add_text_for_Notes}
          multiline
          textAlignVertical="top"
          contentStyle={[globalStyles.multilineInput, {height: scaler(162)}]}
        />
      );
    }

    if (type === VOICE_NOTE_TYPE.TIMER_NOTE) {
      return (
        <>
          <InputText
            control={control}
            name="timerTitle"
            label={Strings.Timer_Title_Label}
          />
          <InputDuration
            control={control}
            name="timerDuration"
            label={Strings.Scheduled_Duration_Label}
            enableSeconds
          />
        </>
      );
    }
  };

  const isSubmitDisabled = useMemo(() => {
    if (type === VOICE_NOTE_TYPE.TIMER_NOTE) {
      return !watch('timerTitle') || !watch('timerDuration');
    }
    return !watch('note');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [type, watch()]);

  const onEditVoiceNoteSuccess = (res: any, req: EDIT_VOCE_NOTE_REQUEST) => {
    onClose();
    editVoiceNoteOnListQueryCache({
      ...req,
      noteData: {
        note: req?.note,
        edited: true,
        updatedAt: new Date(),
      },
    });
  };

  const onSubmit = handleSubmit(val => {
    if (type === VOICE_NOTE_TYPE.VOICE_NOTE && isEdit) {
      editVoiceNoteMutate(
        {
          noteId: detail?.voiceNote?.id,
          caseId: detail?.voiceNote?.caseId,
          note: val.note,
        },
        {
          onSuccess: onEditVoiceNoteSuccess,
        },
      );
    }
    if (type === VOICE_NOTE_TYPE.VOICE_NOTE && !isEdit && detail?.caseId) {
      recordCaseNoteMutate(
        {
          note: val.note,
          caseId: detail?.caseId,
          tag: 'General Case Notes',
          loggedById: userId,
        },
        {
          onSuccess: () => {
            onClose();
            fireVoiceNoteListScrollEvent();
          },
        },
      );
    }
    if (type === VOICE_NOTE_TYPE.TIMER_NOTE && detail?.caseId) {
      const now = new Date();
      const secDuration = parseInt(val.timerDuration, 10);

      createManualTimerMutate(
        {
          caseId: detail?.caseId,
          type: TIMER_TYPE.TIMER,
          status: TIMER_STATUS.RUNNING,
          startTime: now,
          duration: secDuration * 1000,
          completedDuration: 0,
          endTime: addSeconds(now, secDuration),
          description: val.timerTitle,
        },
        {
          onSuccess: () => {
            onClose();
            fireVoiceNoteListScrollEvent();
          },
        },
      );
    }
  });

  return (
    <SideModalDrawer
      title={isEdit ? Strings.Edit_Voice_Note : Strings.Add_Manually}
      visible={visible}
      onClose={onClose}>
      <SideModalDrawerBody>
        {/* Type Selector */}
        {!isEdit && (
          <SegmentedButtons
            style={{marginBottom: scaler(20)}}
            value={type}
            onValueChange={(value: string) => setType(value as VOICE_NOTE_TYPE)}
            buttons={[
              {
                value: VOICE_NOTE_TYPE.VOICE_NOTE,
                label: 'Notes',
                showSelectedCheck: true,
              },
              {
                value: VOICE_NOTE_TYPE.TIMER_NOTE,
                label: 'Timers',
                showSelectedCheck: true,
              },
            ]}
          />
        )}

        {/* Content */}
        <View style={{gap: scaler(24)}}>
          {renderContent()}

          {/* Buttons */}
          <View style={styles.btnContainer}>
            <Button
              onPress={reset}
              style={globalStyles.flex1}
              contentStyle={styles.btn}
              mode="outlined">
              {Strings.Cancel}
            </Button>
            <Button
              loading={
                isRecordingCaseNote ||
                isCreatingManualTimer ||
                isEditingVoiceNote
              }
              disabled={
                isSubmitDisabled ||
                isRecordingCaseNote ||
                isCreatingManualTimer ||
                isEditingVoiceNote
              }
              onPress={onSubmit}
              style={globalStyles.flex1}
              contentStyle={styles.btn}
              mode="contained">
              {Strings.Save}
            </Button>
          </View>
        </View>
      </SideModalDrawerBody>
    </SideModalDrawer>
  );
};

export default ManageNotesTimersModal;

const styles = StyleSheet.create({
  btnContainer: {
    flexDirection: 'row',
    gap: scaler(16),
  },

  btn: {
    height: scaler(40),
  },
});
