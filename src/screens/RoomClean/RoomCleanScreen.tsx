import Icons from '@assets/Icons';
import Body from '@components/Body';
import Button from '@components/Button';
import GlobalTimer from '@components/GlobalTimer';
import InputText from '@components/InputText';
import {Strings} from '@locales/Localization';
import useLogoutMutation from '@modules/AuthModule/Hooks/useLogoutMutation';
import useTrackerValue from '@modules/TrackerModule/Hooks/useTrackerValues';
import useUpdateMileStone from '@modules/TrackerModule/Hooks/useUpdateMilestone';
import {USER_ACTION} from '@modules/TrackerModule/Types/CommonTypes';
import {appLogEventSocketInstance} from '@navigation/Router';
import {theme} from '@styles/Theme';
import {SOCKET_EVENTS} from '@utils/Constants';
import scaler from '@utils/Scaler';
import React, {useMemo, useState} from 'react';
import {useForm} from 'react-hook-form';
import {StyleSheet, View} from 'react-native';
import {Text} from 'react-native-paper';

const {colors} = theme;

enum ROOM_CLEAN_PHASE {
  IDLE = 'IDLE',
  STARTED = 'STARTED',
  READY_TO_END = 'READY_TO_END',
  ENDED = 'ENDED',
}

const RoomCleanScreen = () => {
  const {currentActiveCase} = useTrackerValue();

  const currentMilestone = currentActiveCase?.currentMilestone;
  const isRoomCleanInitiated = !!currentMilestone?.startTimeLoggedBy;

  const [roomCleanPhase, setRoomCleanPhase] = useState<ROOM_CLEAN_PHASE>(
    isRoomCleanInitiated ? ROOM_CLEAN_PHASE.STARTED : ROOM_CLEAN_PHASE.IDLE,
  );

  const {control, handleSubmit, watch, reset} = useForm({
    defaultValues: {
      userInitials: '',
    },
  });

  const {mutate: logoutMutate, isPending: isLoggingOut} = useLogoutMutation();
  const {mutate: updateMilestoneMutate, isPending: isUpdatingMilestone} =
    useUpdateMileStone();

  const handleRoomClean = (action: 'start' | 'end') => {
    if (!currentActiveCase?.id) {
      return;
    }
    const onSubmitSuccess = (
      isRoomCleanStart: boolean,
      isRoomCleanEnd: boolean,
    ) => {
      reset();
      if (isRoomCleanStart) {
        setRoomCleanPhase(ROOM_CLEAN_PHASE.STARTED);
      }
      if (isRoomCleanEnd) {
        setRoomCleanPhase(ROOM_CLEAN_PHASE.ENDED);
        setTimeout(() => {
          logoutMutate();
        }, 5000);
        appLogEventSocketInstance?.emit(SOCKET_EVENTS.APP_LOG_EVENTS, {
          eventNamespace: SOCKET_EVENTS.APP_LOG_EVENTS,
          eventType: 'CASE_SUBMIT',
          message: 'Case Submited.',
          eventName: 'Case Submit',
          eventErrorLog: null,
        });
      }
    };
    handleSubmit(val => {
      const isRoomCleanStart = action === 'start';
      const isRoomCleanEnd = action === 'end';
      const payload = isRoomCleanEnd
        ? {
            endTimeLoggedBy: val?.userInitials,
          }
        : {
            startTimeLoggedBy: val?.userInitials,
          };

      updateMilestoneMutate(
        {
          caseId: currentActiveCase?.id,
          action,
          milestoneId: currentActiveCase?.currentMilestone?.milestoneId,
          usedBy: USER_ACTION.TAP,
          timestamp: new Date(),
          ...payload,
        },
        {
          onSuccess: () => onSubmitSuccess(isRoomCleanStart, isRoomCleanEnd),
        },
      );
    })();
  };

  const handleButtonPress = () => {
    if (roomCleanPhase === ROOM_CLEAN_PHASE.IDLE) {
      handleRoomClean('start');
    }
    if (roomCleanPhase === ROOM_CLEAN_PHASE.STARTED) {
      setRoomCleanPhase(ROOM_CLEAN_PHASE.READY_TO_END);
    }
    if (roomCleanPhase === ROOM_CLEAN_PHASE.READY_TO_END) {
      handleRoomClean('end');
    }
  };

  const isButtonDisabled =
    isUpdatingMilestone || !watch('userInitials') || isLoggingOut;

  const {title, description, buttonText} = useMemo(() => {
    let computedTitle = Strings.Awaiting_Room_Cleaning;
    let computedDescription =
      Strings.Enter_your_two_initials_and_press_Start_Cleaning;
    let computedButtonText = Strings.Start_Cleaning;
    if (roomCleanPhase === ROOM_CLEAN_PHASE.STARTED) {
      computedTitle = Strings.Room_Cleaning_in_Progress;
      computedButtonText = Strings.End_Cleaning;
    }
    if (roomCleanPhase === ROOM_CLEAN_PHASE.READY_TO_END) {
      computedTitle = Strings.Confirm_Room_Cleaning_End;
      computedDescription = Strings.Enter_your_two_initials_and_press_Submit;
      computedButtonText = Strings.Submit;
    }
    if (roomCleanPhase === ROOM_CLEAN_PHASE.ENDED) {
      computedTitle = Strings.Thank_you_for_submitting;
      computedDescription = Strings.Redirecting_to_login_screen_now;
    }
    return {
      title: computedTitle,
      description: computedDescription,
      buttonText: computedButtonText,
    };
  }, [roomCleanPhase]);

  const isProcessing = roomCleanPhase === ROOM_CLEAN_PHASE.STARTED;
  const isRoomCleanEnded = roomCleanPhase === ROOM_CLEAN_PHASE.ENDED;

  return (
    <Body>
      <View style={styles.container}>
        <Text style={styles.title}>{title}</Text>
        {!isProcessing && <Text style={styles.description}>{description}</Text>}
        {!isProcessing && !isRoomCleanEnded && (
          <InputText
            control={control}
            name="userInitials"
            // label={Strings.Room_Clean_Input_Label}
            placeholder={Strings.Room_Clean_Input_Placeholder}
            style={styles.input}
          />
        )}
        {isProcessing && !isRoomCleanEnded && (
          <GlobalTimer
            containerStyle={{width: scaler(568), marginVertical: scaler(35)}}
            textStyle={{fontSize: scaler(132), lineHeight: scaler(142)}}
          />
        )}
        {isRoomCleanEnded && (
          <View style={{marginTop: scaler(60)}}>
            <Icons.RoundedGreenTick />
          </View>
        )}
        {!isRoomCleanEnded && (
          <Button
            disabled={!isProcessing && isButtonDisabled}
            loading={isUpdatingMilestone}
            onPress={handleButtonPress}
            mode="contained"
            labelStyle={styles.buttonLabel}
            style={styles.button}
            contentStyle={styles.buttonContent}>
            {buttonText}
          </Button>
        )}
      </View>
    </Body>
  );
};

export default RoomCleanScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: scaler(54),
    marginHorizontal: scaler(92),
    paddingVertical: scaler(50),
    paddingHorizontal: scaler(28),
    backgroundColor: colors?.background.primary,
    borderRadius: scaler(28),
  },
  title: {
    fontSize: scaler(36),
    fontWeight: '700',
    color: colors?.foreground.primary,
    textAlign: 'center',
  },
  description: {
    fontSize: scaler(16),
    fontWeight: '400',
    color: colors?.foreground.secondary,
    textAlign: 'center',
    lineHeight: scaler(42),
  },
  input: {
    width: scaler(400),
    marginTop: scaler(12),
    marginBottom: scaler(40),
  },
  button: {
    borderRadius: scaler(50),
  },
  buttonContent: {
    height: scaler(98),
    paddingHorizontal: scaler(52),
  },
  buttonLabel: {
    fontSize: scaler(24),
    lineHeight: scaler(28),
    fontWeight: '500',
  },
});
