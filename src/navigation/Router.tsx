import React, {useEffect, useState} from 'react';
import {NavigationContainer} from '@react-navigation/native';
import AuthStackNavigator from './StackNavigation/AuthStackNavigator';
import useAuthValue from '@modules/AuthModule/Hooks/useAuthValue';
import MainStackNavigator from './StackNavigation/MainStackNavigator';
import Snackbar from '@components/Snackbar';
import {EventTypeEnum, SOCKET_EVENTS} from '@utils/Constants';
import useLogoutMutation from '@modules/AuthModule/Hooks/useLogoutMutation';
import CustomAlert from '@components/CustomAlert';
import {Strings} from '@locales/Localization';
import getSocketInstance, {createSocketQuery} from '@utils/getSocketInstance';
import {Socket} from 'socket.io-client';
import {emitCaseBoardUpdateEvent} from '@modules/CaseBoardModule/Hooks/useIdentityCaseboardTimers';
import {emitSubmittedUpdateEvent} from '@modules/CasesModule/Components/SubmitedCasesList';
import DetectInactivity from '@modules/AuthModule/Components/DetectInactivity';
import BottomSnackbar, {
  BottomSnackbarHandler,
} from '@components/BottomSnackbar';
import useInternetState from '@hooks/useInternetState';
import {fireVoiceNoteProcessingEvent} from '@modules/TrackerModule/Components/VoiceNotesList';
import {toggleVoiceIntractionPanel} from '@modules/VoiceComandModule/Components/VoiceIntractionPanel';
import Icons from '@assets/Icons';
import ConnectivityTimeoutAlert from '@modules/AuthModule/Components/ConnectivityTimeoutAlert';

export let appLogEventSocketInstance: Socket<any> | undefined;
export let asrLogEventSocketInstance: Socket<any> | undefined;
export let caseEventSocketInstance: Socket<any> | undefined;
export default function Router() {
  const {isInternetConnected} = useInternetState();
  const {isLoggedIn, selectedOt, userId, hospitalId, tenantId, session_state} =
    useAuthValue();

  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [title, setTitle] = useState('');
  const [wasInternetDisconnected, setWasInternetDisconnected] = useState(false);
  const [showLostConnectionAlert, setShowLostConnectionAlert] = useState(false);
  const {mutate: logoutMutate} = useLogoutMutation();

  const handleCloseAlert = async () => {
    logoutMutate();
    setShowAlert(false);
  };

  const disableVIPProcessing = () => {
    toggleVoiceIntractionPanel({
      isVisible: false,
    });
    fireVoiceNoteProcessingEvent(false);
  };

  // effect is used to handle the case events
  useEffect(() => {
    if (hospitalId && isLoggedIn) {
      const caseEventQuery = createSocketQuery(SOCKET_EVENTS.CASE_EVENTS);
      const AppLogEventQuery = createSocketQuery(SOCKET_EVENTS.APP_LOG_EVENTS);
      const AsrLogEventQuery = createSocketQuery(SOCKET_EVENTS.ASR_LOG_EVENTS);

      caseEventSocketInstance = getSocketInstance(caseEventQuery);

      appLogEventSocketInstance = getSocketInstance(AppLogEventQuery);
      asrLogEventSocketInstance = getSocketInstance(AsrLogEventQuery);

      caseEventSocketInstance.on(
        SOCKET_EVENTS.CASE_EVENTS,
        (updatedData: any) => {
          if (
            updatedData.eventType === EventTypeEnum.KNOCK_OUT &&
            updatedData.sessionId !== session_state &&
            updatedData.otId === selectedOt?.uuid
          ) {
            setAlertMessage(
              `${updatedData.userName} has signed in to this OT. As a result, you will be logged out. If this was in error, please contact ${updatedData.userName}.`,
            );
            setTitle('Alert');
            setShowAlert(true);
          }
          if (
            updatedData.eventType === EventTypeEnum.LOGOUT &&
            updatedData.sessionId !== session_state &&
            updatedData.userId === userId
          ) {
            setAlertMessage(`You are already logged in to Orva on another device. You will be logged out on that device and logged in on this one.
          `);
            setTitle('Alert: Already Logged In');
            setShowAlert(true);
          }
          if (
            updatedData.eventType !== EventTypeEnum.KNOCK_OUT &&
            updatedData.eventType !== EventTypeEnum.LOGOUT
          ) {
            emitCaseBoardUpdateEvent();
          }
          if (updatedData.eventType === EventTypeEnum.SUBMIT_CASE) {
            emitSubmittedUpdateEvent();
          }
        },
      );

      return () => {
        caseEventSocketInstance?.off(SOCKET_EVENTS.CASE_EVENTS);
        caseEventSocketInstance?.disconnect();
        appLogEventSocketInstance?.off(SOCKET_EVENTS.APP_LOG_EVENTS);
        appLogEventSocketInstance?.disconnect();
        asrLogEventSocketInstance?.off(SOCKET_EVENTS.ASR_LOG_EVENTS);
        asrLogEventSocketInstance?.disconnect();
      };
    }
  }, [
    hospitalId,
    isLoggedIn,
    tenantId,
    userId,
    session_state,
    selectedOt?.uuid,
  ]);

  // effect is used to handle the internet connection state
  useEffect(() => {
    if (!isInternetConnected) {
      setWasInternetDisconnected(true);
      disableVIPProcessing();
      BottomSnackbarHandler.errorToast({
        title: Strings.No_Internet_Connection,
        rightIcon: Icons.NoInternet,
      });
      setShowLostConnectionAlert(true);
    } else if (wasInternetDisconnected) {
      // Only show success message if we were previously disconnected
      BottomSnackbarHandler.successToast({
        title: Strings.Internet_Connected,
        rightIcon: Icons.Check,
      });
      setWasInternetDisconnected(false);
      setShowLostConnectionAlert(false);
    }
  }, [isInternetConnected, wasInternetDisconnected]);

  return (
    <>
      <NavigationContainer>
        {isLoggedIn ? (
          <DetectInactivity>
            <MainStackNavigator />
          </DetectInactivity>
        ) : (
          <AuthStackNavigator />
        )}
      </NavigationContainer>
      <Snackbar />
      <CustomAlert
        visible={showAlert}
        onClose={handleCloseAlert}
        message={alertMessage}
        timerText={Strings.after_fiver_secs}
        title={title}
      />
      <BottomSnackbar />
      {showLostConnectionAlert && <ConnectivityTimeoutAlert />}
    </>
  );
}
