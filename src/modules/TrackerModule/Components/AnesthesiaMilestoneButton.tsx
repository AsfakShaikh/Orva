import {MILESTONE} from '@modules/CaseSelectionModule/Types/CommonTypes';
import {
  MILESTONE_TRACKER_STEPS,
  OPTIONAL_MILESTONE_TRACKER_STEPS,
} from '@utils/Constants';
import React, {
  useCallback,
  useImperativeHandle,
  useMemo,
  forwardRef,
} from 'react';
import useTrackerValue from '../Hooks/useTrackerValues';
import useUpdateOptionalMilestone from '../Hooks/useUpdateOptionalMilestone';
import {BottomSnackbarHandler} from '@components/BottomSnackbar';
import {Strings} from '@locales/Localization';
import Button from '@components/Button';
import {USER_ACTION} from '../Types/CommonTypes';
import {UPDATE_MILESTONE_REQUEST} from '../Types/RequestTypes';
import {getAuthValue} from '@modules/AuthModule/Hooks/useAuthValue';
import {StyleSheet} from 'react-native';
import scaler from '@utils/Scaler';
import {theme} from '@styles/Theme';
import {Icon} from 'react-native-paper';
import {fireSetStausEvent} from '@navigation/DrawerNavigation/HomeDrawerNavigation';
import {VOICE_COMAND_STATUS} from '@modules/VoiceComandModule/Types/CommonTypes';
import {toggleVoiceIntractionPanel} from '@modules/VoiceComandModule/Components/VoiceIntractionPanel';
import checkIsMilestonePassed from '../Helpers/checkIsMilestonePassed';

const {colors} = theme;

export interface AnesthesiaMilestoneButtonRefType {
  isAnesthesiaMilestoneActive: boolean;
  isAnesthesiaMilestonesCompleted: boolean;
  isDisableAnesthesiaMilestoneButton: boolean;
  currentAnesthesiaMilestoneName?: string;
  showAnesthesiaMilestoneAlert: () => void;
  handleNextAnesthesiaMilestone: (
    isSkipped?: boolean,
    usedBy?: USER_ACTION,
  ) => void;
}

interface AnesthesiaMilestoneButtonProps {}

const AnesthesiaMilestoneButton = forwardRef<
  AnesthesiaMilestoneButtonRefType,
  AnesthesiaMilestoneButtonProps
