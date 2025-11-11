import {translate} from '@helpers/translate';
import {SELECT_OPTIONS} from '@utils/Types';
import React, {FC} from 'react';
import {Control, Controller, RegisterOptions} from 'react-hook-form';
import {StyleSheet, View} from 'react-native';
import {HelperText} from 'react-native-paper';
import RadioButton from './RadioButton';
import scaler from '@utils/Scaler';

export type InputRadioProps = {
  control: Control<any>;
  name: string;
  rules?: Omit<
    RegisterOptions<any, string>,
    'disabled' | 'setValueAs' | 'valueAsNumber' | 'valueAsDate'
  >;
  options: SELECT_OPTIONS;
  direction?: 'HORIZONTAL' | 'VERTICAL';
};

const InputRadio: FC<InputRadioProps> = ({
  control,
  name,
  rules,
  options,
  direction = 'HORIZONTAL',
}) => {
  return (
    <Controller
      control={control}
      rules={rules}
      name={name}
      render={({field, fieldState}) => {
        const errorMessage = fieldState?.error?.message;
        const fieldValue = field?.value?.toString();

        return (
          <View>
            <View
              style={
                direction === 'VERTICAL' ? styles.radioCol : styles.radioRow
              }>
              {options.map(item => {
                return (
                  <RadioButton
                    key={item?.value}
                    label={item?.key}
                    value={item?.value}
                    isSelected={fieldValue === item?.value}
                    onPress={val => field?.onChange(val)}
                  />
                );
              })}
            </View>
            {!!errorMessage && (
              <HelperText type="error" visible={!!errorMessage}>
                {translate(errorMessage)}
              </HelperText>
            )}
          </View>
        );
      }}
    />
  );
};

const styles = StyleSheet.create({
  radioRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scaler(24),
  },
  radioCol: {
    flexDirection: 'column',
    justifyContent: 'center',
    gap: scaler(24),
  },
});

export default InputRadio;
