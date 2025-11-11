import {SnackbarHandler} from '@components/Snackbar';
import {Strings} from '@locales/Localization';
import Sound from 'react-native-sound';

interface AudioQueueItem {
  path: string;
  callback?: () => void;
}

let sound: Sound | null;
let audioQueue: Array<AudioQueueItem> = [];
let isPlaying = false;
let currentPlayingPath: string | null = null;

export default function useAudioPlayer() {
  // For enable playing sound in silence mode (for ios)
  Sound.setCategory('Playback');

  const processAudioQueue = () => {
    if (audioQueue.length === 0 || isPlaying) {
      return;
    }

    const nextItem = audioQueue.shift();

    if (!nextItem) {
      return;
    }
    const {path, callback} = nextItem;

    currentPlayingPath = path;
    isPlaying = true;

    sound = new Sound(path, Sound.MAIN_BUNDLE, error => {
      if (error) {
        SnackbarHandler.errorToast(Strings.Not_able_to_play_audio_currently);
        isPlaying = false;
        currentPlayingPath = null;
        processAudioQueue();
        return;
      }
      sound?.play(() => {
        sound?.release();
        isPlaying = false;
        currentPlayingPath = null;
        callback?.();
        processAudioQueue();
      });
    });
  };

  const playAudio = (path: string, cb?: () => void) => {
    if (
      !audioQueue.some(item => item.path === path) &&
      currentPlayingPath !== path
    ) {
      audioQueue.push({path, callback: cb});
    }
    if (!isPlaying) {
      processAudioQueue();
    }
  };

  const pauseAudio = (cb?: () => void) => {
    sound?.pause(cb);
  };

  const stopAudio = (cb?: () => void) => {
    sound?.stop(() => {
      isPlaying = false;
      currentPlayingPath = null;
      cb?.();
      processAudioQueue();
    });
  };

  const clearAudio = () => {
    audioQueue = [];
    if (sound) {
      sound?.stop();
      sound?.release();
      sound = null;
    }
    isPlaying = false;
    currentPlayingPath = null;
  };

  return {playAudio, pauseAudio, stopAudio, clearAudio};
}
