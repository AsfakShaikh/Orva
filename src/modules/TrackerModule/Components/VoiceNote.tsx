import {View, Text, StyleSheet} from 'react-native';
import React, {FC, useMemo, useState} from 'react';
import formatDateTime, {FORMAT_DATE_TYPE} from '@helpers/formatDateTime';
import {Strings} from '@locales/Localization';
import OptionMenu from '@components/OptionMenu';
import {globalStyles} from '@styles/GlobalStyles';
import scaler from '@utils/Scaler';
import {VOICE_NOTE, VOICE_NOTE_TYPE} from '../Types/CommonTypes';
import getFirstCharAndLastFullName from '@helpers/userNameUtility';
import {toggleDeleteVoiceNoteModal} from './DeleteVoiceNoteModal';
import {theme} from '@styles/Theme';
import Icons from '@assets/Icons';
import {toggleVoiceNoteClassificationEditModal} from './VoiceNoteClassificationEditModal';
import {toggleManageNotesTimerModal} from './ManageNotesTimersModal';
import {capitalizeFirstLetter} from '@helpers/capitalize';
import NotesChip from './NotesChip';

type VoiceNoteProps = {
  item: VOICE_NOTE;
  isClassifying?: boolean;
};

const VoiceNote: FC<VoiceNoteProps> = ({item, isClassifying}) => {
  const {
    id,
    note,
    loggedBy,
    timestamp,
    caseId,
    edited,
    updatedAt,
    classifications,
  } = item ?? {};

  const [isMenuVisible, setIsMenuVisible] = useState(false);

  const classificationList = useMemo(
    () =>
      classifications
        ? classifications?.filter(classification => classification?.isEnabled)
        : [],
    [classifications],
  );

  const voiceNoteOption = [
    {
      onPress: () => {
        setIsMenuVisible(false);
        toggleVoiceNoteClassificationEditModal({noteId: id, caseId});
      },
      title: Strings.Edit_Classifications,
    },
    {
      onPress: () => {
        setIsMenuVisible(false);
        toggleManageNotesTimerModal({
          type: VOICE_NOTE_TYPE.VOICE_NOTE,
          voiceNote: item,
        });
      },
      title: Strings.Edit_Note,
    },
    {
      onPress: () => {
        setIsMenuVisible(false);
        toggleDeleteVoiceNoteModal({noteId: id, caseId});
      },
      title: Strings.Delete_Note,
    },
  ];

  const subTitle = useMemo(() => {
    let text = `${Strings.Logged_at} ${formatDateTime(
      timestamp,
      FORMAT_DATE_TYPE.LOCAL,
      'hh:mmaaa',
    )} by ${getFirstCharAndLastFullName(loggedBy)}`;

    if (edited) {
      text = `${text}, ${Strings.edited_at} ${formatDateTime(
        updatedAt,
        FORMAT_DATE_TYPE.LOCAL,
        'hh:mmaaa',
      )}`;
    }

    return text;
  }, [edited, loggedBy, timestamp, updatedAt]);

  return (
    <View>
      <View style={[globalStyles.rowCenter]}>
        <Text style={styles.note}>
          "{capitalizeFirstLetter(note)}"
          {edited && (
            <Text
              style={{
                fontSize: scaler(12),
                color: colors?.foreground?.inactive,
              }}>{` (${Strings.edited})`}</Text>
          )}
        </Text>
        <OptionMenu
          options={voiceNoteOption}
          visible={isMenuVisible}
          onDismiss={() => setIsMenuVisible(false)}
          onAnchorPress={() => setIsMenuVisible(true)}
        />
      </View>
      <Text style={styles.loggedInfo}>{subTitle}</Text>
      <View style={styles.classifyingChipContainer}>
        {isClassifying && (
          <NotesChip
            icon={<Icons.AIGenerated fill={colors.foreground.inactive} />}
            label={Strings.Classifying}
            backgroundColor="transparent"
          />
        )}
        {classificationList?.map((classification: any) => (
          <NotesChip
            key={classification?.id ?? classification?.type}
            icon={
              <Icons.AIGenerated
                style={{marginRight: scaler(4), marginLeft: scaler(-3)}}
              />
            }
            label={classification.type}
            backgroundColor={classification?.colorCode}
          />
        ))}
      </View>
    </View>
  );
};

const {colors} = theme;

const styles = StyleSheet.create({
  note: {
    fontSize: scaler(16),
    flex: 1,
    color: colors?.foreground?.secondary,
  },
  loggedInfo: {
    fontSize: scaler(13),
    color: colors?.foreground?.secondary,
    lineHeight: scaler(18),
    marginTop: scaler(4),
  },
  classifyingChipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
    marginTop: scaler(4),
  },
});

export default VoiceNote;
