// Not in use
import InputSelect from '@components/InputSelect';
import {Strings} from '@locales/Localization';
import useGetSettingConfigaQuery from '@modules/SettingsModule/Hooks/useGetSettingConfigQuery';
import {
  SettingFormValues,
  SettingStackParamList,
} from '@navigation/Types/CommonTypes';
import {NavigationProp, useNavigation} from '@react-navigation/native';
import {
  ENABLE_EARCONS_OPTIONS,
  SETTING_STACK_ROUTE_NAME,
} from '@utils/Constants';
import scaler from '@utils/Scaler';
import React, {FC, useEffect} from 'react';
import {useForm} from 'react-hook-form';
import {StyleSheet, Text, View} from 'react-native';

type OrvaPreferencesProps = {
  onPreferenceChange: (values: SettingFormValues) => void;
  setChangeDetected: (values: boolean) => void;
};

const OrvaPreferences: FC<OrvaPreferencesProps> = ({
  onPreferenceChange,
  setChangeDetected,
}) => {
  const {navigate} =
    useNavigation<
      NavigationProp<
        SettingStackParamList,
        SETTING_STACK_ROUTE_NAME.VOICE_OPTIMISATION
      >
    >();

  const {data: settingsDetail} = useGetSettingConfigaQuery();

  const {control, reset, watch} = useForm<SettingFormValues>({
    defaultValues: {
      time_format: '',
      enable_earcons: false,
    },
  });

  useEffect(() => {
    if (settingsDetail) {
      reset({
        time_format: settingsDetail?.timeFormat || '',
        enable_earcons: settingsDetail?.enableEarcons,
      });
    }
  }, [settingsDetail, reset]);

  useEffect(() => {
    const subscription = watch(values => {
      if (settingsDetail?.enableEarcons !== values.enable_earcons) {
        setChangeDetected(true);
      }
      onPreferenceChange(values);
    });
    return () => subscription.unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [watch, onPreferenceChange]);

  return (
    <View style={styles.container}>
      <Text style={styles.orva}>{Strings.Orva_Settings}</Text>

      <InputSelect
        control={control}
        options={ENABLE_EARCONS_OPTIONS}
        name="enable_earcons"
        label={Strings.Enable_Earcons}
        isGettingOptions={false}
        style={styles.earcon}
        placeholder={Strings.Enable_Earcons}
      />

      <Text style={styles.voice}>{Strings.Voice_Optimisation}</Text>
      <Text
        onPress={() => {
          navigate(SETTING_STACK_ROUTE_NAME.VOICE_OPTIMISATION);
        }}
        style={styles.voiceBtn}>
        {Strings.Optimize_Voice_Recognition}
      </Text>
    </View>
  );
};

export default OrvaPreferences;

const styles = StyleSheet.create({
  voice: {
    fontSize: scaler(16),
    fontWeight: '400',
    color: '#000000',
    marginTop: scaler(24),
  },
  voiceBtn: {
    fontSize: scaler(18),
    fontWeight: '400',
    color: '#000000',
    marginTop: scaler(24),
    textDecorationLine: 'underline',
  },
  time: {marginTop: scaler(28)},
  earcon: {marginTop: scaler(20)},
  orva: {
    fontSize: scaler(18),
    fontWeight: '700',
    lineHeight: scaler(24),
    color: '#000000',
  },
  container: {
    width: scaler(400),
    marginTop: scaler(24),
    marginLeft: scaler(24),
  },
});
