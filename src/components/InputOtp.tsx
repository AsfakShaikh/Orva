/* eslint-disable react/no-unstable-nested-components */
import React, {useRef, useState} from 'react';
import {
  HelperText,
  TextInput,
  TextInputProps,
  useTheme,
} from 'react-native-paper';
import {Control, Controller, RegisterOptions} from 'react-hook-form';
import scaler from '@utils/Scaler';
import {translate} from '@helpers/translate';
import {theme} from '@styles/Theme';
import {
  NativeSyntheticEvent,
  StyleSheet,
  TextInputKeyPressEventData,
  View,
} from 'react-native';
const {colors} = theme;

export type InputOtpProps = {
  length?: number;
  onOtpComplete?: (otp: string) => void;
  control: Control<any>;
  name: string;
  rules?: Omit<
    RegisterOptions<any, string>,
    'disabled' | 'setValueAs' | 'valueAsNumber' | 'valueAsDate'
  >;
  isError?: boolean;
} & TextInputProps;

export default function InputOtp(Props: InputOtpProps) {
  const {
    length = 4,
    onOtpComplete,
    control,
    name,
    rules,
    style,
    isError,
    ...rest
  } = Props;

  const {fonts} = useTheme();
  const [isFocus, setIsFocus] = useState(false);
  const inputRefs = useRef<Array<any>>([]);

  return (
    <Controller
      control={control}
      rules={rules}
      name={name}
      render={({field, fieldState}) => {
        const errorMessage = fieldState?.error?.message;
        const fieldValue = field?.value?.toString();

        const handleChangeText = (text: string, index: number) => {
          if (text === '' || /^[0-9\b]+$/.test(text)) {
            const lastChar = text.slice(-1);

            // Create new value by replacing character at current index
            const newValue = fieldValue
              ? fieldValue.slice(0, index) +
                lastChar +
                fieldValue.slice(index + 1)
              : lastChar.padEnd(length, ' ');

            field.onChange(newValue.trim());

            // Automatically focus the next input
            if (text && index < length - 1) {
              inputRefs.current[index + 1].focus();
            }

            // Call callback when OTP is filled
            if (fieldValue.length === length) {
              onOtpComplete?.(fieldValue);
            }
          }
        };

        const handleKeyPress = (
          event: NativeSyntheticEvent<TextInputKeyPressEventData>,
          index: number,
        ) => {
          if (event.nativeEvent.key === 'Backspace') {
            field.onChange(fieldValue.slice(0, -1));
            if (index > 0 && index <= length - 1) {
              inputRefs.current[index - 1].focus();
            }
          }
        };

        return (
          <View style={styles.container}>
            {Array.from({length}, (_, index) => (
              <TextInput
                ref={(ref: any) => (inputRefs.current[index] = ref!)}
                mode="outlined"
                value={fieldValue[index]}
                onChangeText={value => handleChangeText(value, index)}
                onKeyPress={e => handleKeyPress(e, index)}
                error={!!errorMessage || isError}
                textColor={errorMessage ? colors.error : colors.onSurface}
                style={[
                  // eslint-disable-next-line react-native/no-inline-styles
                  {
                    ...fonts.bodyLarge,
                    backgroundColor: 'transparent',
                    height: scaler(56),
                    width: scaler(48),
                    paddingLeft: scaler(4),
                  },
                  style,
                ]}
                onBlur={() => setIsFocus(false)}
                onFocus={() => setIsFocus(true)}
                theme={{colors: {error: colors.foreground.attention}}}
                {...rest}
              />
            ))}
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
}
const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: scaler(9),
  },
});
