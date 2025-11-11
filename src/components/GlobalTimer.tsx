import React, {useEffect, useState} from 'react';
import {
  Text,
  StyleSheet,
  View,
  StyleProp,
  ViewStyle,
  TextStyle,
} from 'react-native';
import scaler from '@utils/Scaler';
import formatTimerSec from '@helpers/formatTimerSec';
import {theme} from '@styles/Theme';
import useEventEmitter from '@hooks/useEventEmitter';
import {UPDATE_TIMER_EVENT} from '@modules/TrackerModule/Hooks/useUpdateTimers';
import {Strings} from '@locales/Localization';

export enum GLOBAL_TIMER_TYPE {
  HEADER,
  MILESTONE,
  CASEBOARD_HEADER,
  CASEBOARD_MILESTONE,
}

interface GlobalTimerProps {
  type?: GLOBAL_TIMER_TYPE;
  currentOtId?: string;
  currentMilestoneId?: string;
  textStyle?: StyleProp<TextStyle>;
  headerTitle?: string;
  onChangeMoreThanThirtyMins?: (val: boolean) => void;
  fullWidth?: boolean;
  containerStyle?: StyleProp<ViewStyle>;
}

const GlobalTimer: React.FC<GlobalTimerProps> = ({
  type = GLOBAL_TIMER_TYPE.MILESTONE,
  currentOtId,
  currentMilestoneId,
  textStyle,
  headerTitle,
  onChangeMoreThanThirtyMins,
  fullWidth,
  containerStyle,
}) => {
  const [timerSecondsVal, setTimerSecondsVal] = useState<number>(0);

  useEffect(() => {
    if (
      headerTitle === Strings.TurnOver_Time &&
      timerSecondsVal >= 1800 &&
      (type === GLOBAL_TIMER_TYPE.HEADER ||
        type === GLOBAL_TIMER_TYPE.CASEBOARD_HEADER)
    ) {
      onChangeMoreThanThirtyMins?.(true);
    }
    if (
      headerTitle === Strings.TurnOver_Time &&
      timerSecondsVal < 1800 &&
      (type === GLOBAL_TIMER_TYPE.HEADER ||
        type === GLOBAL_TIMER_TYPE.CASEBOARD_HEADER)
    ) {
      onChangeMoreThanThirtyMins?.(false);
    }
  }, [headerTitle, timerSecondsVal, onChangeMoreThanThirtyMins, type]);

  useEventEmitter(
    UPDATE_TIMER_EVENT,
    ({
      timerType,
      seconds,
      otId,
      milestoneId,
    }: {
      timerType: GLOBAL_TIMER_TYPE;
      seconds?: number;
      otId?: string;
      milestoneId?: string;
    }) => {
      if (type === timerType && seconds !== undefined) {
        // Header & Tracker
        if ((!otId || !currentOtId) && (!milestoneId || !currentMilestoneId)) {
          setTimerSecondsVal(seconds);
          return;
        }

        // Caseboard Header
        if (
          otId &&
          currentOtId &&
          currentOtId === otId &&
          (!milestoneId || !currentMilestoneId)
        ) {
          setTimerSecondsVal(seconds);
          return;
        }

        // Caseboard Milestone
        if (
          milestoneId &&
          currentMilestoneId &&
          currentMilestoneId === milestoneId &&
          otId &&
          currentOtId &&
          currentOtId === otId
        ) {
          setTimerSecondsVal(seconds);
          return;
        }
      }
    },
  );

  const timerTextStyle = (function () {
    let fontStyle;
    switch (type) {
      case GLOBAL_TIMER_TYPE.HEADER:
        fontStyle = styles.headerTimerText;
        break;
      case GLOBAL_TIMER_TYPE.CASEBOARD_HEADER:
        fontStyle = styles.caseboardHeaderTimerText;
        break;
      case GLOBAL_TIMER_TYPE.CASEBOARD_MILESTONE:
        fontStyle = styles.caseboardMilestoneTimerText;
        break;
      default:
        fontStyle = styles.milestoneTimerText;
        break;
    }

    if (textStyle) {
      fontStyle = [fontStyle, textStyle];
    }

    return fontStyle;
  })();

  const {isNegative, formattedHours, formattedMinutes, formattedSeconds} =
    formatTimerSec(timerSecondsVal);

  return (
    <View
      style={[
        styles.container,
        // eslint-disable-next-line react-native/no-inline-styles
        {width: fullWidth ? '100%' : 'auto'},
        containerStyle,
      ]}>
      <Text style={timerTextStyle}>
        {isNegative ? '- ' : ''}
        {formattedHours}
      </Text>
      <Text style={timerTextStyle}>:</Text>
      <Text style={timerTextStyle}>{formattedMinutes}</Text>
      <Text style={timerTextStyle}>:</Text>
      <Text style={timerTextStyle}>{formattedSeconds}</Text>
    </View>
  );
};

const {colors} = theme;

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  milestoneTimerText: {
    fontSize: scaler(60),
    lineHeight: scaler(65),
    fontFamily: 'Inter',
    fontWeight: '700',
    color: colors.foreground.primary,
  },
  headerTimerText: {
    fontSize: scaler(20),
    lineHeight: scaler(24),
    fontFamily: 'Inter',
    fontWeight: '700',
    color: colors.foreground.inverted,
  },
  caseboardHeaderTimerText: {
    fontSize: scaler(14),
    lineHeight: scaler(16),
    fontFamily: 'Inter',
    fontWeight: '400',
    color: colors.foreground.inverted,
  },
  caseboardMilestoneTimerText: {
    fontSize: scaler(18),
    lineHeight: scaler(24),
    fontFamily: 'Inter',
    fontWeight: '700',
    color: colors.foreground.primary,
  },
});

export default GlobalTimer;
