import {View, StyleSheet} from 'react-native';
import React, {FC, useCallback, useMemo, useState} from 'react';
import InputText from '@components/InputText';
import {Strings} from '@locales/Localization';
import scaler from '@utils/Scaler';
import useTrackerValue from '../Hooks/useTrackerValues';
import {MILESTONE} from '@modules/CaseSelectionModule/Types/CommonTypes';
import {globalStyles} from '@styles/GlobalStyles';
import CaseSummaryItem from './CaseSummaryItem';
import RevisedMilestoneTimeModal from '@modules/CaseSelectionModule/Components/RevisedMilestoneTimeModal';
import {
  caseSummaryLabels,
  MILESTONE_TRACKER_STEPS,
  OPTIONAL_MILESTONE_TRACKER_STEPS,
} from '@utils/Constants';
import {Control} from 'react-hook-form';
import CapsuleTabs from '@components/CapsuleTabs';
import Body from '@components/Body';
import {Text} from 'react-native-paper';
import WheelsOutBtn from './WheelsOutBtn';
import {theme} from '@styles/Theme';

const {colors} = theme;
import VoiceNotesList from './VoiceNotesList';

type CaseSummaryProps = {
  control: Control<any>;
  comments?: string;
};

const CaseSummary: FC<CaseSummaryProps> = ({control, comments}) => {
  const {currentActiveCase} = useTrackerValue();
  const {milestones, optionalMilestones} = currentActiveCase?.procedure ?? {};

  const additionalMilestones = optionalMilestones
    ?.filter(
      milestone =>
        milestone.displayName !== OPTIONAL_MILESTONE_TRACKER_STEPS.TIMEOUT_TIME,
    )
    .sort((a, b) => {
      if (a.order && b.order) {
        return a.order - b.order;
      }
      return 0;
    });

  const timeOutMilestone = optionalMilestones?.find(
    milestone =>
      milestone.displayName === OPTIONAL_MILESTONE_TRACKER_STEPS.TIMEOUT_TIME,
  );

  const [activeTab, setActiveTab] = useState<number>(0);

  const handleVoiceNotesCountChange = useCallback((count: number) => {
    setActiveTab(count === 0 ? 1 : 0);
  }, []);

  const currentActiveCaseMilestones = milestones?.reduce(
    (a: Array<MILESTONE>, m) => {
      if (
        m.displayName === MILESTONE_TRACKER_STEPS.WHEELS_OUT ||
        m.displayName === MILESTONE_TRACKER_STEPS.ROOM_CLEAN
      ) {
        return a;
      }
      a.push(m);
      if (
        m.displayName === MILESTONE_TRACKER_STEPS.WHEELS_IN &&
        additionalMilestones
      ) {
        a.push(...additionalMilestones.slice(0, 2));
      }
      if (
        m.displayName === MILESTONE_TRACKER_STEPS.PATIENT_READY &&
        additionalMilestones
      ) {
        timeOutMilestone && a.push(timeOutMilestone);
      }
      if (
        m.displayName === MILESTONE_TRACKER_STEPS.PROCEDURE_END &&
        additionalMilestones
      ) {
        a.push(...additionalMilestones.slice(-1));
      }
      return a;
    },
    [],
  );

  const totalMilestonesCount = currentActiveCaseMilestones?.length ?? 0;
  const firstPart = Math.ceil(totalMilestonesCount / 2);

  const isWheelsOutMilestone = useMemo(() => {
    return (
      currentActiveCase?.currentMilestone?.displayName ===
      MILESTONE_TRACKER_STEPS.WHEELS_OUT
    );
  }, [currentActiveCase?.currentMilestone?.displayName]);

  return (
    <Body nestedScrollEnabled>
      <View style={styles.container}>
        {/* milestonesContainer */}
        <View
          style={[
            globalStyles.row,
            {gap: scaler(28), paddingHorizontal: scaler(16)},
          ]}>
          <View style={styles.milestonesContainer}>
            {currentActiveCaseMilestones
              ?.slice(0, firstPart)
              ?.map((item: MILESTONE) => (
                <CaseSummaryItem key={item?.id} mileStone={item} />
              ))}
          </View>
          <View style={styles.milestonesContainer}>
            {currentActiveCaseMilestones
              ?.slice(firstPart, totalMilestonesCount)
              ?.map((item: MILESTONE) => (
                <CaseSummaryItem key={item?.id} mileStone={item} />
              ))}
          </View>
          <View style={globalStyles.flex1}>
            <CapsuleTabs
              labels={caseSummaryLabels}
              setActiveTab={setActiveTab}
              activeTab={activeTab}
              style={{marginBottom: scaler(20)}}
            />
            {activeTab === 0 && (
              <View style={globalStyles.flex1}>
                <View style={globalStyles.blurView}>
                  <VoiceNotesList
                    showHeader={false}
                    onVoiceNotesCountChange={handleVoiceNotesCountChange}
                  />
                </View>
              </View>
            )}
            {activeTab === 1 && (
              <InputText
                control={control}
                name="comment"
                label={Strings.Comments_Label}
                multiline
                textAlignVertical="top"
                contentStyle={globalStyles.multilineInput}
              />
            )}
          </View>
        </View>

        {/* confirmContainer */}
        {isWheelsOutMilestone && (
          <View style={styles.confirmContainer}>
            <Text style={styles.confirmTitle}>{Strings.Confirm_Case_Data}</Text>
            <Text style={styles.confirmDesc}>
              {Strings.Confirm_Case_Data_Desc}
            </Text>
            <WheelsOutBtn
              style={styles.button}
              contentStyle={styles.buttonContent}
              comments={comments}
            />
          </View>
        )}
      </View>
      <RevisedMilestoneTimeModal />
    </Body>
  );
};

export default CaseSummary;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingVertical: scaler(30),
    justifyContent: 'space-between',
    gap: scaler(36),
  },
  milestonesContainer: {
    flex: 1,
    gap: scaler(24),
  },
  confirmContainer: {
    backgroundColor: colors.background.primary,
    borderRadius: scaler(16),
    paddingHorizontal: scaler(24),
    paddingVertical: scaler(20),
  },
  confirmTitle: {
    fontSize: scaler(18),
    fontWeight: '700',
    marginBottom: scaler(4),
  },
  confirmDesc: {
    fontSize: scaler(18),
    lineHeight: scaler(24),
  },
  button: {
    alignSelf: 'flex-end',
  },
  buttonContent: {
    marginLeft: -scaler(2),
    marginRight: -scaler(8),
    paddingHorizontal: scaler(84),
  },
});
