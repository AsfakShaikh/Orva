// Not in use
import React from 'react';
import {View, StyleSheet} from 'react-native';
import InputSelect from '@components/InputSelect';
import scaler from '@utils/Scaler';
import {Control} from 'react-hook-form';
import {SettingFormValues} from '@navigation/Types/CommonTypes';
import {deviceOptions, NATIVE_LANGUAGES_OPTIONS} from '@utils/Constants';

type InputSectionProps = {
  control: Control<SettingFormValues>;
};
export const InputSection: React.FC<InputSectionProps> = ({control}) => {
  return (
    <View style={styles.inputSelect}>
      <InputSelect
        options={NATIVE_LANGUAGES_OPTIONS}
        name="native_language"
        control={control}
        label="Native Language"
        isGettingOptions={false}
        style={{width: scaler(400)}}
      />
      <InputSelect
        options={deviceOptions}
        name="device_type"
        control={control}
        label="Device Type"
        isGettingOptions={false}
        style={{width: scaler(400)}}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  inputSelect: {
    display: 'flex',
    flexDirection: 'row',
    gap: scaler(32),
  },
});

export default InputSection;
