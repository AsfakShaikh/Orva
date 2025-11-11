import React, {useRef, useState} from 'react';
import {StyleSheet, View} from 'react-native';
import scaler, {screenHeight} from '@utils/Scaler';
import CaseTimer from '../../modules/TrackerModule/Components/CaseTimer';
import useTrackerValue from '@modules/TrackerModule/Hooks/useTrackerValues';
import CaseSummary from '@modules/TrackerModule/Components/CaseSummary';
import {globalStyles} from '@styles/GlobalStyles';
import {useForm} from 'react-hook-form';
import VoiceNotesList from '@modules/TrackerModule/Components/VoiceNotesList';
import DeleteVoiceNoteModal from '@modules/TrackerModule/Components/DeleteVoiceNoteModal';
import VoiceNoteClassificationEditModal from '@modules/TrackerModule/Components/VoiceNoteClassificationEditModal';
import {ActivityIndicator, IconButton} from 'react-native-paper';
import TimersList from '@modules/TrackerModule/Components/TimersList';
import DeleteTimerModal from '@modules/TrackerModule/Components/DeleteTimerModal';
import AllTimersDeleteModal from '@modules/TrackerModule/Components/AllTimersDeleteModal';
import ManageNotesTimersModal from '@modules/TrackerModule/Components/ManageNotesTimersModal';
import ReasonForLateModal from '@modules/TrackerModule/Components/ReasonForLateModal';
import useEventEmitter from '@hooks/useEventEmitter';
import {
  VOICE_INTENT,
  VOICE_INETENT_EVENT,
  VOICE_COMAND_STATUS,
} from '@modules/VoiceComandModule/Types/CommonTypes';
import {fireSetStausEvent} from '@navigation/DrawerNavigation/HomeDrawerNavigation';
import useDebounce from '@hooks/useDebounce';
import SuggestedNotesList from '@modules/TrackerModule/Components/SuggestedNotesList';
import Tabs from '@components/Tabs';
import {theme} from '@styles/Theme';
import CaseDocumentation from '@modules/TrackerModule/Components/CaseDocumentation';
import DeleteDocumentationModal from '@modules/TrackerModule/Components/DeleteDocumentationModal';
import ViewTranscriptModal from '@modules/TrackerModule/Components/ViewTranscriptModal';
import SyncDocumentationButton from '@modules/TrackerModule/Components/SyncDocumentationButton';
import {BottomSnackbarHandler} from '@components/BottomSnackbar';
import {Strings} from '@locales/Localization';
import SendSmsDrawer from '@modules/TrackerModule/Components/SendSmsDrawer';

const {colors} = theme;

const caseTabOptions = [
  {label: Strings.Back_to_Tracker, value: 0},
  {label: Strings.Milestones, value: 1},
  {label: Strings.Documentation, value: 2},
];

const CaseTrackerScreen = () => {
  const {isGettingCurrentActiveCase} = useTrackerValue();

  const caseDocRef: any = useRef(null);
  const [activeTab, setActiveTab] = useState<number>(0);
  const [isSyncingDocumentation, setIsSyncingDocumentation] = useState(false);

  const {control, watch} = useForm({
    defaultValues: {
      comment: '',
    },
  });

  useEventEmitter(VOICE_INETENT_EVENT, (voiceIntentData: VOICE_INTENT) => {
    if (
      voiceIntentData === VOICE_INTENT.NAVIGATE_TO_CASE_SUMMARY ||
      voiceIntentData === VOICE_INTENT.NAVIGATE_TO_CASES
    ) {
      fireSetStausEvent(VOICE_COMAND_STATUS.POSITIVE);
      setActiveTab(1);
    }
  });

  const caseComments = useDebounce(watch('comment'), 1000) as string;

  const handleSyncDocumentation = () => {
    if (activeTab === 2 && caseDocRef.current) {
      caseDocRef?.current?.submitForm();
      setIsSyncingDocumentation(true);
      BottomSnackbarHandler.infoToast({
        title: Strings.Documentation_syncing_msg,
      });
      setTimeout(() => {
        BottomSnackbarHandler.successToast({
          title: Strings.Documentation_synced_msg,
        });
        setIsSyncingDocumentation(false);
      }, 2000);
    }
  };

  return isGettingCurrentActiveCase ? (
    <View style={globalStyles.colCenter}>
      <ActivityIndicator size="large" />
    </View>
  ) : (
    <>
      <View style={styles.container}>
        {activeTab !== 0 && (
          <View style={globalStyles.row}>
            <View style={[styles.backBtnContainer, {paddingRight: scaler(4)}]}>
              <IconButton
                style={{
                  borderRadius: scaler(4),
                  width: scaler(32),
                  height: scaler(32),
                }}
                containerColor={colors.background.primary}
                icon="chevron-left"
                iconColor={colors.foreground.brand}
                size={scaler(32)}
                onPress={() => setActiveTab(0)}
              />
            </View>
            <View style={globalStyles.flex1}>
              <Tabs
                options={caseTabOptions}
                setActiveTab={setActiveTab}
                activeTab={activeTab}
                containerStyle={styles.topTabsContainer}
              />
            </View>
            <View style={styles.backBtnContainer}>
              <SyncDocumentationButton
                onSyncDocumentation={handleSyncDocumentation}
                isLoading={isSyncingDocumentation}
              />
            </View>
          </View>
        )}
        {activeTab === 0 && (
          <View style={styles.containerCol}>
            <View style={[globalStyles.flex1, styles.containerRow]}>
              <CaseTimer setActiveTab={setActiveTab} comments={caseComments} />
              <VoiceNotesList />
            </View>
            <View style={styles.containerRow}>
              <TimersList />
              <SuggestedNotesList />
            </View>
          </View>
        )}
        {activeTab === 1 && (
          <CaseSummary control={control} comments={caseComments} />
        )}
        {activeTab === 2 && (
          <CaseDocumentation
            ref={caseDocRef}
            isSyncingDocumentation={isSyncingDocumentation}
          />
        )}
      </View>
      <ManageNotesTimersModal />
      <DeleteVoiceNoteModal />
      <DeleteTimerModal />
      <AllTimersDeleteModal />
      <VoiceNoteClassificationEditModal />
      <ReasonForLateModal />
      <DeleteDocumentationModal />
      <ViewTranscriptModal />
      <SendSmsDrawer />
    </>
  );
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: scaler(16),
    minHeight: screenHeight * 0.79,
  },
  containerCol: {
    flex: 1,
    gap: scaler(16),
  },
  containerRow: {
    flexDirection: 'row',
    gap: scaler(16),
  },
  summaryBtnContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: scaler(16),
    marginTop: scaler(16),
  },
  backBtnContainer: {
    borderBottomWidth: scaler(1),
    borderBottomColor: colors.border.inactive,
    justifyContent: 'center',
  },
  topTabsContainer: {
    marginTop: scaler(4),
    gap: scaler(100),
  },
});
export default CaseTrackerScreen;
