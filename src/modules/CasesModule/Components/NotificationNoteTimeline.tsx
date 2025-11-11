import React, {FC} from 'react';

import {globalStyles} from '@styles/GlobalStyles';
import {Strings} from '@locales/Localization';
import formatDateTime, {FORMAT_DATE_TYPE} from '@helpers/formatDateTime';
import {theme} from '@styles/Theme';
import scaler from '@utils/Scaler';
import {StyleSheet, TouchableOpacity, View} from 'react-native';
import {Text} from 'react-native-paper';
import Icons from '@assets/Icons';
import {NOTIFICATION_TIMELINE} from '../Types/CommonTypes';
import NotesChip from '@modules/TrackerModule/Components/NotesChip';

const {colors} = theme;

interface NotificationNoteTimelineProps {
  item: NOTIFICATION_TIMELINE;
  hideLine?: boolean;
  isNotLast?: boolean;
  isEditEnabled?: boolean;
}

const NotificationNoteTimeline: FC<NotificationNoteTimelineProps> = ({
  item,
  hideLine = false,
  isNotLast = false,
  isEditEnabled = false,
}) => {
  const {loggedBy, message, sendTo, createdAt} = item;

  return (
    <View style={globalStyles.row}>
      {!hideLine && (
        // eslint-disable-next-line react-native/no-inline-styles
        <View style={{alignItems: 'center', marginRight: scaler(16)}}>
          <View style={styles.iconContainer_t}>
            <Icons.SmsFilled width={scaler(10)} height={scaler(10)} />
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
          {Strings.SMS}
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
              onPress={() => {}}
              style={[
                styles.borderTextBox,
                isEditEnabled && {
                  borderColor: colors.foreground.inactive,
                },
              ]}>
              <Text>{message}</Text>
            </TouchableOpacity>
            <Text
              style={
                styles.descriptionText
              }>{`${Strings.Sent_to} ${sendTo}`}</Text>
          </View>
          <Text
            style={{
              fontSize: scaler(13),
            }}>{`${Strings.Logged_at} ${formatDateTime(
            createdAt,
            FORMAT_DATE_TYPE.LOCAL,
            'hh:mmaaa',
          )} by ${loggedBy}`}</Text>
          <NotesChip iconName="message-outline" label={Strings.SMS} />
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
    marginLeft: scaler(-4),
  },
  descriptionText: {
    marginLeft: scaler(4),
    fontWeight: '700',
  },
  borderTextBox: {
    borderWidth: scaler(1),
    borderRadius: scaler(4),
    borderColor: 'transparent',
    paddingHorizontal: scaler(4),
  },
});

export default NotificationNoteTimeline;
