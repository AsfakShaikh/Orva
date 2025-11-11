// Not in use
import Images from '@assets/Images';
import StepWizard from '@components/StepWizard';
import {theme} from '@styles/Theme';
import {
  recordingStepsContent,
  SETTING_STACK_ROUTE_NAME,
  VoiceCommandLabels,
  VoiceCommandSubLabels,
} from '@utils/Constants';
import scaler from '@utils/Scaler';
import React, {useEffect, useState} from 'react';
import {View, StyleSheet, Text} from 'react-native';
import {IconButton} from 'react-native-paper';
import RecordingComponent from './AudioPlay';
import AudioPlayerReview from './ReviewRecording';
import {globalStyles} from '@styles/GlobalStyles';
import {Strings} from '@locales/Localization';
import useSaveVoiceConfigaQuery from '@modules/AuthModule/Hooks/useSaveVoice';
import {fetcher} from '@utils/Axios';
import {NavigationProp, useNavigation} from '@react-navigation/native';
import {SettingStackParamList} from '@navigation/Types/CommonTypes';
interface PropsType {
  nativeLanguage: string;
  deviceType: string;
}
const VoiceRecord: React.FC<PropsType> = ({nativeLanguage, deviceType}) => {
  const [currentPosition, setCurrentPosition] = useState<number>(1);
  const [currentVoicePosition, setCurrentVoicePosition] = useState<number>(0);
  const [recordingActive, setRecordingActive] = useState<boolean>(true);
  const [recordDuration, setRecordDuration] = useState<number>(0);

  const [recordingStatus, setRecordingStatus] = useState<string>('ready');
  const [audioPath, setAudioPath] = useState<string>('ready');
  const [publicIP, setPublicIP] = useState<string>('');

  const totalSteps: number = 4;
  const {colors} = theme;
  const {mutate: saveVoiceConfig} = useSaveVoiceConfigaQuery();

  const {navigate} =
    useNavigation<
      NavigationProp<SettingStackParamList, SETTING_STACK_ROUTE_NAME.SETTINGS>
    >();
  useEffect(() => {
    getUserIp();
  }, []);
  const getUserIp = async () => {
    const {data} = await fetcher({
      url: 'https://api.ipify.org?format=json',
    });
    setPublicIP(data.ip);
  };
  const onStepChange = (activeStep: number = 0) => {
    if (currentPosition <= 6 || activeStep > 0) {
      setCurrentPosition(activeStep ?? currentPosition + 1);
    }
  };
  const getTitle = (status: string) => {
    if (status === 'ready') {
      return Strings.How_it_works;
    } else if (
      (status === 'start' || status === 'complete') &&
      currentPosition > 0
    ) {
      return recordingStepsContent[currentPosition - 1].title;
    } else if (
      ['start', 'complete'].includes(status) &&
      currentPosition > 0 &&
      currentPosition <= 6
    ) {
      return recordingStepsContent[currentPosition - 1].title;
    }
  };
  const subTitle = (function () {
    if (recordingStatus === 'complete' && audioPath) {
      return Strings.Review;
    }
  })();

  const handleSoundGood = () => {
    if (currentVoicePosition === 4 && currentPosition < 3) {
      setCurrentVoicePosition(currentPosition === 1 ? 0 : 4);
      setCurrentPosition(currentPosition + 1);
    } else {
      setCurrentVoicePosition(currentVoicePosition + 1);
    }
    saveRecording();
    setAudioPath('');
    setRecordingActive(true);
  };
  const saveRecording = async () => {
    const isFinalUpload = currentPosition === 2 && currentVoicePosition === 4;
    const payload = {
      nativeLanguage: nativeLanguage,
      deviceType: deviceType,
      intent: currentPosition === 1 ? 'hey_orva' : 'Okay Orva',
      ipAddress: publicIP,
      isFinalUpload: isFinalUpload,
      file: audioPath,
    };
    saveVoiceConfig(payload);
    if (isFinalUpload) {
      await fetcher({
        url: 'user/voice-training/initiate',
      });
    }
  };
  const onDone = () => {
    setCurrentPosition(1);
    setCurrentVoicePosition(0);
    navigate(SETTING_STACK_ROUTE_NAME.SETTINGS);
  };
  return (
    <View style={styles.container}>
      <StepWizard
        subLabels={VoiceCommandSubLabels}
        customStyle={{left: scaler(0), lineWidth: scaler(150)}}
        labels={VoiceCommandLabels}
        currentPosition={currentPosition}
        stepCount={totalSteps}
        onStepChange={onStepChange}
      />
      {recordingStatus === 'ready' && (
        <IconButton
          style={styles.iconButton}
          mode="contained"
          containerColor={colors.background.inverse}
          icon="dots-horizontal-circle-outline"
          iconColor={colors.foreground.inverted}
          size={scaler(60)}
          onPress={() => true}
        />
      )}
      {recordingStatus === 'start' && (
        <Images.OnRecording width={scaler(96)} fill="white" />
      )}
      {recordingStatus === 'complete' && (
        <Images.OnComplete width={scaler(96)} fill="white" />
      )}

      <View style={[globalStyles.center, {gap: scaler(16)}]}>
        <Text style={styles.title}>{getTitle(recordingStatus)}</Text>
        {recordingStatus === 'ready' && (
          <>
            <Text style={styles.description}>{Strings.Lets_train_Orva}</Text>
            <Text style={styles.description}>
              {Strings.To_help_ensure_accurate_training}
            </Text>
          </>
        )}

        {currentVoicePosition > 0 &&
          currentVoicePosition < 4 &&
          recordingActive &&
          recordingStatus === 'complete' && (
            <Text style={styles.reviewSubTitle}>{Strings.Great}</Text>
          )}
        {currentPosition === 3 && (
          <Text style={styles.reviewSubTitle}>{Strings.Thank}</Text>
        )}
      </View>

      {subTitle && <Text style={styles.reviewSubTitle}>{subTitle}</Text>}
      {recordingStatus === 'complete' && !!audioPath && (
        <AudioPlayerReview
          audioPath={audioPath}
          handleSoundGood={handleSoundGood}
          setAudioPath={setAudioPath}
          setRecordingActive={setRecordingActive}
          saveRecording={saveRecording}
          recordDuration={recordDuration}
        />
      )}
      <RecordingComponent
        setRecordingStatus={setRecordingStatus}
        status={recordingStatus}
        setAudioPath={setAudioPath}
        currentVoicePosition={currentVoicePosition}
        setRecordingActive={setRecordingActive}
        recordingActive={recordingActive}
        currentPosition={currentPosition}
        onDone={onDone}
        setRecordDuration={setRecordDuration}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {gap: scaler(24), alignItems: 'center', paddingTop: scaler(10)},
  iconButton: {
    height: scaler(96),
    width: scaler(96),
    margin: 0,
    borderRadius: scaler(28),
  },
  title: {
    color: '#000',
    fontFamily: 'Inter',
    fontWeight: '700',
    fontSize: scaler(32),
  },
  description: {
    color: '#000',
    fontFamily: 'Inter',
    fontWeight: '400',
    fontSize: scaler(18),
    textAlign: 'center',
    fontStyle: 'normal',
    lineHeight: scaler(30),
  },
  reviewSubTitle: {
    color: '#000',
    textAlign: 'center',
    width: scaler(400),
  },
});

export default VoiceRecord;
