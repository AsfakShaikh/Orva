// Not in use
import React, {useEffect, useMemo, useState} from 'react';
import {View, Text, StyleSheet, TouchableOpacity, Alert} from 'react-native';
import AudioRecorderPlayer from 'react-native-audio-recorder-player';
import CustomButton from '@components/CustomButton';
import scaler from '@utils/Scaler';
import Images from '@assets/Images';
import RNFS from 'react-native-fs';
import CommonAlert from '@components/CommonAlert';
import {theme} from '@styles/Theme';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {Strings} from '@locales/Localization';

const {colors} = theme;
const audioRecorderPlayer = new AudioRecorderPlayer();

interface AudioPlayerProps {
  audioPath: string;
  handleSoundGood: () => void;
  setAudioPath: (path: string) => void;
  setRecordingActive: (active: boolean) => void;
  saveRecording: (key: string) => void;
  recordDuration?: number;
}

const AudioPlayerReview: React.FC<AudioPlayerProps> = ({
  audioPath,
  handleSoundGood,
  setAudioPath,
  setRecordingActive,
  saveRecording,
  recordDuration,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentPositionSec, setCurrentPositionSec] = useState(0);
  const [durationSec, setDurationSec] = useState<number>(0);
  const [isDeleteAlertVisible, setIsDeleteAlertVisible] = useState(false);

  const displayDurationVal = useMemo(() => {
    if (durationSec) {
      return durationSec;
    }

    return recordDuration ?? 0;
  }, [durationSec, recordDuration]);

  useEffect(() => {
    return () => {
      stopAudio();
    };
  }, []);

  const playAudio = async () => {
    try {
      await audioRecorderPlayer.startPlayer(audioPath);
      setIsPlaying(true);
      audioRecorderPlayer.addPlayBackListener(e => {
        setCurrentPositionSec(e.currentPosition);
        setDurationSec(e.duration);
        if (e.currentPosition === e.duration) {
          stopAudio();
        }
      });
    } catch (error) {
      console.error('Failed to play audio', error);
    }
  };

  const stopAudio = async () => {
    try {
      await audioRecorderPlayer.stopPlayer();
      audioRecorderPlayer.removePlayBackListener();
      setIsPlaying(false);
    } catch (error) {
      console.error('Failed to stop audio', error);
    }
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60000);
    const seconds = Math.floor((time % 60000) / 1000);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  const deleteRecording = () => {
    stopAudio(); // Stop the audio if playing
    setIsDeleteAlertVisible(true); // Show confirmation dialog
  };

  const handleFileCheck = async () => {
    try {
      const fileExists = await RNFS.exists(audioPath);
      if (fileExists) {
        await RNFS.unlink(audioPath); // Delete the audio file
      } else {
        Alert.alert('File does not exist');
      }

      // Reset the state to allow new recording
      // setRecordingStatus('ready');
      setAudioPath(''); // Clear audio path
      saveRecording('');
      setCurrentPositionSec(0); // Reset playback position
      setDurationSec(0); // Reset duration
      setRecordingActive(true); // Activate recording button or logic
    } catch (error) {
      console.error(error);
    }

    setIsDeleteAlertVisible(false); // Hide confirmation dialog
  };
  return (
    <View style={styles.container}>
      <View style={styles.audioControls}>
        <TouchableOpacity onPress={isPlaying ? stopAudio : playAudio}>
          <Icon
            name={isPlaying ? 'pause' : 'play'}
            size={scaler(30)}
            color={'#ffffff'}
          />
        </TouchableOpacity>

        <Text style={styles.timeText}>{formatTime(currentPositionSec)}</Text>

        <View style={styles.customSlider}>
          <View
            style={[
              styles.progress,
              {width: `${(currentPositionSec / durationSec) * 100}%`},
            ]}
          />
        </View>

        <Text style={styles.timeText}>{formatTime(displayDurationVal)}</Text>
      </View>

      <CustomButton
        buttonText={'Delete and Try Again'}
        buttonStyle={styles.outlined}
        onPress={deleteRecording}
        textStyle={styles.btnDeleteText}
        icon={<Images.DeleteRecording />}
      />
      <CustomButton
        buttonText={'Sounds good'}
        buttonStyle={styles.outlined}
        onPress={handleSoundGood}
        icon={<Images.SaveRecording />}
        textStyle={styles.btnText}
      />
      <CommonAlert
        headerTextAlign="left"
        visible={isDeleteAlertVisible}
        onDismiss={() => setIsDeleteAlertVisible(false)}
        heading={Strings.Delete_Recording}
        subHeading={Strings.Are_you_sure_you_want_to_delete_the_recording}
        buttonsArr={[
          {
            id: 1,
            title: 'Cancel',
            textColor: colors.error,
            onPress: () => setIsDeleteAlertVisible(false),
          },
          {
            id: 2,
            title: 'Delete',
            textColor: colors.error,
            onPress: () => {
              handleFileCheck();
            },
          },
        ]}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    display: 'flex',
    flexDirection: 'row',
    gap: scaler(10),
  },
  audioControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: scaler(350),
    backgroundColor: '#000',
    paddingHorizontal: scaler(10),
    borderRadius: scaler(10),
  },
  playButtonText: {
    color: '#000',
    fontSize: scaler(14),
  },
  timeText: {
    fontSize: scaler(12),
    color: '#fff',
  },
  customSlider: {
    flex: 1,
    height: scaler(8),
    backgroundColor: '#fff',
    borderRadius: scaler(5),
    marginHorizontal: scaler(10),
    overflow: 'hidden',
  },
  progress: {
    height: '100%',
    backgroundColor: 'gray',
  },
  outlined: {
    color: '#64568e',
    gap: scaler(24),
    justifyContent: 'center',
    alignItems: 'center',
    width: scaler(200),
    borderRadius: scaler(30),
    paddingVertical: scaler(12),
    paddingHorizontal: scaler(20),
    borderWidth: scaler(1),
    borderColor: 'gray',
  },
  btnText: {
    color: '#007A02',
    fontSize: scaler(14),
    fontWeight: '500',
  },
  btnDeleteText: {
    color: '#B3261E',
    fontSize: scaler(14),
    fontWeight: '500',
  },
});

export default AudioPlayerReview;
