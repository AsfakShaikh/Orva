import formatDateTime, {FORMAT_DATE_TYPE} from '@helpers/formatDateTime';
import getFirstCharAndLastFullName from '@helpers/userNameUtility';
import {Strings} from '@locales/Localization';
import {globalStyles} from '@styles/GlobalStyles';
import {theme} from '@styles/Theme';
import scaler from '@utils/Scaler';
import React, {FC, useMemo} from 'react';
import {StyleSheet, View} from 'react-native';
import {Text} from 'react-native-paper';
import {VOICE_NOTE_TYPE} from '../Types/CommonTypes';
import NotesChip from './NotesChip';

const {colors} = theme;

type NoteProps = {
  details: {
    type: VOICE_NOTE_TYPE;
    id: number;
    title: string;
    updatedAt: string;
    loggedBy: string;
    desc: string;
    duration: number;
  };
};

const Note: FC<NoteProps> = ({details}) => {
  const {title, desc, loggedBy, updatedAt, type} = details ?? {};

  const isSmsNote = type === VOICE_NOTE_TYPE.NOTIFICATION_NOTE;

  const loggedInfo = useMemo(() => {
    let text = `${Strings.Logged_at} ${formatDateTime(
      updatedAt,
      FORMAT_DATE_TYPE.LOCAL,
      'hh:mmaaa',
    )} by ${getFirstCharAndLastFullName(loggedBy)}`;

    return text;
  }, [loggedBy, updatedAt]);

  return (
    <View>
      <View style={globalStyles.rowCenter}>
        <Text style={styles.note}>{`${title}: ${desc}`}</Text>
      </View>
      <Text style={styles.loggedInfo}>{loggedInfo}</Text>
      <NotesChip
        iconName={isSmsNote ? 'message-outline' : 'history'}
        label={isSmsNote ? Strings.SMS : Strings.Timer}
      />
    </View>
  );
};
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
});

export default Note;
