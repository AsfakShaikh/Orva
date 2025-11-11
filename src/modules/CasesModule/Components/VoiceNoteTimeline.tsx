import Icons from '@assets/Icons';
import formatDateTime, {FORMAT_DATE_TYPE} from '@helpers/formatDateTime';
import {Strings} from '@locales/Localization';
import {VOICE_NOTE_CLASSIFICATON} from '@modules/TrackerModule/Types/CommonTypes';
import {globalStyles} from '@styles/GlobalStyles';
import scaler from '@utils/Scaler';
import React, {FC, useMemo} from 'react';
import {StyleSheet, TouchableOpacity, View} from 'react-native';
import {Text} from 'react-native-paper';
import {theme} from '@styles/Theme';
import {VOICE_NOTE_TIMELINE} from '../Types/CommonTypes';
import {toggleEditVoiceNoteModal} from './EditVoiceNoteModal';
import {capitalizeFirstLetter} from '@helpers/capitalize';

const {colors} = theme;

interface VoiceNoteTimelineProps {
  index?: number;
  item: VOICE_NOTE_TIMELINE;
  hideLine?: boolean;
  isNotLast?: boolean;
  isEditEnabled?: boolean;
}

const VoiceNoteTimeline: FC<VoiceNoteTimelineProps> = ({
  index,
  item,
  hideLine = false,
  isNotLast = false,
  isEditEnabled = false,
}) => {
  const {timestamp, note, loggedBy, classifications, caseId} = item;

  const enabledClassifications = useMemo(
    () =>
      classifications?.filter(
        (classification: VOICE_NOTE_CLASSIFICATON) => classification.isEnabled,
      ) ?? [],
    [classifications],
  );

  return (
    <View style={globalStyles.row}>
      {!hideLine && (
        // eslint-disable-next-line react-native/no-inline-styles
        <View style={{alignItems: 'center', marginRight: scaler(16)}}>
          <Icons.VoiceNote width={scaler(24)} height={scaler(24)} />
          {isNotLast && <View style={styles.line} />}
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
          {Strings.Voice_Note}
        </Text>

        <View
          // eslint-disable-next-line react-native/no-inline-styles
          style={{
            gap: scaler(4),
            flex: 1,
          }}>
          <TouchableOpacity
            disabled={!isEditEnabled}
            onPress={() => {
              toggleEditVoiceNoteModal({
                caseId,
                voiceNote: item,
                timelineItemIndex: index,
              });
            }}
            style={[
              styles.borderTextBox,
              isEditEnabled && {
                borderColor: colors.foreground.inactive,
              },
            ]}>
            <Text style={styles.timestampText}>
              {capitalizeFirstLetter(note)}
            </Text>
          </TouchableOpacity>
          <Text
            style={{
              fontSize: scaler(13),
            }}>{`${Strings.Logged_at} ${formatDateTime(
            timestamp,
            FORMAT_DATE_TYPE.LOCAL,
            'hh:mmaaa',
          )} by ${loggedBy}`}</Text>
          <View style={styles.classificationContainer}>
            {enabledClassifications?.map(
              (classification: VOICE_NOTE_CLASSIFICATON) => {
                return (
                  <View
                    key={classification.type}
                    style={[
                      styles.classificationBox,
                      {
                        backgroundColor: classification?.colorCode,
                      },
                    ]}>
                    <Icons.AIGenerated width={scaler(16)} height={scaler(16)} />
                    <Text style={styles.classificationText}>
                      {classification?.type}
                    </Text>
                  </View>
                );
              },
            )}
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  line: {
    width: scaler(4),
    backgroundColor: colors.background.activity,
    flex: 1,
  },
  timestampText: {
    fontSize: scaler(16),
  },
  classificationContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: scaler(8),
    marginTop: scaler(8),
    flex: 1,
  },
  classificationBox: {
    alignItems: 'center',
    gap: scaler(4),
    borderRadius: scaler(4),
    paddingHorizontal: scaler(8),
    paddingVertical: scaler(4),
    backgroundColor: colors.background.activity,
    flexDirection: 'row',
  },
  classificationText: {
    fontSize: scaler(13),
    color: colors.foreground.secondary,
  },
  iconContainer: {
    width: scaler(20),
    height: scaler(20),
    borderRadius: scaler(10),
    borderWidth: scaler(2),
    borderColor: colors.foreground.inactive,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: scaler(2),
  },
  borderTextBox: {
    borderWidth: scaler(1),
    borderRadius: scaler(4),
    borderColor: 'transparent',
    paddingHorizontal: scaler(4),
    alignSelf: 'flex-start',
    marginLeft: scaler(-4),
  },
});

export default VoiceNoteTimeline;
