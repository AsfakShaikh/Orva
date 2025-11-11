import formatDateTime, {FORMAT_DATE_TYPE} from '@helpers/formatDateTime';
import mergeRefs from '@helpers/mergeRefs';
import {translate} from '@helpers/translate';
import scaler from '@utils/Scaler';
import React, {useRef, useState} from 'react';
import {Control, Controller, RegisterOptions} from 'react-hook-form';
import {TouchableOpacity, View} from 'react-native';
import DateTimePickerModal, {
  ReactNativeModalDateTimePickerProps,
} from 'react-native-modal-datetime-picker';
import {
  HelperText,
  TextInput,
  TextInputProps,
  useTheme,
} from 'react-native-paper';
import DurationPickerModal, {
  DurationPickerModalProps,
  DURATION_PICKER_VAL_TYPE,
} from './DurationPickerModal';

export enum INPUT_DATE_PICKER_TYPE {
  DATE = 'DATE',
  DURATION = 'DURATION',
}

export type InputDateProps = {
  control: Control<any>;
  name: string;
  rules?: Omit<RegisterOptions, 'valueAsNumber' | 'valueAsDate' | 'setValueAs'>;
  isError?: boolean;
  label?: string;
  datePickerProps?: Omit<
    ReactNativeModalDateTimePickerProps,
    'onConfirm' | 'onCancel'
  >;
  durationPickerProps?: DurationPickerModalProps;
  pickerType?: INPUT_DATE_PICKER_TYPE;
  isLabelDefaultBehaviour?: boolean;
} & TextInputProps;

export default function InputDate(Props: InputDateProps) {
  const {
    control,
    name,
    rules,
    style,
    isError,
    label,
    placeholder,
    datePickerProps,
    durationPickerProps,
    pickerType = INPUT_DATE_PICKER_TYPE.DATE,
    isLabelDefaultBehaviour = true,
    ...rest
  } = Props;

  const {colors, fonts} = useTheme();
  const [isDatePickerVisible, setIsDatePickerVisible] = useState(false);

  const textInputRef = useRef<any>(null);

  const isDurationPicker = pickerType === INPUT_DATE_PICKER_TYPE.DURATION;
  return (
    <Controller
      control={control}
      rules={rules}
      name={name}
      render={({field: {value, onChange, ref}, fieldState}) => {
        const errorMessage = fieldState?.error?.message;
        const formatString = durationPickerProps?.enableSeconds
          ? 'HH:mm:ss'
          : 'HH:mm';

        const fieldValue =
          value && value?.length !== 0
            ? formatDateTime(
                new Date(value),
                FORMAT_DATE_TYPE.NONE,
                formatString,
              )
            : '';

        const inputVal =
          isDatePickerVisible && !fieldValue
            ? placeholder ?? label
            : fieldValue;

        const hideLabel =
          !isLabelDefaultBehaviour &&
          !isDatePickerVisible &&
          fieldValue &&
          fieldValue.length > 0;

        return (
          <>
            <TouchableOpacity onPress={() => setIsDatePickerVisible(true)}>
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
            {!isDurationPicker && (
              <DateTimePickerModal
                testID="date_picker"
                isVisible={isDatePickerVisible}
                is24Hour={true}
                mode="time"
                date={
                  value && value?.length !== 0 ? new Date(value) : undefined
                }
                onConfirm={date => {
                  setIsDatePickerVisible(false);
                  if (datePickerProps?.maximumDate) {
                    if (
                      datePickerProps.maximumDate.getTime() < date.getTime()
                    ) {
                      onChange(new Date(datePickerProps.maximumDate));
                    } else {
                      onChange(date);
                    }
                  } else {
                    onChange(date);
                  }
                }}
                onCancel={() => {
                  setIsDatePickerVisible(false);
                }}
                {...datePickerProps}
              />
            )}
            {isDurationPicker && (
              <DurationPickerModal
                isVisible={isDatePickerVisible}
                onCancel={() => setIsDatePickerVisible(false)}
                value={fieldValue}
                valType={DURATION_PICKER_VAL_TYPE.TIMESTAMP}
                onConfirm={val => {
                  onChange(val);
                  setIsDatePickerVisible(false);
                }}
                {...durationPickerProps}
              />
            )}
          </>
        );
      }}
    />
  );
}
