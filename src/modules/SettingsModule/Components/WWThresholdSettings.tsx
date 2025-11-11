import {Strings} from '@locales/Localization';
import {theme} from '@styles/Theme';
import scaler from '@utils/Scaler';
import React, {Dispatch, SetStateAction, useState} from 'react';
import {StyleSheet, View} from 'react-native';
import {Text} from 'react-native-paper';
import Slider from '@react-native-community/slider';
import {DEFAULT_WW_THRESHOLD} from '@utils/Constants';
import {globalStyles} from '@styles/GlobalStyles';
import Button from '@components/Button';

const {colors} = theme;

interface WWThresholdSettingsProps {
  setOrvaThreshold: Dispatch<SetStateAction<number | null>>;
  setOrvaThresholdChangeDetected: (values: boolean) => void;
}

const WWThresholdSettings = ({
  setOrvaThreshold,
  setOrvaThresholdChangeDetected,
}: WWThresholdSettingsProps) => {
  const [value, setValue] = useState(DEFAULT_WW_THRESHOLD);

  const onValueChange = (val: number) => {
    setValue(val);
    setOrvaThreshold(parseFloat((val / 100).toFixed(2)));
    setOrvaThresholdChangeDetected(true);
  };

  const onReset = () => {
    setValue(DEFAULT_WW_THRESHOLD);
    setOrvaThreshold(null);
    setOrvaThresholdChangeDetected(true);
  };
  return (
    <View>
      <Text style={styles.title}>
        {`${Strings.Wake_Word_Threshold}: ${value}`}
      </Text>
      <Text style={styles.desc}>{Strings.Wake_Word_Threshold_Desc}</Text>
      <View style={[globalStyles.rowCenter, {gap: scaler(12)}]}>
        <Slider
          style={styles.slider}
          minimumValue={60}
          maximumValue={100}
          value={value}
          step={1}
          onValueChange={onValueChange}
          minimumTrackTintColor={colors.primary}
          maximumTrackTintColor={colors.foreground.secondary}
          thumbTintColor={colors.primary}
        />
        <Button onPress={onReset}>{Strings.Reset}</Button>
      </View>
    </View>
  );
};

export default WWThresholdSettings;

const styles = StyleSheet.create({
  title: {
    fontSize: scaler(18),
    fontWeight: '700',
    lineHeight: scaler(24),
    color: colors.foreground.primary,
    marginBottom: scaler(6),
  },
  desc: {
    fontSize: scaler(12),
    lineHeight: scaler(18),
    color: colors.foreground.primary,
  },
  slider: {
    flex: 1,
    height: scaler(40),
    marginHorizontal: -scaler(10),
  },
});
