import React, {FC} from 'react';

import {globalStyles} from '@styles/GlobalStyles';
import {Strings} from '@locales/Localization';
import formatDateTime, {FORMAT_DATE_TYPE} from '@helpers/formatDateTime';
import {theme} from '@styles/Theme';
import scaler from '@utils/Scaler';
import {StyleSheet, TouchableOpacity, View} from 'react-native';
import {Text} from 'react-native-paper';
import Icons from '@assets/Icons';
import {TIMER_TIMELINE} from '../Types/CommonTypes';
import formatMilliSeconds from '@helpers/formatMilliSeconds';
import {DATE_TYPE} from '@utils/Types';
import {toggleEditTimerLabelModal} from './EditTimerLabelModal';

const {colors} = theme;

interface TimerNoteTimelineProps {
  index?: number;
  item: TIMER_TIMELINE;
  hideLine?: boolean;
  isNotLast?: boolean;
  isEditEnabled?: boolean;
}

function renderDesc(timestamp: DATE_TYPE, duration?: number, action?: string) {
  if (action === 'CREATE' && duration) {
    return <Text>{` - ${formatMilliSeconds(duration)}`}</Text>;
  }
  if (timestamp) {
    return (
      <Text style={{fontWeight: 'bold'}}>{` - ${formatDateTime(
        timestamp,
        FORMAT_DATE_TYPE.LOCAL,
        'hh:mm aaa',
      )}`}</Text>
    );
  }

  return null;
}

const TimerNoteTimeline: FC<TimerNoteTimelineProps> = ({
  index,
  item,
  hideLine = false,
  isNotLast = false,
  isEditEnabled = false,
}) => {
  const {
    timestamp,
    desc,
    loggedBy,
    title,
    duration,
    caseId,
    action,
    timerCreatedAt,
    timerId,
  } = item;

  return (
    <View style={globalStyles.row}>
      {!hideLine && (
        // eslint-disable-next-line react-native/no-inline-styles
        <View style={{alignItems: 'center', marginRight: scaler(16)}}>
          <View style={styles.iconContainer_t}>
            <Icons.TimerNote width={scaler(10)} height={scaler(10)} />
          </View>
          {isNotLast && <View style={styles.line_t} />}
        </View>
      )}
      <View
        style={[
          globalStyles.row,
          // eslint-disable-next-line react-native/no-inline-styles
          {
            flex: 1,
            marginTop: scaler(-3),
            minHeight: scaler(88),
            marginBottom: isNotLast ? scaler(24) : 0,
          },
        ]}>
        <Text
          style={{
            width: scaler(180),
            fontSize: scaler(18),
          }}>
          {title ?? Strings.Timer}
        </Text>

        <View
          // eslint-disable-next-line react-native/no-inline-styles
          style={{
            gap: scaler(4),
            flex: 1,
          }}>
          <View style={styles.textBox}>
            <TouchableOpacity
              disabled={!isEditEnabled}
              onPress={() => {
                toggleEditTimerLabelModal({
                  caseId,
                  timerId,
                  description: desc,
                  timerDuration: duration,
                  timerCreatedAt: timerCreatedAt,
                  timelineItemIndex: index,
                });
              }}
              style={[
                styles.borderTextBox,
                isEditEnabled && {
                  borderColor: colors.foreground.inactive,
                },
              ]}>
              <Text>{desc}</Text>
            </TouchableOpacity>
            <Text>{renderDesc(timestamp, duration, action)}</Text>
          </View>
          <Text
            style={{
              fontSize: scaler(13),
            }}>{`${Strings.Logged_at} ${formatDateTime(
            timestamp,
            FORMAT_DATE_TYPE.LOCAL,
            'hh:mmaaa',
          )} by ${loggedBy}`}</Text>
          <View style={styles.classificationContainer_t}>
            <View style={[styles.classificationBox_t]}>
              <Icons.TimeHistory width={scaler(16)} height={scaler(16)} />
              <Text style={styles.classificationText_t}>Timer</Text>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  line_t: {
    width: scaler(4),
    backgroundColor: colors.background.activity,
    flex: 1,
  },
  timestampText_t: {
    fontSize: scaler(16),
  },
  classificationContainer_t: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: scaler(8),
    marginTop: scaler(8),
    flex: 1,
  },
  classificationBox_t: {
    alignItems: 'center',
    gap: scaler(4),
    borderRadius: scaler(4),
    paddingHorizontal: scaler(8),
    paddingVertical: scaler(4),
    backgroundColor: colors.background.tertiary,
    flexDirection: 'row',
  },
  classificationText_t: {
    fontSize: scaler(13),
    color: colors.foreground.secondary,
  },
  iconContainer_t: {
    width: scaler(20),
    height: scaler(20),
    borderRadius: scaler(10),
    borderWidth: scaler(1),
    borderColor: colors.foreground.inactive,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: scaler(2),
  },
  textBox: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: scaler(-4),
  },
  borderTextBox: {
    borderWidth: scaler(1),
    borderRadius: scaler(4),
    borderColor: 'transparent',
    paddingHorizontal: scaler(4),
  },
});

export default TimerNoteTimeline;
