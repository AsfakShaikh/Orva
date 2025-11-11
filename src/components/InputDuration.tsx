import mergeRefs from '@helpers/mergeRefs';
import { translate } from '@helpers/translate';
import scaler from '@utils/Scaler';
import React, { useRef, useState } from 'react';
import { Control, Controller, RegisterOptions } from 'react-hook-form';
import { TouchableOpacity, View } from 'react-native';

import {
  HelperText,
  TextInput,
  TextInputProps,
  useTheme,
} from 'react-native-paper';
import DurationPickerModal, {
  DurationPickerModalProps,
} from './DurationPickerModal';
import secondsToDuration from '@helpers/secondsToDuration';

export type InputDurationProps = {
  control: Control<any>;
  name: string;
  rules?: Omit<RegisterOptions, 'valueAsNumber' | 'valueAsDate' | 'setValueAs'>;
  isError?: boolean;
  label?: string;
  durationPickerProps?: DurationPickerModalProps;
  isLabelDefaultBehaviour?: boolean;
  enableSeconds?: boolean;
  isDisabled?: boolean;
  finalValue?: string;
} & TextInputProps;

export default function InputDuration(Props: InputDurationProps) {
  const {
    control,
    name,
    rules,
    style,
    isError,
    label,
    placeholder,
    durationPickerProps,
    isLabelDefaultBehaviour = true,
    enableSeconds = false,
    isDisabled = false,
    finalValue = "0:0:0",
    ...rest
  } = Props;

  const { colors, fonts } = useTheme();
  const [isDurationPickerVisible, setIsDurationPickerVisible] = useState(false);

  const textInputRef = useRef<any>(null);

  return (
    <Controller
      control={control}
      rules={rules}
      name={name}
      render={({ field: { value, onChange, ref }, fieldState }) => {
        const errorMessage = fieldState?.error?.message;
        const fieldValue = value?.toString();

        const inputVal = (() => {
          const duration = secondsToDuration(fieldValue);

          let fieldText = isDisabled ? finalValue : `${duration?.hours}:${duration?.mins}:0`;
          if (enableSeconds) {
            fieldText = `${duration?.hours}:${duration?.mins}:${duration?.secs}`;
          }

          if (isDurationPickerVisible && !fieldValue) {
            return placeholder ?? label;
          }
          if (fieldText === ':' || fieldText === '::') {
            return '';
          }
          return fieldText;
        })();

        const hideLabel =
          !isLabelDefaultBehaviour &&
          !isDurationPickerVisible &&
          fieldValue &&
          fieldValue.length > 0;

        return (
          <>
            <TouchableOpacity onPress={() => !isDisabled && setIsDurationPickerVisible(true)}>
              <View pointerEvents="none">
                <TextInput
                  ref={mergeRefs(textInputRef, ref)}
                  mode="outlined"
                  value={inputVal}
                  onChangeText={val => onChange(val)}
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
                    },
                    style,
                  ]}
                  editable={true}
                  showSoftInputOnFocus={false}
                  caretHidden={true}
                  label={hideLabel ? '' : label}
                  {...rest}
                />
              </View>

              {!!errorMessage && (
                <HelperText type="error" visible={!!errorMessage}>
                  {translate(errorMessage)}
                </HelperText>
              )}
            </TouchableOpacity>
            <DurationPickerModal
              isVisible={isDurationPickerVisible}
              onCancel={() => setIsDurationPickerVisible(false)}
              value={fieldValue}
              onConfirm={val => {
                onChange(val);
                setIsDurationPickerVisible(false);
              }}
              enableSeconds={enableSeconds}
              {...durationPickerProps}
            />
          </>
        );
      }}
    />
  );
}