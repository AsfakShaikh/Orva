import React, {forwardRef, useMemo, useState} from 'react';
import {
  HelperText,
  TextInput,
  TextInputProps,
  useTheme,
} from 'react-native-paper';
import {Control, Controller, RegisterOptions} from 'react-hook-form';
import scaler from '@utils/Scaler';
import {translate} from '@helpers/translate';
import {StyleSheet, Text, View} from 'react-native';
import {theme} from '@styles/Theme';

export enum INPUT_TEXT_TYPE {
  PASSWORD = 'PASSWORD',
  TEXT = 'TEXT',
}

export type InputTextProps = {
  control: Control<any>;
  name: string;
  rules?: Omit<
    RegisterOptions<any, string>,
    'disabled' | 'setValueAs' | 'valueAsNumber' | 'valueAsDate'
  >;
  isError?: boolean;
  label?: string;
  isLabelDefaultBehaviour?: boolean;
  showLength?: boolean;
  maxLength?: number;
  type?: INPUT_TEXT_TYPE;
} & TextInputProps;

const InputText = forwardRef<typeof TextInput, InputTextProps>((Props, ref) => {
  const {
    control,
    name,
    rules,
    label,
    style,
    isError,
    isLabelDefaultBehaviour = true,
    showLength = false,
    maxLength,
    editable = true,
    secureTextEntry = false,
    type = INPUT_TEXT_TYPE.TEXT,
    ...rest
  } = Props;

  const {colors, fonts} = useTheme();
  const [isFocus, setIsFocus] = useState(false);
  const [isSecure, setIsSecure] = useState(true);

  const isPasswordInput = useMemo(
    () => type === INPUT_TEXT_TYPE.PASSWORD,
    [type],
  );

  return (
    <Controller
      control={control}
      rules={rules}
      name={name}
      render={({field, fieldState}) => {
        const errorMessage = fieldState?.error?.message;
        const fieldValue = field?.value ? field?.value?.toString() : '';

        const hideLabel =
          !isLabelDefaultBehaviour &&
          !isFocus &&
          fieldValue &&
          fieldValue.length > 0;
        return (
          <View>
            <TextInput
              ref={() => field?.ref(ref)}
              mode="outlined"
              maxLength={maxLength}
              value={fieldValue}
              onChangeText={value => field.onChange(value)}
              error={!!errorMessage || isError}
              textColor={
                !!errorMessage || isError ? colors.error : colors.onSurface
              }
              style={[
                // eslint-disable-next-line react-native/no-inline-styles
                {
                  ...fonts.bodyLarge,
                  backgroundColor: 'transparent',
                  height: scaler(56),
                  marginTop: hideLabel ? scaler(6) : 0,
                  opacity: editable ? 1 : 0.5,
                },
                style,
              ]}
              onBlur={() => setIsFocus(false)}
              onFocus={() => setIsFocus(true)}
              label={hideLabel ? '' : label}
              editable={editable}
              secureTextEntry={secureTextEntry || (isPasswordInput && isSecure)}
              right={
                isPasswordInput && (
                  <TextInput.Icon
                    icon={isSecure ? 'eye-outline' : 'eye-off-outline'}
                    onPress={() => setIsSecure(prev => !prev)}
                    size={scaler(24)}
                  />
                )
              }
              {...rest}
            />
            {!!errorMessage && (
              <HelperText type="error" visible={!!errorMessage}>
                {translate(errorMessage)}
              </HelperText>
            )}

            {showLength && (
              <View>
                <Text style={styles.lengthText}>
                  {fieldValue?.length}/{maxLength}
                </Text>
              </View>
            )}
          </View>
        );
      }}
    />
  );
});

export default InputText;

const {colors} = theme;
const styles = StyleSheet.create({
  lengthText: {
    textAlign: 'right',
    color: colors.inverseSurface,
    fontSize: scaler(12),
  },
});
