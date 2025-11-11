import {View, Text, StyleSheet, TouchableWithoutFeedback} from 'react-native';
import React, {useMemo, useState} from 'react';
import CaseboardData from './CaseboardData';
import CaseboardProcedureCard from './CaseboardProcedureCard';
import CaseboardTimer from './CaseboardTimer';
import scaler from '@utils/Scaler';
import {theme} from '@styles/Theme';
import NoActiveCasesBlock from './NoActiveCasesBlock';
import {
  CASE_STATUS,
  MILESTONE,
} from '@modules/CaseSelectionModule/Types/CommonTypes';
import {CASEBORAD_CASE_DETAIL, ROOM_STATUS} from '../Types/CommonTypes';
import {Strings} from '@locales/Localization';
import {addMinutes, differenceInMinutes} from 'date-fns';
import {
  updateAuthValue,
} from '@modules/AuthModule/Hooks/useAuthValue';
import {NavigationProp, useNavigation} from '@react-navigation/native';
import {HomeDrawerParamList} from '@navigation/Types/CommonTypes';
import {HOME_DRAWER_ROUTE_NAME} from '@utils/Constants';

type CaseboardOtCardProps = Readonly<{
  otCaseDetail: CASEBORAD_CASE_DETAIL;
  otCardWidth?: number;
}>;

export default function CaseboardOtCard(Props: CaseboardOtCardProps) {
  const {otCardWidth, otCaseDetail} = Props ?? {};
  const {navigate} =
    useNavigation<
      NavigationProp<HomeDrawerParamList, HOME_DRAWER_ROUTE_NAME.CASEBOARD>
    >();

  const [currentRoomStatus, setCurrentRoomStatus] = useState<string>();
  const {name, currentCase, uuid} = otCaseDetail ?? {};
  const {endTime, startTime, procedure, actualEndTime, actualStartTime} =
    currentCase ?? {};
  const roomStatus: ROOM_STATUS = useMemo(() => {
    const caseStatus = currentCase?.status ?? currentCase?.currentCaseStatus;
    const isLast = currentCase?.isLastCase ?? currentCase?.isCurrentCaseLast;

    if (
      currentCase &&
      (caseStatus === CASE_STATUS.ACTIVE || caseStatus === CASE_STATUS.PLANNED)
    ) {
      return ROOM_STATUS.ACTIVE;
    }
    if (
      currentCase &&
      caseStatus === CASE_STATUS.SUBMITTED &&
      isLast === false
    ) {
      return ROOM_STATUS.OPEN;
    }

    return ROOM_STATUS.CLOSED;
  }, [currentCase]);

  const activeMilestoneId = useMemo(
    () => currentCase?.currentMilestone?.milestoneId,
    [currentCase?.currentMilestone?.milestoneId],
  );

  const projectedCaseTime = useMemo(() => {
    const wheelsInTime = procedure?.milestones?.find(
      m => m?.displayName === 'Wheels In',
    )?.completedTimestamp;

    const deltaTime =
      wheelsInTime && startTime && differenceInMinutes(wheelsInTime, startTime);

    const projectedTime =
      endTime && deltaTime && addMinutes(endTime, deltaTime);

    return projectedTime;
  }, [endTime, procedure?.milestones, startTime]);

  return (
    <TouchableWithoutFeedback
      onPress={() => {
        updateAuthValue({
          selectedOtsArr: [{uuid, name}],
        });
        navigate(HOME_DRAWER_ROUTE_NAME.SCHEDULE_STACK);
      }}>
      <View style={[styles.main, {width: otCardWidth}]}>
        <View style={styles.OTView}>
          <Text numberOfLines={1} style={styles.OT}>
            {name}
          </Text>
          <CaseboardTimer
            otId={uuid}
            onRoomStatusChange={status => setCurrentRoomStatus(status)}
            roomStatus={roomStatus}
          />
        </View>
        <CaseboardData
          MRN={currentCase?.patient?.mrn}
          ProcedureName={currentCase?.procedure?.name}
          PrimarySurgeonName={currentCase?.assignedSurgeon}
          roomStatus={roomStatus}
          currentRoomStatus={currentRoomStatus}
        />

        {currentCase &&
        currentCase?.status === CASE_STATUS.ACTIVE &&
        currentRoomStatus !== Strings.First_Case_Start_in ? (
          <>
            {currentCase?.procedure?.milestones?.map((i: MILESTONE) => {
              const isActiveMilestone = activeMilestoneId === i?.milestoneId;
              return (
                <CaseboardProcedureCard
                  key={i?.id}
                  milestoneId={i?.milestoneId}
                  otId={uuid}
                  borderColor={
                    isActiveMilestone ? i?.activeColor : 'transparent'
                  }
                  isProcedureActiveStatus={isActiveMilestone}
                  OTStepName={i?.waitingText}
                  currentMileStoneOrder={
                    currentCase?.currentMilestone?.order ?? 0
                  }
                  isSkipped={i?.skipped}
                  mileStoneOrder={i?.order}
                  completedTimeStamp={i?.completedTimestamp}
                  scheduledCaseEndTime={endTime}
                  scheduledCaseStartTime={startTime}
                  projectedCaseTime={projectedCaseTime}
                  isWheelsOut={!!actualEndTime}
                  isWheelsIn={!!actualStartTime}
                />
              );
            })}
          </>
        ) : (
          <NoActiveCasesBlock isFocused={roomStatus === ROOM_STATUS.OPEN} />
        )}
      </View>
    </TouchableWithoutFeedback>
  );
}

const {colors} = theme;

const styles = StyleSheet.create({
  main: {
    elevation: 4,
    shadowColor: 'rgba(0, 0, 0, 0.2)',
    borderRadius: scaler(8),
    backgroundColor: colors?.background.primary,
    padding: scaler(8),
  },
  OTView: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  OT: {
    flex: 1,
    fontSize: scaler(24),
    lineHeight: scaler(30),
    fontFamily: 'Inter',
    fontWeight: '700',
    color: 'black',
  },
});
