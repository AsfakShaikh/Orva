import React, {useState, useEffect, useCallback} from 'react';
import {View, StyleSheet, Text} from 'react-native';
import UserFav from '../../../components/UserFav';
import scaler from '@utils/Scaler';
import useEventEmitter, {emitEvent} from '@hooks/useEventEmitter';
import {Strings} from '@locales/Localization';
import {fireSetStausEvent} from '@navigation/DrawerNavigation/HomeDrawerNavigation';
import {
  CASE_NOTE_INTENT_EVENT,
  DISPLAY_INFO_PANEL_STATUS,
  VOICE_COMAND_STATUS,
  VOICE_INETENT_EVENT,
  VOICE_INTENT,
  VOICE_INTRACTION_PANEL_MODE,
  VOICE_INTRACTION_PANEL_INTENT_EVENT,
  ORVA_STATUS_EVENT,
  VOICE_INTRACTION_PANEL_INTENTS,
} from '@modules/VoiceComandModule/Types/CommonTypes';
import {
  fireVoiceNoteCapturedEvent,
  fireVoiceNoteProcessingEvent,
} from '../../TrackerModule/Components/VoiceNotesList';
import SpeechDetection from '@nativeModules/SpeechDetection';
import {DATE_TYPE} from '@utils/Types';
import {theme} from '@styles/Theme';
import {fireTimerActionCapturedEvent} from '../../TrackerModule/Components/TimersList';
import BottomSheet from '@components/BottomSheet';
import {globalStyles} from '@styles/GlobalStyles';
import {Icon, IconButton} from 'react-native-paper';
import VoiceHorizontalWave from './VoiceHorizontalWave';
import LabeledAvatar from '@components/LabeledAvatar';
import SignalBar from '@components/SignalBar';
import {TIMERS_ACTIONS_INTENT_ARRAY} from '@modules/TrackerModule/Types/CommonTypes';
import {STATUS} from '@utils/Constants';
import {fireSendSmsCapturedEvent} from '@modules/TrackerModule/Components/SendSmsDrawer';

const {colors} = theme;

type DisplayInfoPanelData = {
  title?: string | null;
  description?: string | null;
  type?: DISPLAY_INFO_PANEL_STATUS;
  time?: DATE_TYPE;
};

export type VoiceIntractionPanelProps =
  | {
      isVisible: true;
      mode: VOICE_INTRACTION_PANEL_MODE;
      data?: DisplayInfoPanelData;
    }
  | {
      isVisible?: false;
      mode?: VOICE_INTRACTION_PANEL_MODE;
      data?: DisplayInfoPanelData;
    };

const VOICE_INTRACTION_PANEL_EVENT = 'VOICE_INTACTION_PANEL_EVENT';

export const toggleVoiceIntractionPanel = (
  payload: VoiceIntractionPanelProps,
) => {
  emitEvent(VOICE_INTRACTION_PANEL_EVENT, payload);
};

const initialCaseNoteStatus = {
  isCaseNoteProcessing: false,
  isCaseNoteCompleted: false,
  isCaseNoteCanceled: false,
};

