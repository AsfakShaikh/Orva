import {StyleSheet, Text, View} from 'react-native';
import React, {useMemo} from 'react';
import scaler from '@utils/Scaler';
import {Icon} from 'react-native-paper';
import {theme} from '@styles/Theme';
import GlobalTimer, {GLOBAL_TIMER_TYPE} from '@components/GlobalTimer';
import {globalStyles} from '@styles/GlobalStyles';
import {DATE_TYPE} from '@utils/Types';
import formatDateTime, {FORMAT_DATE_TYPE} from '@helpers/formatDateTime';
import {Strings} from '@locales/Localization';

interface TCaseboardProcedureCard {
  completedTimeStamp: DATE_TYPE;
  borderColor?: string;
  OTStepName?: string;
  borderLeftWidth?: number;
  isProcedureActiveStatus?: boolean;
  milestoneId?: string;
  otId?: string;
  mileStoneOrder?: number;
  currentMileStoneOrder: number;
  isSkipped?: boolean;
  scheduledCaseEndTime?: Date;
  scheduledCaseStartTime?: Date;
  projectedCaseTime?: Date | string | number;
  isWheelsOut: boolean;
  isWheelsIn: boolean;
}

const CaseboardProcedureCard = ({
  completedTimeStamp,
  borderColor,
  OTStepName,
  borderLeftWidth = scaler(4),
  isProcedureActiveStatus,
  milestoneId,
  otId,
  mileStoneOrder = 0,
  currentMileStoneOrder,
  isSkipped,
  scheduledCaseEndTime,
  scheduledCaseStartTime,
  projectedCaseTime,
  isWheelsOut,
  isWheelsIn,
}: TCaseboardProcedureCard) => {
  const renderProcedure = () => {
    const renderActiveProcedure = () => (
      <>
        <GlobalTimer
          type={GLOBAL_TIMER_TYPE.CASEBOARD_MILESTONE}
          currentMilestoneId={milestoneId}
          currentOtId={otId}
        />
        <Text style={[styles.mileTxt, {color: colors?.foreground.primary}]}>
          {OTStepName}
        </Text>
      </>
    );

    const renderCompletedProcedure = () => (
      <>
        <View style={styles.timerContainer}>
          {isSkipped && (
            <Text style={[styles.topText, styles.skippedText]}>
              {Strings.Skipped}
            </Text>
          )}
          <View style={globalStyles.flex1} />
          <Text style={[styles.topText, styles.timerText]}>
            {formatDateTime(
              completedTimeStamp,
              FORMAT_DATE_TYPE.LOCAL,
              'HH:mm:ss',
            )}
          </Text>
        </View>
        <View style={globalStyles.center}>
          <Icon
            source={isSkipped ? 'chevron-double-right' : 'check'}
            size={scaler(isSkipped ? 24 : 20)}
            color={colors.foreground.inactive}
          />
        </View>
        <Text style={styles.mileTxt}>{OTStepName}</Text>
      </>
    );

    const renderPendingProcedure = () => (
      <>
        <View style={globalStyles.center}>
          <Text style={styles.afterText}>--:--:--</Text>
        </View>
        <Text style={styles.mileTxt}>{OTStepName}</Text>
      </>
    );

    if (isProcedureActiveStatus) {
      return renderActiveProcedure();
    } else if (currentMileStoneOrder > mileStoneOrder) {
      return renderCompletedProcedure();
    } else {
      return renderPendingProcedure();
    }
  };

  const scheduledWheelsOutText = useMemo(() => {
    let txt = projectedCaseTime
      ? Strings.Projected_Wheels_Out
      : Strings.Scheduled_Wheels_Out;

    let fdt = formatDateTime(projectedCaseTime ?? scheduledCaseEndTime);

    return fdt ? txt + ' ' + fdt : null;
  }, [projectedCaseTime, scheduledCaseEndTime]);

  const scheduledWheelsInText = useMemo(() => {
    let txt = Strings.Scheduled_Start;

    let fdt = formatDateTime(scheduledCaseStartTime);

    return fdt ? txt + ' ' + fdt : null;
  }, [scheduledCaseStartTime]);

  return (
    <View
      style={[
        styles.mainStyle,
        {
          borderColor: borderColor,
          borderLeftWidth: isProcedureActiveStatus
            ? borderLeftWidth
            : scaler(0),
        },
        isProcedureActiveStatus && styles.activeStatusMainStyle,
      ]}>
      {renderProcedure()}
      {OTStepName === 'Waiting to Transport' &&
        scheduledWheelsOutText &&
        !isWheelsOut && (
          <Text style={styles.scheduleText}>{scheduledWheelsOutText}</Text>
        )}
      {OTStepName === 'Awaiting Patient Entry' &&
        scheduledWheelsInText &&
        !isWheelsIn && (
          <Text style={styles.scheduleText}>{scheduledWheelsInText}</Text>
        )}
    </View>
  );
};

export default CaseboardProcedureCard;

const {colors} = theme;
const styles = StyleSheet.create({
  timerContainer: {
    flexDirection: 'row',
    padding: scaler(4),
    position: 'absolute',
    top: 0,
    right: 0,
  },
  topText: {
    fontSize: scaler(8),
    lineHeight: scaler(8),
    fontWeight: '700',
  },
  timerText: {
    color: colors?.foreground.inactive,
  },
  emp: {fontSize: scaler(18), fontWeight: '700'},
  mileTxt: {
    fontSize: scaler(11),
    lineHeight: scaler(14),
    marginTop: scaler(-2),
    fontWeight: '400',
    color: colors?.foreground.inactive,
    textAlign: 'center',
  },
  mainStyle: {
    height: scaler(60),
    paddingVertical: scaler(2),
    backgroundColor: colors.background.secondary,
    borderRadius: scaler(4),
    borderWidth: scaler(1),
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: scaler(2),
  },
  afterText: {
    fontSize: scaler(18),
    lineHeight: scaler(18),
    marginBottom: scaler(2),
    alignSelf: 'stretch',
  },
  skippedText: {
    color: colors.foreground.attention,
  },
  activeStatusMainStyle: {
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    elevation: 3,
    backgroundColor: colors.background.primary,
  },
  scheduleText: {
    fontSize: scaler(10),
    fontWeight: '600',
    color: colors.foreground.primary,
  },
});