>((_props, ref) => {
  const {currentActiveCase} = useTrackerValue();
  const {id: caseId, currentMilestone} = currentActiveCase ?? {};

  const {
    mutate: submitOptionalMilestoneMutate,
    isPending: optionalMilestoneSubmitting,
  } = useUpdateOptionalMilestone();

  const anesthesiaMilestones = useMemo(() => {
    return currentActiveCase?.procedure?.optionalMilestones
      ?.filter(
        (milestone: MILESTONE) =>
          milestone.displayName !==
          OPTIONAL_MILESTONE_TRACKER_STEPS.TIMEOUT_TIME,
      )
      ?.sort((a, b) => {
        if (a?.order && b?.order) {
          return a?.order - b?.order;
        }
        return 0;
      });
  }, [currentActiveCase?.procedure?.optionalMilestones]);

  const currentOptionalMilestone = useMemo(() => {
    return anesthesiaMilestones?.find(
      (milestone: MILESTONE) => !milestone.completedTimestamp,
    );
  }, [anesthesiaMilestones]);

  const {
    isAnesthesiaActive,
    isPatientAsleepActive,
    isPatientAwakeActive,
    isPatientAwakeDisabled,
  } = useMemo(() => {
    const anesthesiaMilestoneData = {
      isAnesthesiaActive: false,
      isPatientAsleepActive: false,
      isPatientAwakeActive: false,
      isPatientAwakeDisabled:
        currentOptionalMilestone?.displayName ===
        OPTIONAL_MILESTONE_TRACKER_STEPS.PATIENT_AWAKE,
    };

    if (!currentOptionalMilestone) {
      return anesthesiaMilestoneData;
    }
    if (
      currentMilestone?.displayName === MILESTONE_TRACKER_STEPS.PATIENT_READY &&
      currentOptionalMilestone?.displayName ===
        OPTIONAL_MILESTONE_TRACKER_STEPS.ANESTHESIA_START &&
      !currentOptionalMilestone?.completedTimestamp
    ) {
      anesthesiaMilestoneData.isAnesthesiaActive = true;
      return anesthesiaMilestoneData;
    }
    if (
      currentMilestone?.displayName === MILESTONE_TRACKER_STEPS.PATIENT_READY &&
      currentOptionalMilestone?.displayName ===
        OPTIONAL_MILESTONE_TRACKER_STEPS.PATIENT_ASLEEP &&
      !currentOptionalMilestone?.completedTimestamp
    ) {
      anesthesiaMilestoneData.isPatientAsleepActive = true;
      return anesthesiaMilestoneData;
    }

    const isPatientEndMilestonePassed = checkIsMilestonePassed(
      currentMilestone?.milestoneId,
      MILESTONE_TRACKER_STEPS.PROCEDURE_END,
      currentActiveCase?.procedure?.milestones,
    );
    if (
      isPatientEndMilestonePassed &&
      currentOptionalMilestone?.displayName ===
        OPTIONAL_MILESTONE_TRACKER_STEPS.PATIENT_AWAKE &&
      !currentOptionalMilestone?.completedTimestamp
    ) {
      anesthesiaMilestoneData.isPatientAwakeActive = true;
      anesthesiaMilestoneData.isPatientAwakeDisabled = false;
      return anesthesiaMilestoneData;
    }
    return anesthesiaMilestoneData;
  }, [
    currentOptionalMilestone,
    currentMilestone?.displayName,
    currentMilestone?.milestoneId,
    currentActiveCase?.procedure?.milestones,
  ]);

  const isAnesthesiaMilestoneActive = useMemo(
    () => isAnesthesiaActive || isPatientAsleepActive,
    [isAnesthesiaActive, isPatientAsleepActive],
  );

  const isAnesthesiaMilestonesCompleted = useMemo(() => {
    return (
      !!anesthesiaMilestones &&
      anesthesiaMilestones?.length > 0 &&
      anesthesiaMilestones?.every(
        (milestone: MILESTONE) => milestone.completedTimestamp,
      )
    );
  }, [anesthesiaMilestones]);

  const isPatientAwakeSkipped = useMemo(() => {
    return (
      anesthesiaMilestones?.find(
        (milestone: MILESTONE) =>
          milestone.displayName ===
          OPTIONAL_MILESTONE_TRACKER_STEPS.PATIENT_AWAKE,
      )?.skipped ?? false
    );
  }, [anesthesiaMilestones]);

  const isDisableAnesthesiaMilestoneButton = useMemo(
    () => isAnesthesiaMilestonesCompleted || isPatientAwakeDisabled,
    [isAnesthesiaMilestonesCompleted, isPatientAwakeDisabled],
  );

  const anaesthesiaButtonText = useMemo(() => {
    if (isAnesthesiaMilestonesCompleted) {
      return Strings.Patient_Awake;
    }
    return `"${currentOptionalMilestone?.displayName}"`;
  }, [currentOptionalMilestone?.displayName, isAnesthesiaMilestonesCompleted]);

  const showAnesthesiaMilestoneAlert = useCallback(() => {
    if (isAnesthesiaActive) {
      BottomSnackbarHandler.errorToast({
        title: Strings.Anesthesia_not_recorded_heading,
        description: Strings.Anesthesia_not_recorded_subheading,
      });
      return;
    }
    if (isPatientAsleepActive) {
      BottomSnackbarHandler.errorToast({
        title: Strings.Patient_asleep_not_recorded_heading,
        description: Strings.Patient_asleep_not_recorded_subheading,
      });
      return;
    }
    if (isPatientAwakeActive) {
      BottomSnackbarHandler.errorToast({
        title: Strings.Patient_awake_not_recorded_heading,
        description: Strings.Patient_awake_not_recorded_subheading,
      });
    }
  }, [isAnesthesiaActive, isPatientAsleepActive, isPatientAwakeActive]);

  const handleNextAnesthesiaMilestone = useCallback(
    (isSkipped: boolean = false, usedBy: USER_ACTION = USER_ACTION.TAP) => {
      const isVoice = usedBy === USER_ACTION.VOICE;

      if (isAnesthesiaMilestonesCompleted) {
        isVoice && fireSetStausEvent(VOICE_COMAND_STATUS.NEGATIVE, false);
        BottomSnackbarHandler.infoToast({
          title: Strings.Patient_awake_has_recorded_heading,
          description: Strings.Patient_awake_has_recorded_subheading,
        });
        return;
      }

      if (isPatientAwakeDisabled) {
        isVoice && fireSetStausEvent(VOICE_COMAND_STATUS.NEGATIVE, false);
        BottomSnackbarHandler.infoToast({
          title: Strings.Patient_awake_not_recorded_heading,
          description: Strings.Patient_awake_not_recorded_subheading,
        });
        return;
      }

      if (isVoice) {
        fireSetStausEvent(VOICE_COMAND_STATUS.POSITIVE);
        toggleVoiceIntractionPanel({
          isVisible: false,
        });
      }

      if (!caseId || !currentOptionalMilestone) {
        return;
      }

      const {firstName, LastName, userId} = getAuthValue();
      let reqBody: UPDATE_MILESTONE_REQUEST = {
        caseId,
        currentMilestone: {
          ...currentOptionalMilestone,
          completedTimestamp: new Date(),
          usedBy: usedBy,
          skipped: isSkipped,
          loggedBy: `${firstName} ${LastName}`,
          loggedById: userId,
        },
      };

      submitOptionalMilestoneMutate(reqBody);
    },
    [
      caseId,
      currentOptionalMilestone,
      isAnesthesiaMilestonesCompleted,
      isPatientAwakeDisabled,
      submitOptionalMilestoneMutate,
    ],
  );

  useImperativeHandle(
    ref,
    () => ({
      isAnesthesiaMilestoneActive,
      isAnesthesiaMilestonesCompleted,
      isDisableAnesthesiaMilestoneButton,
      currentAnesthesiaMilestoneName: currentOptionalMilestone?.displayName,
      showAnesthesiaMilestoneAlert,
      handleNextAnesthesiaMilestone,
    }),
    [
      isAnesthesiaMilestoneActive,
      isAnesthesiaMilestonesCompleted,
      isDisableAnesthesiaMilestoneButton,
      currentOptionalMilestone?.displayName,
      showAnesthesiaMilestoneAlert,
      handleNextAnesthesiaMilestone,
    ],
  );

  return (
    <Button
      disabled={optionalMilestoneSubmitting}
      // eslint-disable-next-line react-native/no-inline-styles
      style={{
        opacity: isDisableAnesthesiaMilestoneButton ? 0.35 : 1,
      }}
      contentStyle={styles.buttonContent}
      labelStyle={styles.buttonLabel}
      textColor={
        isDisableAnesthesiaMilestoneButton ? colors.onSurface : undefined
      }
      icon={() =>
        renderAnaesthesiaIcon(
          isAnesthesiaMilestonesCompleted,
          isAnesthesiaMilestoneActive,
          isPatientAwakeSkipped,
          isPatientAwakeDisabled,
        )
      }
      mode={isAnesthesiaMilestoneActive ? 'contained' : 'outlined'}
      onPress={() => handleNextAnesthesiaMilestone(false, USER_ACTION.TAP)}>
      {anaesthesiaButtonText}
    </Button>
  );
});

const renderAnaesthesiaIcon = (
  isAnaesthesiaMilestonesCompleted?: boolean,
  isAnaesthesiaActive?: boolean,
  isPatientAwakeSkipped?: boolean,
  isPatientAwakeDisabled?: boolean,
) => {
  let source = 'account-voice';
  let color = colors.primary;

  if (isPatientAwakeSkipped) {
    source = 'chevron-double-right';
    color = colors.foreground.primary;
  }
  if (isAnaesthesiaMilestonesCompleted) {
    source = 'check-circle';
  }
  if (isAnaesthesiaActive) {
    color = colors.foreground.inverted;
  }
  if (
    !isAnaesthesiaMilestonesCompleted &&
    !isAnaesthesiaActive &&
    isPatientAwakeDisabled
  ) {
    color = colors.onSurface;
  }

  return <Icon source={source} size={scaler(12)} color={color} />;
};

const styles = StyleSheet.create({
  buttonContent: {
    marginLeft: -scaler(2),
    marginRight: -scaler(8),
    height: scaler(42),
  },
  buttonLabel: {
    fontSize: scaler(10),
  },
});

export default AnesthesiaMilestoneButton;
