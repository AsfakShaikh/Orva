import {Strings} from '@locales/Localization';
import {theme} from '@styles/Theme';
import scaler from '@utils/Scaler';
import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {View, Text, StyleSheet, FlatList} from 'react-native';
import Button from '@components/Button';
import useEventEmitter, {emitEvent} from '@hooks/useEventEmitter';
import useGetVoiceNoteListQuery from '../Hooks/useGetVoiceNotesListQuery';
import VoiceNote from './VoiceNote';
import {
  CaseNoteCategory,
  VOICE_NOTE_TYPE,
} from '@modules/TrackerModule/Types/CommonTypes';
import {
  CASE_NOTE_CLASSIFICATION_EVENT,
  DISPLAY_INFO_PANEL_STATUS,
  VOICE_INTRACTION_PANEL_MODE,
} from '../../VoiceComandModule/Types/CommonTypes';
import useFetchCaseNoteCategoriesQuery from '../Hooks/useFetchCaseNoteCategoriesQuery';
import useEditVoiceNoteClassificationMutation from '../Hooks/useEditVoiceNoteClassificationMutation';
import {NOTES_CATEGORIES} from '@utils/Constants';
import {compareAsc, parseISO} from 'date-fns';
import {initiateVoiceNote} from '../../VoiceComandModule/Helpers/initiateIntents';
import FlatListView from '@components/FlatListView';
import useGetTimersListQuery from '../Hooks/useGetTimersListQuery';
import useTrackerValue from '@modules/TrackerModule/Hooks/useTrackerValues';
import getTimerTitle from '../Helpers/getTimerTitle';
import DotsLoader from '@components/DotsLoader';
import useRecordCaseNoteMutation from '../Hooks/useRecordCaseNoteMutation';
import SpeechDetection from '@nativeModules/SpeechDetection';
import useAuthValue from '@modules/AuthModule/Hooks/useAuthValue';
import {toggleVoiceIntractionPanel} from '../../VoiceComandModule/Components/VoiceIntractionPanel';
import {toggleSendSmsDrawer} from './SendSmsDrawer';
import Note from './Note';
import useGetNotificationsListQuery from '../Hooks/useGetNotificationsListQuery';

const {colors} = theme;
export const VOICE_NOTE_CAPTURED = 'VOICE_NOTE_CAPTURED';
export const VOICE_NOTE_PROCESSING = 'VOICE_NOTE_PROCESSING';
export const VOICE_NOTE_LIST_SCROLL = 'VOICE_NOTE_LIST_SCROLL';

export function fireVoiceNoteCapturedEvent(transcription?: string) {
  emitEvent(VOICE_NOTE_CAPTURED, transcription);
}
export function fireVoiceNoteProcessingEvent(isProcessing: boolean) {
  emitEvent(VOICE_NOTE_PROCESSING, isProcessing);
}
export function fireVoiceNoteListScrollEvent() {
  emitEvent(VOICE_NOTE_LIST_SCROLL);
}

type VoiceNotesListProps = {
  showHeader?: boolean;
  onVoiceNotesCountChange?: (count: number) => void;
};

