import React, {useState} from 'react';
import {TouchableOpacity, View} from 'react-native';
import {Control, Controller, RegisterOptions} from 'react-hook-form';
import {HelperText, TextInput} from 'react-native-paper';
import {
  DatePickerModal,
  en,
  registerTranslation,
} from 'react-native-paper-dates';
import {format, startOfToday} from 'date-fns';
import {translate} from '@helpers/translate';

registerTranslation('en', en);

type InputCalendarProps = Readonly<{
  control: Control<any>;
  name: string;
  label: string;
  style?: any;
  rules?: Omit<
    RegisterOptions<any, string>,
    'disabled' | 'setValueAs' | 'valueAsNumber' | 'valueAsDate'
  >;
  disableFutureDates?: boolean;
}>;

export default function InputCalendar({
  control,
  name,
  label,
  style,
  rules,
  disableFutureDates = false,
}: InputCalendarProps) {
  const [visible, setVisible] = useState(false);

  const handlePress = () => setVisible(true);

  const validRange = disableFutureDates
    ? {
        endDate: startOfToday(),
      }
    : undefined;

  return (
    <Controller
      control={control}
      name={name}
      rules={rules}
      render={({field: {value, onChange}, fieldState}) => {
        const errorMessage = fieldState?.error?.message;

        return (
          <View style={style}>
            <TouchableOpacity onPress={handlePress} activeOpacity={0.7}>
              <View pointerEvents="none">
                <TextInput
                  mode="outlined"
                  label={label}
                  value={value ? format(new Date(value), 'dd-MM-yyyy') : ''}
                  editable={false}
                  // eslint-disable-next-line react-native/no-inline-styles
                  style={{backgroundColor: 'transparent'}}
                  right={
                    <TextInput.Icon
                      icon="calendar"
                      onPress={() => setVisible(true)}
                    />
                  }
                  onPressIn={() => setVisible(true)}
                />
                {!!errorMessage && (
                  <HelperText type="error" visible={!!errorMessage}>
                    {translate(errorMessage)}
                  </HelperText>
                )}
              </View>
            </TouchableOpacity>
            <DatePickerModal
              animationType="fade"
              locale="en"
              mode="single"
              allowEditing={false}
              visible={visible}
              onDismiss={() => setVisible(false)}
              date={value ? new Date(value) : undefined}
              onChange={params => {
                if (params.date) {
                  onChange(params.date.toISOString());
                  setVisible(false);
                }
              }}
              presentationStyle="pageSheet"
              inputEnabled={false}
              saveLabelDisabled={true}
              validRange={validRange}
              onConfirm={params => {
                if (params.date) {
                  onChange(params.date.toISOString());
                  setVisible(false);
                }
              }}
            />
          </View>
        );
      }}
    />
  );
}
