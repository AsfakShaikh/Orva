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
import Divider from '@components/Divider';
import {useTheme, Text} from 'react-native-paper';
import {detectChange} from '@helpers/detectChange';
import formatDateTime, {FORMAT_DATE_TYPE} from '@helpers/formatDateTime';
import formatMilliSeconds from '@helpers/formatMilliSeconds';
import useEditTimerLabelMutation from '../Hooks/useEditTimerLabelMutation';
import {fireSaveAndMoveNextTimelineEvent} from '@screens/SubmitedCases/CaseDetailScreen';
import isNotNull from '@helpers/isNotNull';

const EDIT_TIMER_LABEL_MODAL_EVENT = 'EDIT_TIMER_LABEL_MODAL_EVENT';

interface EditTimerLabelModalProps {
  caseId?: number;
  timerId?: number;
  description?: string | null;
  timerDuration?: number;
  timerCreatedAt?: Date | null;
  timelineItemIndex?: number;
  isVisible?: boolean;
}

export const toggleEditTimerLabelModal = (data?: EditTimerLabelModalProps) => {
  emitEvent(EDIT_TIMER_LABEL_MODAL_EVENT, data);
};

const EditTimerLabelModal = () => {
  const {colors} = useTheme();
  const [visible, setVisible] = useState(false);
  const [detail, setDetail] = useState<EditTimerLabelModalProps>();
  const {
    timelineItemIndex,
    description,
    caseId,
    timerId,
    timerDuration,
    timerCreatedAt,
  } = detail ?? {};
  const {mutate: editTimerLabelMutate, isPending: isEditingTimerLabel} =
    useEditTimerLabelMutation();

  const {control, watch, reset, handleSubmit} = useForm();

  const onClose = useCallback(() => {
    reset();
    setVisible(false);
  }, [reset]);

  const setFormData = useCallback(
    (data?: EditTimerLabelModalProps) => {
      const formDefaultValues = {
        description: data?.description ?? '',
      };
      reset(formDefaultValues);
    },
    [reset],
  );

  useEventEmitter(
    EDIT_TIMER_LABEL_MODAL_EVENT,
    (data?: EditTimerLabelModalProps) => {
      setVisible(prev =>
        isNotNull(data?.isVisible) ? data?.isVisible : !prev,
      );
      setDetail(data);
      setFormData(data);
    },
  );

  const isSubmitDisabled = useMemo(() => {
    const isDescriptionChanged = detectChange(
      description,
      watch('description'),
    );
    return (
      !watch('description') || !isDescriptionChanged || isEditingTimerLabel
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [watch('description'), description]);

  const onSubmit = (isSaveAndMoveNext?: boolean) =>
    handleSubmit(val => {
      if (caseId && timerId) {
        editTimerLabelMutate(
          {
            caseId,
            timerId,
            timerData: {
              description: val?.description,
            },
          },
          {
            onSuccess: res => {
              onClose();
              setDetail({
                ...detail,
                description: res?.data?.description,
              });
              if (isSaveAndMoveNext) {
                isNotNull(timelineItemIndex) &&
                  fireSaveAndMoveNextTimelineEvent(timelineItemIndex);
              }
            },
          },
        );
      }
    })();

  return (
    <SideModalDrawer
      title={Strings.Edit_Timer_Label}
      visible={visible}
      onClose={onClose}>
      <SideModalDrawerBody>
        <Text style={styles.title}>
          Timer set for {formatMilliSeconds(timerDuration)} at{' '}
          <Text style={{fontWeight: '700'}}>
            {formatDateTime(timerCreatedAt, FORMAT_DATE_TYPE.LOCAL, 'HH:mm')}
          </Text>
        </Text>
        {/* Content */}
        <InputText
          control={control}
          name="description"
          label={Strings.Timer_Label}
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

export default EditTimerLabelModal;

const styles = StyleSheet.create({
  btnContainer: {
    flexDirection: 'row',
    gap: scaler(24),
    marginBottom: scaler(24),
  },
  btn: {
    height: scaler(40),
  },
  title: {
    marginTop: scaler(6),
    marginBottom: scaler(18),
    fontSize: scaler(18),
  },
});