const VoiceNotesList = ({
  showHeader = true,
  onVoiceNotesCountChange,
}: VoiceNotesListProps) => {
  const {user, userId} = useAuthValue();
  const {currentActiveCase} = useTrackerValue();

  const [currentNoteClassification, setCurrentNoteClassification] =
    useState<CaseNoteCategory | null>(null);
  const [isCaseNoteProcessing, setIsCaseNoteProcessing] = useState(false);
  const [voiceTranscription, setVoiceTranscription] = useState<string | null>();
  const flatListRef = useRef<FlatList>(null);

  // Used to classify the voice note
  const classifyVoiceNote = useCallback(
    (data: any) => {
      const {note, id} = data;
      if (data) {
        SpeechDetection.processCaseNoteClassification(note, id, user?.username);
      }
    },
    [user?.username],
  );

  const {mutate: recordCaseNoteMutate, isPending: isRecordingCaseNote} =
    useRecordCaseNoteMutation(classifyVoiceNote);
  const {refetch: fetchClassification} = useFetchCaseNoteCategoriesQuery(
    currentNoteClassification?.caseNoteId ?? undefined,
  );
  const {
    mutateAsync: editCaseNoteClassificationMutate,
    isPending: isEditingNoteClassification,
  } = useEditVoiceNoteClassificationMutation();

  const {
    data: voiceNotesListData,
    refetch: refetchVoiceNotesList,
    isRefetching: isRefetchingVoiceNotesList,
  } = useGetVoiceNoteListQuery(currentActiveCase?.id);

  const {data: timersList} = useGetTimersListQuery(currentActiveCase?.id);

  const {data: notificationsList} = useGetNotificationsListQuery(
    currentActiveCase?.id,
  );

  const voiceNotesList = useMemo(
    () =>
      voiceNotesListData
        ? voiceNotesListData?.filter(voiceNote => voiceNote?.active)
        : [],
    [voiceNotesListData],
  );

  const timerNotesList = useMemo(
    () =>
      timersList?.flatMap(({timerlogs, description}) =>
        timerlogs?.map(log => {
          const {userName, timestamp, id, newStatus, metaData} = log ?? {};
          return {
            type: VOICE_NOTE_TYPE.TIMER_NOTE,
            id,
            title: getTimerTitle(newStatus, metaData?.action),
            updatedAt: timestamp,
            loggedBy: userName,
            desc: description,
            duration: metaData?.duration,
          };
        }),
      ) ?? [],
    [timersList],
  );

  const notificationNotesList = useMemo(
    () =>
      notificationsList?.flatMap(
        ({id, message, notificationType, loggedAt, loggedBy}) => {
          return {
            type: VOICE_NOTE_TYPE.NOTIFICATION_NOTE,
            id,
            title: `${notificationType} Alert`,
            desc: message,
            updatedAt: loggedAt,
            loggedBy: loggedBy,
          };
        },
      ) ?? [],
    [notificationsList],
  );

  const voiceNotesEventsList = useMemo(() => {
    return [
      ...voiceNotesList,
      ...timerNotesList,
      ...notificationNotesList,
    ]?.sort((a, b) => {
      const aTimestamp = a?.updatedAt ? parseISO(String(a?.updatedAt)) : null;
      const bTimestamp = b?.updatedAt ? parseISO(String(b?.updatedAt)) : null;

      if (aTimestamp && bTimestamp) {
        return compareAsc(aTimestamp, bTimestamp);
      }
      if (!aTimestamp) {
        return 1;
      }
      return -1;
    });
  }, [timerNotesList, voiceNotesList, notificationNotesList]);

  const updateClassification = async () => {
    const resp = await fetchClassification();
    let classificationUpdate: any[] = [];
    currentNoteClassification?.categories.forEach(category => {
      const enumValue =
        NOTES_CATEGORIES[category as unknown as keyof typeof NOTES_CATEGORIES];
      const categories = resp.data?.find(item => item.type === enumValue);
      if (categories?.id) {
        classificationUpdate.push({
          id: categories?.id,
          type: categories?.type,
        });
      }
    });
    return classificationUpdate;
  };

  // Effect is used to handle the voice notes count change event
  useEffect(() => {
    if (voiceNotesEventsList) {
      onVoiceNotesCountChange?.(voiceNotesEventsList.length);
    }
  }, [onVoiceNotesCountChange, voiceNotesEventsList]);

  // Used to handle the voice note captured event
  useEventEmitter(VOICE_NOTE_CAPTURED, (transcription?: string) => {
    setVoiceTranscription(transcription);
  });

  // Used to handle the voice note processing event
  useEventEmitter(VOICE_NOTE_PROCESSING, (isProcessing: boolean) => {
    setIsCaseNoteProcessing(isProcessing);
    if (isProcessing) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd();
      }, 300);
    }
  });

  // Used to handle the case note classification event
  useEventEmitter(
    CASE_NOTE_CLASSIFICATION_EVENT,
    async (data: CaseNoteCategory) => {
      if (data?.caseNoteId) {
        setCurrentNoteClassification(data);
      }
    },
  );

  // Used to handle the voice note list scroll event
  useEventEmitter(VOICE_NOTE_LIST_SCROLL, () => {
    showHeader && setTimeout(() => flatListRef.current?.scrollToEnd(), 500);
  });

  // Effect is used to fetch the note classification list
  useEffect(() => {
    const fetchNoteClassificationList = async () => {
      if (currentNoteClassification?.caseNoteId) {
        const classificationUpdate: any[] = await updateClassification();
        Promise.all(
          classificationUpdate.map(item =>
            editCaseNoteClassificationMutate({
              noteId: currentNoteClassification?.caseNoteId,
              classificationId: item?.id,
              isEnabled: true,
              isAIGenerated: true,
            }),
          ),
        ).then(() => {
          refetchVoiceNotesList();
        });
      }
    };
    fetchNoteClassificationList();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentNoteClassification?.caseNoteId]);

  // Effect is used to record the voice note
  useEffect(() => {
    if (voiceTranscription && currentActiveCase?.id) {
      recordCaseNoteMutate(
        {
          note: voiceTranscription,
          caseId: currentActiveCase?.id,
          tag: 'General Case Notes',
          loggedById: userId,
        },
        {
          onSuccess: () => {
            toggleVoiceIntractionPanel({
              mode: VOICE_INTRACTION_PANEL_MODE.DISPLAY_INFO,
              data: {
                title: Strings.Note_Captured + '!',
                type: DISPLAY_INFO_PANEL_STATUS.SUCCESS,
              },
            });
            showHeader &&
              setTimeout(() => flatListRef.current?.scrollToEnd(), 300);
          },
          onError: () => {
            toggleVoiceIntractionPanel({
              mode: VOICE_INTRACTION_PANEL_MODE.DISPLAY_INFO,
              data: {
                title: Strings.Note_Capture_Error,
                type: DISPLAY_INFO_PANEL_STATUS.ERROR,
              },
            });
          },
          onSettled: () => {
            setVoiceTranscription(null);
          },
        },
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [voiceTranscription, showHeader, currentActiveCase?.id, userId]);

  // Effect is used to set loading in voice intration panel
  useEffect(() => {
    if (isRecordingCaseNote || isCaseNoteProcessing) {
      toggleVoiceIntractionPanel({
        mode: VOICE_INTRACTION_PANEL_MODE.LOADING,
        data: {
          title: Strings.Capturing_Note,
        },
      });
    }
  }, [isRecordingCaseNote, isCaseNoteProcessing]);

  return (
    <View style={styles.container}>
      {showHeader && (
        <View style={styles.header}>
          <Text style={styles.heading}>{Strings.Voice_Notes}</Text>
          <Button
            icon={'account-voice'}
            onPress={initiateVoiceNote}
            contentStyle={{
              height: scaler(42),
            }}
            style={styles.btn}
            labelStyle={{fontSize: scaler(14)}}>
            "{Strings.Capture_Note}"
          </Button>
          <Button
            icon={'plus-thick'}
            onPress={() => toggleSendSmsDrawer()}
            contentStyle={{
              height: scaler(42),
            }}
            style={styles.btn}
            labelStyle={{fontSize: scaler(14), marginLeft: scaler(12)}}>
            "{Strings.Create_SMS}"
          </Button>
        </View>
      )}
      <FlatListView
        ref={flatListRef}
        viewProps={{flex: 1}}
        data={voiceNotesEventsList}
        nestedScrollEnabled
        renderItem={({item}) =>
          item?.type === VOICE_NOTE_TYPE.TIMER_NOTE ||
          item?.type === VOICE_NOTE_TYPE.NOTIFICATION_NOTE ? (
            <Note details={item} />
          ) : (
            <VoiceNote
              item={item}
              isClassifying={
                (isRefetchingVoiceNotesList || isEditingNoteClassification) &&
                item?.id === currentNoteClassification?.caseNoteId
              }
            />
          )
        }
        ListEmptyComponent={
          !(isCaseNoteProcessing || isRecordingCaseNote) ? (
            <Text style={styles.placeholder}>{Strings.notes_placeholder}</Text>
          ) : null
        }
        ListFooterComponent={
          <View
            style={{
              minHeight: scaler(16),
            }}>
            {(isCaseNoteProcessing || isRecordingCaseNote) && (
              <Text style={styles.processingText}>
                {Strings.Processing} <DotsLoader />
              </Text>
            )}
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 11,
    backgroundColor: colors.background.primary,
    borderRadius: scaler(16),
    padding: scaler(16),
    paddingVertical: scaler(12),
  },
  title: {
    fontSize: scaler(24),
    fontWeight: 'bold',
    marginBottom: scaler(16),
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: scaler(8),
  },
  heading: {
    flex: 1,
    fontSize: scaler(18),
    fontFamily: 'Inter',
    fontWeight: 'bold',
    color: colors?.foreground.primary,
  },
  voiceNoteItem: {
    marginBottom: scaler(8),
    borderRadius: scaler(8),
  },
  note: {
    fontSize: scaler(16),
    flex: 1,
  },
  loggedInfo: {
    fontSize: scaler(14),
    color: colors.foreground.secondary,
    marginBottom: scaler(8),
  },
  placeholder: {
    fontSize: scaler(16),
    color: colors.foreground.inactive,
  },
  classifyingChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: scaler(6),
    paddingTop: scaler(4),
    borderRadius: scaler(12),
    alignSelf: 'flex-start',
    marginTop: scaler(4),
  },
  chipIcon: {
    marginRight: scaler(4),
  },
  chipText: {
    fontSize: scaler(16),
    color: colors?.foreground.inactive,
  },
  processingText: {
    fontSize: scaler(16),
    color: colors?.foreground.brand,
    fontWeight: '500',
    marginVertical: scaler(16),
  },
  btn: {
    marginRight: -scaler(12),
  },
});

export default VoiceNotesList;
