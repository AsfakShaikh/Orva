import Button from '@components/Button';
import Divider from '@components/Divider';
import InputDate from '@components/InputDate';
import useEventEmitter, {emitEvent} from '@hooks/useEventEmitter';
import {Strings} from '@locales/Localization';
import scaler from '@utils/Scaler';
import React, {useState} from 'react';
import {useForm} from 'react-hook-form';
import {View, StyleSheet} from 'react-native';
import {Text, useTheme} from 'react-native-paper';
import useTrackerValue from '@modules/TrackerModule/Hooks/useTrackerValues';
import useAuthValue from '@modules/AuthModule/Hooks/useAuthValue';
import {DATE_TYPE} from '@utils/Types';
import RevisedMilestoneList from './RevisedMilestoneList';
import useUpdateMilestoneRevisionMutation from '../Hooks/useUpdateMilestoneRevisionMutation';
import {USER_ACTION} from '@modules/TrackerModule/Types/CommonTypes';
import useUpdateOptionalMilestoneRevisionMutation from '../Hooks/useUpdateOptionalMilestoneRevisionMutation';
import {REVISION} from '../Types/CommonTypes';
import getMilestoneDisplayName from '@modules/TrackerModule/Helpers/getMilestoneDisplayName';
import SideModalDrawer, {
  SideModalDrawerBody,
} from '@components/SideModalDrawer';
const REVISED_MILESTONE_TIME_EVENT = 'REVISED_MILESTONE_TIME_EVENT';
export type RevisedMilestoneTimeModalProps = {
  isOptionalMilestone?: boolean;
  milestoneId: number;
  milestoneUUID: string;
  milestoneName: string;
  milestoneRevisions: Array<REVISION>;
  revisionCount: number;
};
export const toggleRevisedMilestoneTimeModal = (
  data?: RevisedMilestoneTimeModalProps,
) => {
  emitEvent(REVISED_MILESTONE_TIME_EVENT, data);
};
export default function RevisedMilestoneTimeModal() {
  const {colors} = useTheme();
  const {currentActiveCase} = useTrackerValue();
  const {firstName, LastName, userId, selectedOt} = useAuthValue();

  const [visible, setVisible] = useState(false);
  const [milestoneDetail, setMilestoneDetail] =
    useState<RevisedMilestoneTimeModalProps>();
  const {
    milestoneId,
    milestoneName,
    milestoneUUID,
    isOptionalMilestone,
    milestoneRevisions,
    revisionCount = 0,
  } = milestoneDetail ?? {};

  const {control, watch, reset, handleSubmit} = useForm({
    defaultValues: {
      revisedMilestoneTime: '',
    },
  });
  const isFormFilled = watch('revisedMilestoneTime');
  useEventEmitter(
    REVISED_MILESTONE_TIME_EVENT,
    (data?: RevisedMilestoneTimeModalProps) => {
      setVisible(prev => !prev);
      if (data) {
        setMilestoneDetail(data);
      }
    },
  );

  const {mutate: updateMilestoneRevisionMutate} =
    useUpdateMilestoneRevisionMutation(true);

  const {mutate: updateOptionalMilestoneRevisionMutate} =
    useUpdateOptionalMilestoneRevisionMutation(true);

  const updateRevisedMilestones = (revisedMilestoneTime: DATE_TYPE) => {
    if (!(milestoneId && milestoneUUID && currentActiveCase?.id && userId)) {
      return;
    }

    const payload = {
      caseId: currentActiveCase?.id,
      milestoneUUID,
      milestoneRevisedByUserId: userId,
      milestoneRevisedByUserName: `${firstName} ${LastName}`,
      milestoneEndTime: revisedMilestoneTime,
      createdAt: new Date(),
    };

    if (isOptionalMilestone) {
      if (!(milestoneName && selectedOt?.uuid)) {
        return;
      }
      updateOptionalMilestoneRevisionMutate({
        ...payload,
        optionalMilestoneId: milestoneId,
        milestoneName,
        otId: selectedOt?.uuid,
        action: USER_ACTION.TAP,
      });
    } else {
      updateMilestoneRevisionMutate({...payload, milestoneId});
    }
  };

  const onSubmit = handleSubmit(val => {
    updateRevisedMilestones(val?.revisedMilestoneTime);
    reset();
    setVisible(false);
  });

  if (!visible) {
    return null;
  }

  return (
    <SideModalDrawer
      title={Strings.Add_Revised_Milestone_Time}
      visible={visible}
      onClose={() => {
        reset();
        setVisible(false);
      }}>
      <SideModalDrawerBody>
        <Text style={styles.title}>
          {Strings.Milestone_Revisions_for}{' '}
          <Text style={{fontWeight: 'bold'}}>
            {getMilestoneDisplayName(milestoneName)}
          </Text>
        </Text>
        <InputDate
          control={control}
          name="revisedMilestoneTime"
          label={Strings.Revised_Time_Label}
          placeholder={Strings.Revised_Time_Placeholder}
        />
        <RevisedMilestoneList currentMilestoneRevisons={milestoneRevisions} />
        <Divider
          style={{
            marginHorizontal: scaler(-24),
            marginBottom: scaler(16),
          }}
          backgroundColor={colors.outlineVariant}
        />
        <View
          // eslint-disable-next-line react-native/no-inline-styles
          style={{
            alignSelf: 'flex-start',
            marginBottom: scaler(24),
          }}>
          <Button
            onPress={onSubmit}
            disabled={!isFormFilled || revisionCount >= 3}
            contentStyle={{height: scaler(40)}}
            mode="contained">
            {Strings.Add_time}
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
