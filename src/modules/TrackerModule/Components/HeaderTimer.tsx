import {View, Text, StyleSheet} from 'react-native';
import React, {useMemo, useState} from 'react';
import scaler from '@utils/Scaler';
import {theme} from '@styles/Theme';
import useTrackerValue from '../Hooks/useTrackerValues';
import useIdentifyTimer from '../Hooks/useIdentifyTimer';
import GlobalTimer, {GLOBAL_TIMER_TYPE} from '@components/GlobalTimer';
import {getColors} from '../Helpers/getColors';
import {Strings} from '@locales/Localization';
const {colors} = theme;

export default function HeaderTimer() {
  const {headerTimerValue} = useTrackerValue();
  useIdentifyTimer();

  const [isMoreThanThirtyMins, setIsMoreThanThirtyMins] = useState(false);

  const {BGcolor, textColor} = useMemo(() => {
    return getColors(
      headerTimerValue?.timerTitle,
      GLOBAL_TIMER_TYPE.HEADER,
      isMoreThanThirtyMins,
    );
  }, [headerTimerValue?.timerTitle, isMoreThanThirtyMins]);

  return (
    <View
      style={[
        styles.timer,
        {
          backgroundColor: BGcolor,
        },
      ]}>
      {headerTimerValue?.timerTitle ? (
        <>
          {headerTimerValue?.timerTitle === Strings.Timer_Inactive ? (
            <Text style={{lineHeight: scaler(30)}}>-- : -- : --</Text>
          ) : (
            <GlobalTimer
              headerTitle={headerTimerValue?.timerTitle}
              type={GLOBAL_TIMER_TYPE.HEADER}
              textStyle={{color: textColor}}
              onChangeMoreThanThirtyMins={(val: boolean) =>
                setIsMoreThanThirtyMins(val)
              }
            />
          )}

          <Text
            style={[
              styles.case,
              {
                color: textColor,
              },
            ]}>
            {headerTimerValue?.timerTitle}
          </Text>
        </>
      ) : (
        <Text style={styles.timerTxt}>00:00:00</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  timer: {
    minHeight: scaler(40),
    paddingHorizontal: scaler(20),
    paddingVertical: scaler(2),
    backgroundColor: '#252525',
    borderRadius: scaler(100),
    alignItems: 'center',
    justifyContent: 'center',
  },
  timerTxt: {
    fontSize: scaler(24),
    lineHeight: scaler(30),
    fontWeight: '700',
    color: colors.foreground.inverted,
    marginBottom: scaler(2),
  },
  case: {
    fontSize: scaler(9),
    lineHeight: scaler(9),
    color: colors.foreground.inverted,
  },
});
