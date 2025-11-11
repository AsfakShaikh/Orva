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
import useEditVoiceNoteMutation from '@modules/TrackerModule/Hooks/useEditVoiceNoteMutation';
import {VOICE_NOTE_TIMELINE} from '../Types/CommonTypes';
import Divider from '@components/Divider';
import {useTheme} from 'react-native-paper';
import {updateCaseVoiceNoteDetailInCache} from '../Hooks/useGetCaseDetailQuery';
import {detectChange} from '@helpers/detectChange';
import {EDIT_VOCE_NOTE_REQUEST} from '@modules/TrackerModule/Types/RequestTypes';
import {fireSaveAndMoveNextTimelineEvent} from '@screens/SubmitedCases/CaseDetailScreen';
import isNotNull from '@helpers/isNotNull';

const EDIT_VOICE_NOTE_MODAL_EVENT = 'EDIT_VOICE_NOTE_MODAL_EVENT';

interface EditVoiceNoteModalProps {
  caseId?: number;
  voiceNote?: VOICE_NOTE_TIMELINE;
  timelineItemIndex?: number;
  isVisible?: boolean;
}

export const toggleEditVoiceNoteModal = (data?: EditVoiceNoteModalProps) => {
  emitEvent(EDIT_VOICE_NOTE_MODAL_EVENT, data);
};

const EditVoiceNoteModal = () => {
  const {colors} = useTheme();
  const [visible, setVisible] = useState(false);
  const [detail, setDetail] = useState<EditVoiceNoteModalProps>();
  const {timelineItemIndex, voiceNote, caseId} = detail ?? {};
  const {control, watch, reset, handleSubmit} = useForm();

  const onClose = useCallback(() => {
    reset();
    setVisible(false);
  }, [reset]);

  const {mutate: editVoiceNoteMutate, isPending: isEditingVoiceNote} =
    useEditVoiceNoteMutation();

  const setFormData = useCallback(
    (data?: EditVoiceNoteModalProps) => {
      const formDefaultValues = {
        note: data?.voiceNote?.note ?? '',
      };
      reset(formDefaultValues);
    },
    [reset],
  );

  useEventEmitter(
    EDIT_VOICE_NOTE_MODAL_EVENT,
    (data?: EditVoiceNoteModalProps) => {
      setVisible(prev =>
        isNotNull(data?.isVisible) ? data?.isVisible : !prev,
      );
      setDetail(data);
      setFormData(data);
    },
  );

  const isSubmitDisabled = useMemo(() => {
    const isNoteChanged = detectChange(voiceNote?.note, watch('note'));
    return !watch('note') || !isNoteChanged || isEditingVoiceNote;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [watch('note'), voiceNote?.note, isEditingVoiceNote]);

  const onEditVoiceNoteSuccess = (
    res: any,
    req: EDIT_VOCE_NOTE_REQUEST,
    isSaveAndMoveNext?: boolean,
  ) => {
    onClose();
    setDetail(prev => ({...prev, note: res?.data?.note}));
    if (!res?.data?.caseId) {
      return;
    }
    updateCaseVoiceNoteDetailInCache({
      caseId: res?.data?.caseId,
      data: {
        id: res?.data?.id,
        note: res?.data?.note,
      },
    });
    if (isSaveAndMoveNext && isNotNull(timelineItemIndex)) {
      fireSaveAndMoveNextTimelineEvent(timelineItemIndex);
    }
  };

  const onSubmit = (isSaveAndMoveNext?: boolean) =>
    handleSubmit(val => {
      editVoiceNoteMutate(
        {
          noteId: voiceNote?.id,
          caseId: caseId,
          note: val.note,
        },
        {
          onSuccess: (res, req) =>
            onEditVoiceNoteSuccess(res, req, isSaveAndMoveNext),
        },
      );
    })();

  return (
    <SideModalDrawer
      title={Strings.Edit_Voice_Note}
      visible={visible}
      onClose={onClose}>
      <SideModalDrawerBody>
        {/* Content */}
        <InputText
          control={control}
          name="note"
          label={Strings.Voice_Note_Text}
          multiline
          textAlignVertical="top"
          contentStyle={[globalStyles.multilineInput, {height: scaler(200)}]}
          autoFocus
        />

        <Divider
          style={{
            marginHorizontal: scaler(-24),
            marginTop: scaler(64),
            marginBottom: scaler(16),
          }}
          backgroundColor={colors.outlineVariant}
        />

        {/* Buttons */}
        <View style={styles.btnContainer}>
          <Button
            onPress={() => onSubmit()}
            disabled={isSubmitDisabled}
            style={globalStyles.flex1}
            contentStyle={styles.btn}
            mode="contained">
            {Strings.Save_Changes}
          </Button>
          <Button
            onPress={() => onSubmit(true)}
            disabled={isSubmitDisabled}
            style={globalStyles.flex1}
            contentStyle={styles.btn}
            mode="outlined">
            {Strings.Save_and_Next}
          </Button>
        </View>
      </SideModalDrawerBody>
    </SideModalDrawer>
  );
};

export default EditVoiceNoteModal;

const styles = StyleSheet.create({
  btnContainer: {
    flexDirection: 'row',
    gap: scaler(24),
    marginBottom: scaler(24),
  },

  btn: {
    height: scaler(40),
  },
});