const VoiceIntractionPanel = () => {
  const [isPanelVisible, setIsPanelVisible] = useState(false);
  const [voiceTranscription, setVoiceTranscription] = useState<string>(
    Strings.Voce_Note_Panel_Placeholder,
  );
  const [caseNoteStatus, setCaseNoteStatus] = useState(initialCaseNoteStatus);
  const [panelMode, setPanelMode] = useState<VOICE_INTRACTION_PANEL_MODE>(
    VOICE_INTRACTION_PANEL_MODE.TRANSCRIPTION,
  );
  const [panelDisplayData, setPanelDisplayData] =
    useState<DisplayInfoPanelData | null>(null);

  const [voiceIntent, setVoiceIntent] = useState<VOICE_INTENT | null>(null);
  const [orvaStatus, setOrvaStatus] = useState<VOICE_COMAND_STATUS>(
    VOICE_COMAND_STATUS.DEFAULT,
  );

  const {isCaseNoteProcessing, isCaseNoteCompleted, isCaseNoteCanceled} =
    caseNoteStatus ?? {};

  // Used to handle the voice note panel event
  const onPanelDetailsChange = useCallback(
    (payload?: VoiceIntractionPanelProps) => {
      const {isVisible, mode, data} = payload ?? {};

      setPanelMode(prev => mode ?? prev);
      setPanelDisplayData(data ?? null);

      if (isVisible !== undefined) {
        setIsPanelVisible(isVisible);
      }

      if (isVisible) {
        setVoiceTranscription(Strings.Voce_Note_Panel_Placeholder);
        setCaseNoteStatus(initialCaseNoteStatus);
        setVoiceIntent(null);
      }
    },
    [],
  );

  // Used to handle the voice transcription & case note intent event
  const handleCaseNoteIntentEvent = useCallback(
    (data?: {
      caseIntentData?: string;
      isCaseNoteCompleted?: boolean;
      isCaseNoteInitiated?: boolean;
      isCaseNoteCanceled?: boolean;
      isCaseNoteProcessing?: boolean;
    }) => {
      const {
        caseIntentData,
        isCaseNoteProcessing: caseNoteProcessing = false,
        ...rest
      } = data ?? {};

      if (caseIntentData) {
        setVoiceTranscription(caseIntentData);
      } else {
        setCaseNoteStatus(prev => ({
          ...prev,
          ...rest,
          isCaseNoteProcessing: rest?.isCaseNoteCanceled
            ? false
            : caseNoteProcessing,
        }));
      }
    },
    [],
  );

  // Used to handle the voice panel intent event
  const handleVoiceIntractionPanelIntentEvent = useCallback(
    (data?: {transcription?: string; isSilenceDetected?: boolean}) => {
      const {transcription, isSilenceDetected = false} = data ?? {};
      if (transcription) {
        setVoiceTranscription(transcription);
      }
      if (isSilenceDetected) {
        setPanelMode(VOICE_INTRACTION_PANEL_MODE.PROCESSING);
      }
    },
    [],
  );

  // Used to handle the voice intent event
  const handleVoiceIntentEvent = useCallback(
    (vIntent: VOICE_INTENT) => {
      if (!vIntent || vIntent === VOICE_INTENT.UNKNOWN) {
        onPanelDetailsChange({isVisible: false});
      } else {
        setVoiceIntent(vIntent);
      }
    },
    [onPanelDetailsChange],
  );

  const fireVoiceIntentError = useCallback(
    (isShowPanel?: boolean) => {
      if (!isShowPanel) {
        onPanelDetailsChange({isVisible: false});
        return;
      }
      onPanelDetailsChange({
        isVisible: true,
        mode: VOICE_INTRACTION_PANEL_MODE.DISPLAY_INFO,
        data: {
          title: Strings.Intent_Processing_Error,
          type: DISPLAY_INFO_PANEL_STATUS.ERROR,
        },
      });
    },
    [onPanelDetailsChange],
  );

  useEventEmitter(VOICE_INTRACTION_PANEL_EVENT, onPanelDetailsChange);
  useEventEmitter(CASE_NOTE_INTENT_EVENT, handleCaseNoteIntentEvent);
  useEventEmitter(
    VOICE_INTRACTION_PANEL_INTENT_EVENT,
    handleVoiceIntractionPanelIntentEvent,
  );
  useEventEmitter(VOICE_INETENT_EVENT, handleVoiceIntentEvent);
  useEventEmitter(
    ORVA_STATUS_EVENT,
    (voiceStatus: VOICE_COMAND_STATUS, isShowPanel?: boolean) => {
      if (voiceStatus === VOICE_COMAND_STATUS.NEGATIVE) {
        fireVoiceIntentError(isShowPanel);
      } else {
        setOrvaStatus(voiceStatus);
      }
    },
  );

  // Effect is used to handle the voice transcription captured event
  useEffect(() => {
    if (!voiceIntent) {
      return;
    }

    if (isCaseNoteCompleted && voiceIntent === VOICE_INTENT.ON_DEMAND_ALERTS) {
      setCaseNoteStatus(initialCaseNoteStatus);
      fireSetStausEvent(VOICE_COMAND_STATUS.DEFAULT);
      if (voiceTranscription !== Strings.Voce_Note_Panel_Placeholder) {
        fireSendSmsCapturedEvent(voiceTranscription);
      } else {
        fireVoiceIntentError();
      }
    }

    if (TIMERS_ACTIONS_INTENT_ARRAY.includes(voiceIntent)) {
      fireSetStausEvent(VOICE_COMAND_STATUS.DEFAULT);
      if (voiceTranscription !== Strings.Voce_Note_Panel_Placeholder) {
        fireTimerActionCapturedEvent({
          voiceIntent,
          voiceTranscription,
        });
      }
    }

    if (isCaseNoteCompleted && voiceIntent === VOICE_INTENT.VOICE_NOTE) {
      setCaseNoteStatus(initialCaseNoteStatus);
      fireSetStausEvent(VOICE_COMAND_STATUS.DEFAULT);
      if (voiceTranscription !== Strings.Voce_Note_Panel_Placeholder) {
        fireVoiceNoteCapturedEvent(voiceTranscription);
      } else {
        fireVoiceIntentError();
      }
    }
  }, [
    fireVoiceIntentError,
    isCaseNoteCompleted,
    voiceIntent,
    voiceTranscription,
  ]);

  // Effect is used to handle the case note processing and cancel event
  useEffect(() => {
    if (isCaseNoteProcessing) {
      fireSetStausEvent(VOICE_COMAND_STATUS.LOADING);
    }
    if (isCaseNoteCanceled) {
      onPanelDetailsChange({isVisible: false});
      setVoiceTranscription(Strings.Voce_Note_Panel_Placeholder);
      setCaseNoteStatus(initialCaseNoteStatus);
      fireSetStausEvent(VOICE_COMAND_STATUS.DEFAULT);
    }
  }, [isCaseNoteProcessing, isCaseNoteCanceled, onPanelDetailsChange]);

  // Effect is used to close the panel after 5 seconds
  useEffect(() => {
    let autoCloseTimeout: NodeJS.Timeout | null = null;
    if (
      isPanelVisible &&
      panelMode === VOICE_INTRACTION_PANEL_MODE.DISPLAY_INFO
    ) {
      autoCloseTimeout = setTimeout(() => {
        onPanelDetailsChange({isVisible: false});
      }, 3000);
    }
    return () => {
      if (autoCloseTimeout) {
        clearTimeout(autoCloseTimeout);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPanelVisible, panelMode]);

  // Effect is used to show the processing state in the Notes & Timers List
  useEffect(() => {
    if (voiceIntent === VOICE_INTENT.VOICE_NOTE) {
      fireVoiceNoteProcessingEvent(isCaseNoteProcessing);
    }
  }, [isCaseNoteProcessing, onPanelDetailsChange, voiceIntent]);

  useEffect(() => {
    if (
      orvaStatus === VOICE_COMAND_STATUS.POSITIVE &&
      voiceIntent &&
      !VOICE_INTRACTION_PANEL_INTENTS.includes(voiceIntent)
    ) {
      onPanelDetailsChange({isVisible: false});
    }
  }, [onPanelDetailsChange, orvaStatus, voiceIntent]);

  const onCancel = () => {
    SpeechDetection.resetSpeechProcessing();
    SpeechDetection.setWWDetected(false);
    fireSetStausEvent(VOICE_COMAND_STATUS.DEFAULT);
  };

  // Used to render the panel content based on the panel mode
  const renderPanelContent = (pm: VOICE_INTRACTION_PANEL_MODE) => {
    if (pm === VOICE_INTRACTION_PANEL_MODE.DISPLAY_INFO) {
      const {title = '', type, description, time} = panelDisplayData ?? {};

      const {signalBarType, iconSource, iconContainerColor} = (() => {
        let sbt;
        let iconSrc;
        let iconBgColor;

        switch (type) {
          case DISPLAY_INFO_PANEL_STATUS.ERROR:
            sbt = STATUS.ERROR;
            iconSrc = 'exclamation-thick';
            iconBgColor = colors.background.attention;
            break;
          case DISPLAY_INFO_PANEL_STATUS.SUCCESS:
            sbt = STATUS.SUCCESS;
            iconSrc = 'check-bold';
            iconBgColor = colors.background.progress;
            break;
        }

        return {
          signalBarType: sbt,
          iconSource: iconSrc,
          iconContainerColor: iconBgColor,
        };
      })();

      return (
        <View>
          <View style={styles.contentContainer}>
            <LabeledAvatar />
            <View style={globalStyles.flex1}>
              {title && <Text style={styles.infoTitle}>{title}</Text>}
              {description && (
                <Text style={styles.infoText}>{description}</Text>
              )}
              {time && <Text style={styles.infoText}>{time.toString()}</Text>}
            </View>
            {iconSource && (
              <View
                style={[
                  styles.statusContainer,
                  {
                    backgroundColor: iconContainerColor,
                  },
                ]}>
                <Icon
                  source={iconSource}
                  size={scaler(18)}
                  color={colors.foreground.inverted}
                />
              </View>
            )}
          </View>
          <SignalBar.Status type={signalBarType} statusWidth="40%" />
        </View>
      );
    }

    if (
      pm === VOICE_INTRACTION_PANEL_MODE.PROCESSING ||
      pm === VOICE_INTRACTION_PANEL_MODE.LOADING
    ) {
      const {title = ''} = panelDisplayData ?? {};
      const loadingText =
        pm === VOICE_INTRACTION_PANEL_MODE.PROCESSING
          ? Strings.Processing
          : title;
      return (
        <View>
          <View style={styles.contentContainer}>
            <LabeledAvatar />
            <Text style={[{color: colors?.foreground?.primary}]}>
              {loadingText + '...'}
            </Text>
          </View>
          <SignalBar.Loader />
        </View>
      );
    }

    return (
      <View>
        <View style={styles.contentContainer}>
          <UserFav isPanel />
          <View style={globalStyles.flex1}>
            <Text
              style={{
                color: colors?.foreground?.primary,
              }}>
              {Strings.Listening + '...'}
            </Text>
          </View>
          <IconButton
            iconColor={colors?.foreground?.primary}
            size={scaler(24)}
            hitSlop={scaler(48)}
            style={{
              width: scaler(24),
              height: scaler(24),
            }}
            icon="trash-can-outline"
            onPress={onCancel}
          />
        </View>
        <VoiceHorizontalWave />
      </View>
    );
  };

  return (
    <BottomSheet
      dismissOnBackdropPress={false}
      backdropBg="transparent"
      backgroundColor="transparent"
      showDragHandle={false}
      visible={isPanelVisible}
      contentContainerStyle={styles.container}>
      <View style={{backgroundColor: 'rgba(142, 142, 142, 0.2)'}}>
        {renderPanelContent(panelMode)}
      </View>
    </BottomSheet>
  );
};

const styles = StyleSheet.create({
  container: {
    borderTopLeftRadius: scaler(32),
    borderTopRightRadius: scaler(32),
    backgroundColor: colors.background.primary,
    overflow: 'hidden',
  },
  contentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    gap: scaler(16),
    padding: scaler(24),
    paddingBottom: scaler(16),
  },
  statusContainer: {
    width: scaler(36),
    height: scaler(36),
    borderRadius: scaler(18),
    borderWidth: scaler(3),
    borderColor: colors.background.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoTitle: {
    color: colors?.foreground?.primary,
  },
  infoText: {
    color: colors?.foreground?.primary,
    marginTop: scaler(2),
    fontSize: scaler(12),
  },
  processingView: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
});

export default VoiceIntractionPanel;
