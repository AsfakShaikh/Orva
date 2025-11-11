// Not in use
import Button from '@components/Button';
import StepWizard from '@components/StepWizard';
import {SettingStackParamList} from '@navigation/Types/CommonTypes';
import {NavigationProp, useNavigation} from '@react-navigation/native';
import {globalStyles} from '@styles/GlobalStyles';
import {SETTING_STACK_ROUTE_NAME} from '@utils/Constants';
import scaler from '@utils/Scaler';
import React, {Dispatch, SetStateAction, useState} from 'react';
import {StyleSheet, View} from 'react-native';
import AudioRecorderPlayer from 'react-native-audio-recorder-player';

interface RecordingProps {
  status: string;
  currentVoicePosition: number;
  recordingActive: boolean;
  currentPosition: number;
  setRecordingStatus: (status: string) => void;
  setAudioPath: (path: string) => void;
  setRecordingActive: (active: boolean) => void;
  onDone: () => void;
  setRecordDuration?: Dispatch<SetStateAction<number>>;
}

const audioRecorderPlayer = new AudioRecorderPlayer();

const RecordingComponent: React.FC<RecordingProps> = ({
  status,
  recordingActive,
  setAudioPath,
  setRecordingStatus,
  currentVoicePosition,
  setRecordingActive,
  currentPosition,
  onDone,
  setRecordDuration,
}) => {
  const [isRecording, setIsRecording] = useState<boolean>();

  const {navigate} =
    useNavigation<
      NavigationProp<SettingStackParamList, SETTING_STACK_ROUTE_NAME.SETTINGS>
    >();
  const totalSteps: number = 5;
  const startRecording = async () => {
    if (!isRecording) {
      try {
        await audioRecorderPlayer.startRecorder();
        audioRecorderPlayer.addRecordBackListener(e => {
          setRecordDuration?.(e.currentPosition);
        });
        setIsRecording(true);
        setRecordingActive(true);
      } catch (err) {
        // Handle error gracefully if needed
      }
    }
  };

  const stopRecording = async () => {
    if (isRecording) {
      try {
        const result = await audioRecorderPlayer.stopRecorder();
        audioRecorderPlayer.removeRecordBackListener();
        setIsRecording(false);
        if (result?.includes('file://')) {
          setAudioPath(result);
        }
      } catch (err) {
        // Handle error gracefully if needed
      }
    }
  };

  const handleRecording = () => {
    if (status === 'ready' || status === 'complete') {
      setRecordingStatus('start');
      startRecording();
    } else if (status === 'start') {
      stopRecording();
      setRecordingActive(false);
      setRecordingStatus('complete');
    } else {
      setRecordingStatus('ready');
    }
  };

  return (
    <View style={[globalStyles.center, {gap: scaler(24)}]}>
      <StepWizard
        customStyle={{left: scaler(0), lineWidth: scaler(70)}}
        labels={[]}
        currentPosition={currentVoicePosition}
        stepCount={totalSteps}
      />

      <View style={[globalStyles.center, {gap: scaler(16)}]}>
        {recordingActive && currentPosition < 3 && (
          <Button
            mode={status === 'start' ? 'outlined' : 'contained'}
            style={styles.commonBtn}
            onPress={handleRecording}>
            {status === 'start' ? 'Stop Recording' : 'Start Recording'}
          </Button>
        )}
        {currentPosition === 3 ? (
          <Button mode={'contained'} style={styles.commonBtn} onPress={onDone}>
            Done
          </Button>
        ) : (
          <Button
            onPress={() => navigate(SETTING_STACK_ROUTE_NAME.SETTINGS)}
            style={styles.commonBtn}>
            {currentVoicePosition > 0 ? 'Save and Exit' : 'Cancel'}
          </Button>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  commonBtn: {
    width: scaler(320),
  },
});

export default RecordingComponent;
