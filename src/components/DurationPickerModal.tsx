import React, {FC, useState} from 'react';
import Modal from './Modal';
import {StyleSheet, TextInput, TextInputProps, View} from 'react-native';
import {theme} from '@styles/Theme';
import scaler from '@utils/Scaler';
import {Text} from 'react-native-paper';
import {Strings} from '@locales/Localization';
import Button from './Button';
import secondsToDuration from '@helpers/secondsToDuration';
import {defaultDuration} from '@utils/Constants';
import durationToSeconds from '@helpers/durationToSeconds';
import durationToTimestamp from '@helpers/durationToTimestamp';
import {DATE_TYPE} from '@utils/Types';
import timestampToDuration from '@helpers/timestampToDuration';
const {colors} = theme;

export enum DURATION_PICKER_VAL_TYPE {
  SECONDS = 'SECONDS',
  TIMESTAMP = 'TIMESTAMP',
}

export type DurationPickerModalProps = {
  isVisible?: boolean;
  onCancel?: () => void;
  onConfirm?: (val?: string | Date | null) => void;
  textInputProps?: TextInputProps;
  value?: DATE_TYPE;
  valType?: DURATION_PICKER_VAL_TYPE;
  enableSeconds?: boolean;
};

export interface DURATION {
  hours: string | number;
  mins: string | number;
  secs: string | number;
}

const DurationPickerModal: FC<DurationPickerModalProps> = ({
  isVisible,
  onCancel,
  onConfirm,
  textInputProps,
  value,
  valType = DURATION_PICKER_VAL_TYPE.SECONDS,
  enableSeconds,
}) => {
  const [focusedInput, setFocusedInput] = useState<string | null>();

  const isTimestampVal = valType === DURATION_PICKER_VAL_TYPE.TIMESTAMP;

  const isHourFocused = focusedInput === 'HOUR';
  const isMinFocused = focusedInput === 'MIN';
  const isSecFocused = focusedInput === 'SEC';

  const [durationData, setDurationData] = useState<DURATION>(
    isTimestampVal
      ? timestampToDuration(value as string)
      : secondsToDuration(value as string),
  );

  const handleCancel = () => {
    setDurationData(defaultDuration);
    setFocusedInput(null);
    onCancel?.();
  };

  const validateAndSetValue = (val: string, field: keyof DURATION) => {
    const numValue = parseInt(val, 10);

    // Allow empty string for better UX
    if (val === '') {
      setDurationData(prev => ({
        ...prev,
        [field]: val,
      }));
      return;
    }

    // Validate based on field type
    let maxValue = isTimestampVal ? 24 : 99;
    if (field === 'mins' || field === 'secs') {
      maxValue = isTimestampVal ? 59 : 60;
    }

    // Only update if value is within valid range
    if (!isNaN(numValue) && numValue >= 0 && numValue <= maxValue) {
      setDurationData(prev => ({
        ...prev,
        [field]: val,
      }));
    }
  };

  return (
    <Modal visible={isVisible} onBackdropPress={handleCancel}>
      <View style={styles.container}>
        <Text style={styles.header}>{Strings.Enter_time}</Text>

        {/* Text Input container */}
        <View style={styles.textInputContainer}>
          <View>
            <TextInput
              keyboardType="numeric"
              value={durationData?.hours.toString()}
              onChangeText={val => validateAndSetValue(val, 'hours')}
              maxLength={2}
              textAlign="center"
              verticalAlign="middle"
              cursorColor={colors.border.brand}
              placeholder="00"
              {...textInputProps}
              onFocus={() => setFocusedInput('HOUR')}
              onBlur={() => setFocusedInput(null)}
              style={[
                styles.input,
                isHourFocused ? styles.focusedInput : styles.blurInput,
              ]}
            />
            <Text style={styles.label}>{Strings.Hour}</Text>
          </View>

          <Text style={{fontSize: scaler(56), lineHeight: scaler(68)}}>:</Text>

          <View>
            <TextInput
              keyboardType="numeric"
              value={durationData?.mins.toString()}
              onChangeText={val => validateAndSetValue(val, 'mins')}
              maxLength={2}
              textAlign="center"
              verticalAlign="middle"
              cursorColor={colors.border.brand}
              placeholder="00"
              {...textInputProps}
              onFocus={() => setFocusedInput('MIN')}
              onBlur={() => setFocusedInput(null)}
              style={[
                styles.input,
                isMinFocused ? styles.focusedInput : styles.blurInput,
              ]}
            />
            <Text style={styles.label}>{Strings.Minute}</Text>
          </View>

          {enableSeconds && (
            <>
              <Text style={{fontSize: scaler(56), lineHeight: scaler(68)}}>
                :
              </Text>
              <View>
                <TextInput
                  keyboardType="numeric"
                  value={durationData?.secs.toString()}
                  onChangeText={val => validateAndSetValue(val, 'secs')}
                  maxLength={2}
                  textAlign="center"
                  verticalAlign="middle"
                  cursorColor={colors.border.brand}
                  placeholder="00"
                  {...textInputProps}
                  onFocus={() => setFocusedInput('SEC')}
                  onBlur={() => setFocusedInput(null)}
                  style={[
                    styles.input,
                    isSecFocused ? styles.focusedInput : styles.blurInput,
                  ]}
                />
                <Text style={styles.label}>{Strings.Second}</Text>
              </View>
            </>
          )}
        </View>

        {/* Button Input container */}
        <View style={styles.buttonContainer}>
          <Button
            onPress={handleCancel}
            contentStyle={{height: scaler(36)}}
            style={{borderRadius: scaler(4)}}
            textColor={colors.background.brand}
            uppercase>
            {Strings.Cancel}
          </Button>
          <Button
            onPress={() =>
              onConfirm?.(
                isTimestampVal
                  ? durationToTimestamp(durationData)
                  : durationToSeconds(durationData),
              )
            }
            contentStyle={{height: scaler(36)}}
            style={{borderRadius: scaler(4)}}
            textColor={colors.background.brand}
            uppercase>
            {Strings.Ok}
          </Button>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.background.primary,
    borderRadius: scaler(4),
    padding: scaler(24),
    paddingBottom: scaler(16),
  },
  header: {
    textTransform: 'uppercase',
    fontSize: scaler(12),
    fontWeight: '500',
    letterSpacing: scaler(1.5),
  },
  textInputContainer: {
    flexDirection: 'row',
    gap: scaler(12),
    marginVertical: scaler(24),
    marginHorizontal: scaler(36),
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: scaler(8),
    justifyContent: 'flex-end',
  },
  label: {
    fontSize: scaler(12),
    marginTop: scaler(6),
    color: colors.foreground.secondary,
  },
  input: {
    fontSize: scaler(56),
    lineHeight: scaler(64),
    paddingVertical: 0,
    height: scaler(80),
    width: scaler(96),
    borderRadius: scaler(4),
    borderWidth: scaler(2),
  },
  focusedInput: {
    backgroundColor: 'transparent',
    borderColor: colors.border.brand,
  },
  blurInput: {
    backgroundColor: colors.background.inactive,
    borderColor: colors.border.subtle,
  },
});

export default DurationPickerModal;
