// Not in use
import InputText from '@components/InputText';
import scaler from '@utils/Scaler';
import React, {Dispatch, FC, SetStateAction, useEffect} from 'react';
import {useForm} from 'react-hook-form';
import {StyleSheet, Text, View} from 'react-native';
import ToggleButton from './ToggleButton';
import {Strings} from '@locales/Localization';
import {getPhoneNumberValidationRules} from '@helpers/formValidationRules';
import {theme} from '@styles/Theme';
import CountryCodeSelectInput from '@components/CountryCodeSelectInput';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import useGetNotificationPrefQuery from '../Hooks/useGetNotificationPrefQuery';

type NotificationsProps = {
  onPreferenceChange?: (val: any) => void;
  setChangeDetected?: Dispatch<SetStateAction<boolean>>;
};

const Notifications: FC<NotificationsProps> = ({
  onPreferenceChange,
  setChangeDetected,
}) => {
  const {top} = useSafeAreaInsets();

  const {data: notificationDetails} = useGetNotificationPrefQuery();

  const {control, watch, reset, setValue, getValues} = useForm({
    defaultValues: {
      countryCode: '',
      phoneNumber: '',
      turnoverTimeToggle: false,
      firstCaseTimeToggle: false,
    },
  });

  useEffect(() => {
    if (notificationDetails) {
      reset({
        countryCode: notificationDetails?.countryCode ?? '',
        phoneNumber: notificationDetails?.phoneNumber ?? '',
        turnoverTimeToggle: notificationDetails?.turnoverTimeToggle ?? false,
        firstCaseTimeToggle: notificationDetails?.firstCaseTimeToggle ?? false,
      });
    }
  }, [notificationDetails, reset]);

  useEffect(() => {
    const subscription = watch(values => {
      if (
        notificationDetails?.turnoverTimeToggle !== values.turnoverTimeToggle ||
        notificationDetails?.firstCaseTimeToggle !==
          values.firstCaseTimeToggle ||
        notificationDetails?.countryCode !== values.countryCode ||
        notificationDetails?.phoneNumber !== values.phoneNumber
      ) {
        setChangeDetected?.(true);
      }
      onPreferenceChange?.(values);
    });
    return () => subscription.unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [watch, onPreferenceChange]);

  return (
    <View style={styles.container}>
      <Text style={styles.sms}>{Strings.SMS_Notification_Settings}</Text>

      <View style={{flexDirection: 'row', width: '50%'}}>
        <CountryCodeSelectInput
          name="countryCode"
          control={control}
          style={styles.input}
          label={Strings.Int_Code}
          menuContainerWidth={scaler(368)}
          contentStyle={{marginTop: top + scaler(8)}}
        />
        <InputText
          name="phoneNumber"
          keyboardType="numeric"
          control={control}
          style={[styles.input, styles.input2]}
          label={Strings.Recipient_Mobile_Number}
          maxLength={20}
          rules={getPhoneNumberValidationRules(watch('countryCode'))}
        />
      </View>

      <View style={styles.rowView}>
        <Text style={styles.text}>{Strings.Notify_when_Turnover}</Text>
        <ToggleButton
          value={getValues('turnoverTimeToggle')}
          onValueChange={val => setValue('turnoverTimeToggle', val)}
          contentStyle={styles.toggleContainer}
        />
      </View>

      <View style={styles.rowView}>
        <Text style={styles.text}>{Strings.Notify_when_First}</Text>
        <ToggleButton
          value={getValues('firstCaseTimeToggle')}
          onValueChange={val => setValue('firstCaseTimeToggle', val)}
          contentStyle={styles.toggleContainer}
        />
      </View>
    </View>
  );
};

export default Notifications;
const {colors} = theme;
const styles = StyleSheet.create({
  container: {marginTop: scaler(24), marginLeft: scaler(24)},
  sms: {
    fontSize: scaler(18),
    fontWeight: '700',
    lineHeight: scaler(24),
    color: colors.foreground.primary,
    marginBottom: scaler(24),
  },
  input: {
    fontSize: scaler(16),
    color: colors.foreground.primary,
    width: scaler(140),
  },
  input2: {
    flex: 1,
    width: '100%',
    marginLeft: scaler(24),
  },
  toggleContainer: {
    height: scaler(32),
    width: scaler(56),
    borderRadius: 10,
    borderColor: '#79747E',
  },
  rowView: {
    width: '50%',
    marginTop: scaler(24),
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  text: {
    fontSize: scaler(16),
    fontWeight: '400',
    color: '#000000',
    lineHeight: scaler(20),
  },
});
