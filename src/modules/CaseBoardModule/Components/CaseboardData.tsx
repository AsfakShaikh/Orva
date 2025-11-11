import {StyleSheet, Text, View} from 'react-native';
import React, {useMemo} from 'react';
import scaler from '@utils/Scaler';
import {ROOM_STATUS} from '../Types/CommonTypes';
import {Strings} from '@locales/Localization';
import {theme} from '@styles/Theme';

interface TCaseboardData {
  MRN?: string;
  ProcedureName?: string;
  PrimarySurgeonName?: string;
  roomStatus: ROOM_STATUS;
  currentRoomStatus?: string;
}
const CaseboardData = ({
  MRN,
  ProcedureName,
  PrimarySurgeonName,
  roomStatus,
  currentRoomStatus,
}: TCaseboardData) => {
  const title = useMemo(() => {
    if (roomStatus === ROOM_STATUS.ACTIVE) {
      if (currentRoomStatus === Strings.First_Case_Start_in) {
        return ROOM_STATUS.FIRST_CASE_PENDING;
      }
      if (currentRoomStatus === Strings.First_Case_Delayed_by) {
        return ROOM_STATUS.FIRST_CASE_DELAYED;
      }
      return `MRN ${MRN}`;
    }
    if (roomStatus === ROOM_STATUS.OPEN) {
      return Strings.Room_Open;
    }
    if (roomStatus === ROOM_STATUS.CLOSED) {
      return Strings.Room_Closed;
    }
  }, [MRN, currentRoomStatus, roomStatus]);
  return (
    <View style={styles.container}>
      <Text numberOfLines={1} style={styles.textStyle}>
        {title}
      </Text>
      <Text numberOfLines={1} style={styles.textStyle}>
        {roomStatus === ROOM_STATUS.ACTIVE ? ProcedureName : ''}
      </Text>
      <Text numberOfLines={1} style={styles.textStyle}>
        {roomStatus === ROOM_STATUS.ACTIVE ? PrimarySurgeonName : ''}
      </Text>
    </View>
  );
};

export default CaseboardData;

const {colors} = theme;

const styles = StyleSheet.create({
  container: {
    marginVertical: scaler(8),
  },
  textStyle: {
    fontSize: scaler(13),
    fontWeight: '400',
    lineHeight: scaler(18),
    color: colors.foreground.primary,
  },
});
