// Not in use
import Button from '@components/Button';
import Container from '@components/Container';
import {
  SettingFormValues,
  SettingStackParamList,
} from '@navigation/Types/CommonTypes';
import {NavigationProp, useNavigation} from '@react-navigation/native';
import InputSection from '@screens/settings/inputSection';
import VoiceRecord from '@screens/VoiceRecord';
import {theme} from '@styles/Theme';
import {SETTING_STACK_ROUTE_NAME} from '@utils/Constants';
import scaler from '@utils/Scaler';
import React, {useState} from 'react';
import {SubmitHandler, useForm} from 'react-hook-form';
import {StyleSheet, Text, View} from 'react-native';
import {IconButton} from 'react-native-paper';

export default function VoiceOptimisation() {
  const [isRecording, setIsRecording] = useState<boolean>(false);

  const {colors} = theme;
  const {control, handleSubmit, watch} = useForm<SettingFormValues>({
    defaultValues: {
      native_language: '',
      device_type: '',
    },
  });
  const [nativeLanguage, deviceType] = watch([
    'native_language',
    'device_type',
  ]);
  const isButtonDisabled = !nativeLanguage || !deviceType;

  const onSubmit: SubmitHandler<SettingFormValues> = () => {
    setIsRecording(true);
  };

  const {navigate} =
    useNavigation<
      NavigationProp<SettingStackParamList, SETTING_STACK_ROUTE_NAME.SETTINGS>
    >();
  return (
    <Container
      statusBarStyle="light-content"
      backgroundColor={colors.background.secondary}>
      {!isRecording ? (
        <View style={styles.mainContainer}>
          <IconButton
            style={styles.iconButton}
            mode="contained"
            containerColor={colors.background.inverse}
            icon="dots-horizontal-circle-outline"
            iconColor={colors.foreground.inverted}
            size={scaler(42)}
            onPress={() => console.log('Pressed')}
          />
          <Text style={styles.title}>Optimise ORVA for Your Voice</Text>
          <Text style={styles.description}>
            This will help ORVA to recognize and understand your voice and
            accent more effectively.
          </Text>
          <InputSection control={control} />
          <Button
            onPress={() => !isButtonDisabled && handleSubmit(onSubmit)()}
            disabled={isButtonDisabled}
            style={styles.commonBtn}
            mode="contained">
            Continue
          </Button>
          <Button
            onPress={() => navigate(SETTING_STACK_ROUTE_NAME.SETTINGS)}
            style={styles.commonBtn}>
            Cancel
          </Button>
        </View>
      ) : (
        <VoiceRecord
          nativeLanguage={nativeLanguage as string}
          deviceType={deviceType as string}
        />
      )}
    </Container>
  );
}

const styles = StyleSheet.create({
  commonBtn: {
    width: '25%',
  },
  mainContainer: {
    display: 'flex',
    alignItems: 'center',
    flexDirection: 'column',
    gap: scaler(30),
    paddingTop: scaler(64),
    alignSelf: 'stretch',
  },
  iconButton: {
    height: scaler(56),
    width: scaler(56),
    borderRadius: scaler(16),
    margin: 0,
    marginRight: scaler(16),
  },
  title: {
    color: '#000',
    fontFamily: 'Inter',
    fontWeight: '700',
    fontSize: scaler(32),
    fontStyle: 'normal',
    lineHeight: scaler(38),
  },
  description: {
    color: '#000',
    fontFamily: 'Inter',
    fontWeight: '400',
    fontSize: scaler(24),
    fontStyle: 'normal',
    lineHeight: scaler(30),
    width: scaler(572),
  },
});
