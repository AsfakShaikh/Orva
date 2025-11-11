import {StyleSheet, Text, View} from 'react-native';
import React, {FC, useEffect, useMemo, useState} from 'react';
import scaler from '@utils/Scaler';
import GlobalTimer, {GLOBAL_TIMER_TYPE} from '../../../components/GlobalTimer';
import useTrackerValue from '@modules/TrackerModule/Hooks/useTrackerValues';
import {Strings} from '@locales/Localization';
import {getColors} from '@modules/TrackerModule/Helpers/getColors';
import {ROOM_STATUS} from '../Types/CommonTypes';

type CaseboardTimerProps = {
  otId: string;
  onRoomStatusChange: (status?: string) => void;
  roomStatus: ROOM_STATUS;
};

const CaseboardTimer: FC<CaseboardTimerProps> = ({
  otId,
  onRoomStatusChange,
  roomStatus,
}) => {
  const {caseboardHeaderTimerValue} = useTrackerValue();

  const [isMoreThanThirtyMins, setIsMoreThanThirtyMins] = useState(false);

  const headerTitle =
    roomStatus === ROOM_STATUS.ACTIVE || roomStatus === ROOM_STATUS.OPEN
      ? caseboardHeaderTimerValue?.find(cbHeader => cbHeader.otId === otId)
          ?.timerDetail?.timerTitle
      : Strings.Timer_Inactive;

  const {BGcolor, textColor} = useMemo(() => {
    return getColors(
      headerTitle,
      GLOBAL_TIMER_TYPE.CASEBOARD_HEADER,
      isMoreThanThirtyMins,
    );
  }, [headerTitle, isMoreThanThirtyMins]);

  useEffect(() => {
    onRoomStatusChange(headerTitle);
  }, [headerTitle, onRoomStatusChange]);
  return (
    <View style={[styles.container, {backgroundColor: BGcolor}]}>
      <Text style={[styles.case, {color: textColor}]}>{headerTitle}</Text>
      {roomStatus === ROOM_STATUS.ACTIVE || roomStatus === ROOM_STATUS.OPEN ? (
        <GlobalTimer
          headerTitle={headerTitle}
          type={GLOBAL_TIMER_TYPE.CASEBOARD_HEADER}
          currentOtId={otId}
          textStyle={{color: textColor}}
          onChangeMoreThanThirtyMins={(val: boolean) =>
            setIsMoreThanThirtyMins(val)
          }
        />
      ) : (
        <Text style={{color: textColor}}>-- : -- : --</Text>
      )}
    </View>
  );
};

export default CaseboardTimer;
const styles = StyleSheet.create({
  container: {
    paddingVertical: scaler(3),
    paddingHorizontal: scaler(2),
    height: scaler(32),
    width: scaler(90),
    borderRadius: scaler(4),
    justifyContent: 'center',
    alignItems: 'center',
  },
  case: {
    fontSize: scaler(8),
    lineHeight: scaler(10),
    fontWeight: '700',
  },
});
