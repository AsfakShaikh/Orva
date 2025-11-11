import Button from '@components/Button';
import Divider from '@components/Divider';
import InputDate, {INPUT_DATE_PICKER_TYPE} from '@components/InputDate';
import useEventEmitter, {emitEvent} from '@hooks/useEventEmitter';
import {Strings} from '@locales/Localization';
import {globalStyles} from '@styles/GlobalStyles';
import scaler from '@utils/Scaler';
import React, {useCallback, useMemo, useState} from 'react';
import {useForm} from 'react-hook-form';
import {View, StyleSheet} from 'react-native';
import {Text, useTheme} from 'react-native-paper';
import {USER_ACTION} from '@modules/TrackerModule/Types/CommonTypes';
import RevisedMilestoneList from '@modules/CaseSelectionModule/Components/RevisedMilestoneList';
import SideModalDrawer, {
  SideModalDrawerBody,
} from '@components/SideModalDrawer';
import {fireSaveAndMoveNextTimelineEvent} from '@screens/SubmitedCases/CaseDetailScreen';
import isNotNull from '@helpers/isNotNull';
import useUpdateMilestoneRevisionMutation from '@modules/CaseSelectionModule/Hooks/useUpdateMilestoneRevisionMutation';
import useAuthValue from '@modules/AuthModule/Hooks/useAuthValue';
import {DATE_TYPE} from '@utils/Types';
import {REVISION} from '@modules/CaseSelectionModule/Types/CommonTypes';
import useUpdateOptionalMilestoneRevisionMutation from '@modules/CaseSelectionModule/Hooks/useUpdateOptionalMilestoneRevisionMutation';
const EDIT_MILESTONE_TIME_EVENT = 'EDIT_MILESTONE_TIME_EVENT';
export type EditMilestoneTimeModalProps = {
  caseId?: number;
  isOptionalMilestone?: boolean;
  milestoneId: number;
  milestoneUUID: string;
  milestoneName?: string;
  timelineItemIndex?: number;
  revision?: Array<REVISION>;
  isVisible?: boolean;
};
export const toggleEditMilestoneTimeModal = (
  data?: EditMilestoneTimeModalProps,
) => {
  emitEvent(EDIT_MILESTONE_TIME_EVENT, data);
};
export default function EditMilestoneTimeModal() {
  const {colors} = useTheme();
  const {firstName, LastName, userId, selectedOt} = useAuthValue();

  const [visible, setVisible] = useState(false);
  const [milestoneDetail, setMilestoneDetail] =
    useState<EditMilestoneTimeModalProps>();
  const {
    caseId,
    isOptionalMilestone,
    milestoneId,
    milestoneUUID,
    milestoneName,
    timelineItemIndex,
    revision,
  } = milestoneDetail ?? {};

  const isRoomCleanStart = milestoneName === Strings.Room_Clean_Start;
  const isRoomCleanEnd = milestoneName === Strings.Room_Clean_End;

  const {control, watch, reset, handleSubmit} = useForm({
    defaultValues: {
      revisedMilestoneTime: '',
    },
  });

  const onClose = useCallback(() => {
    reset();
    setVisible(false);
  }, [reset]);

  useEventEmitter(
    EDIT_MILESTONE_TIME_EVENT,
    (data?: EditMilestoneTimeModalProps) => {
      setVisible(prev =>
        isNotNull(data?.isVisible) ? data?.isVisible : !prev,
      );
      if (data) {
        setMilestoneDetail(data);
      }
    },
  );

  const {
    mutate: updateMilestoneRevisionMutate,
    isPending: isUpdatingMilestoneRevision,
  } = useUpdateMilestoneRevisionMutation();

  const {
    mutate: updateOptionalMilestoneRevisionMutate,
    isPending: isUpdatingOptionalMilestoneRevision,
  } = useUpdateOptionalMilestoneRevisionMutation();

  const revisionCount = useMemo(() => {
    return Math.max((revision?.length ?? 0) - 1, 0);
  }, [revision?.length]);

  const updateMilestone = (revisedMilestoneTime: DATE_TYPE) => {
    if (!milestoneUUID || !caseId || !milestoneId || !userId) {
      return;
    }
    const commonPayload = {
      caseId,
      milestoneId: milestoneId,
      milestoneUUID: milestoneUUID,
      milestoneRevisedByUserId: userId,
      milestoneRevisedByUserName: `${firstName} ${LastName}`,
      createdAt: new Date(),
    };

    const payload = (() => {
      if (isRoomCleanEnd) {
        return {
          milestoneEndTime: revisedMilestoneTime,
          action: 'end' as const,
        };
      }
      if (isRoomCleanStart) {
        return {
          milestoneStartTime: revisedMilestoneTime,
          action: 'start' as const,
        };
      }
      return {
        milestoneEndTime: revisedMilestoneTime,
      };
    })();

    updateMilestoneRevisionMutate({
      ...commonPayload,
      ...payload,
    });
  };

  const updateOptionalMilestone = (revisedMilestoneTime: DATE_TYPE) => {
    if (
      !(
        caseId &&
        milestoneId &&
        milestoneUUID &&
        milestoneName &&
        selectedOt?.uuid &&
        userId
      )
    ) {
      return;
    }

    const payload = {
      caseId,
      optionalMilestoneId: milestoneId,
      milestoneUUID: milestoneUUID,
      milestoneEndTime: revisedMilestoneTime,
      milestoneRevisedByUserId: userId,
      milestoneRevisedByUserName: `${firstName} ${LastName}`,
      milestoneName,
      otId: selectedOt?.uuid,
      action: USER_ACTION.TAP,
      createdAt: new Date(),
    };

    updateOptionalMilestoneRevisionMutate(payload);
    reset();
  };

  const updateRevisedMilestones = (revisedMilestoneTime: DATE_TYPE) => {
    if (!milestoneUUID || !caseId || !milestoneId || !userId) {
      return;
    }
    if (!isOptionalMilestone) {
      updateMilestone(revisedMilestoneTime);
    }
    if (isOptionalMilestone) {
      updateOptionalMilestone(revisedMilestoneTime);
    }
  };

  const onSubmit = (isSaveAndMoveNext?: boolean) =>
    handleSubmit(val => {
      updateRevisedMilestones(val.revisedMilestoneTime);
      onClose();
      if (isSaveAndMoveNext && isNotNull(timelineItemIndex)) {
        fireSaveAndMoveNextTimelineEvent(
          timelineItemIndex,
          isOptionalMilestone,
        );
      }
    })();

  const isSubmitDisabled = useMemo(() => {
    return (
      !watch('revisedMilestoneTime') ||
      isUpdatingMilestoneRevision ||
      isUpdatingOptionalMilestoneRevision ||
      revisionCount >= 3
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    isUpdatingMilestoneRevision,
    isUpdatingOptionalMilestoneRevision,
    revisionCount,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    watch('revisedMilestoneTime'),
  ]);

  return (
    <SideModalDrawer
      title={Strings.Edit_Milestone_Time}
      visible={visible}
      onClose={onClose}>
      <SideModalDrawerBody>
        <Text style={styles.title}>
          {Strings.Milestone_Revisions_for}{' '}
          <Text style={{fontWeight: 'bold'}}>{milestoneName}</Text>
        </Text>
        <InputDate
          pickerType={INPUT_DATE_PICKER_TYPE.DURATION}
          control={control}
          name="revisedMilestoneTime"
          label={Strings.Revised_Time_Label}
          placeholder={Strings.Revised_Time_Placeholder}
        />
        <RevisedMilestoneList currentMilestoneRevisons={revision} />
        <Divider
          style={{
            marginHorizontal: scaler(-24),
            marginVertical: scaler(16),
          }}
          backgroundColor={colors.outlineVariant}
        />
        <View
          style={[
            globalStyles.row,
            {
              gap: scaler(24),
              marginBottom: scaler(24),
            },
          ]}>
          <Button
            onPress={() => onSubmit()}
            disabled={isSubmitDisabled}
            style={globalStyles.flex1}
            contentStyle={{height: scaler(40)}}
            mode="contained">
            {Strings.Save_Changes}
          </Button>
          <Button
            onPress={() => onSubmit(true)}
            disabled={isSubmitDisabled}
            style={globalStyles.flex1}
            contentStyle={{height: scaler(40)}}
            mode="outlined">
            {Strings.Save_and_Next}
          </Button>
        </View>
      </SideModalDrawerBody>
    </SideModalDrawer>
  );
}
const styles = StyleSheet.create({
  title: {
    marginTop: scaler(6),
    marginBottom: scaler(18),
    fontSize: scaler(18),
  },
});
