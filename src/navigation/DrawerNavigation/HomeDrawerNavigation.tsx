import React, {useCallback, useEffect, useState} from 'react';
import {
  HomeDrawerParamList,
  MainStackParamList,
} from '@navigation/Types/CommonTypes';
import {
  createDrawerNavigator,
  DrawerNavigationProp,
} from '@react-navigation/drawer';
import {
  HOME_DRAWER_ROUTE_NAME,
  MAIN_STACK_ROUTE_NAME,
  MILESTONE_TRACKER_STEPS,
} from '@utils/Constants';
import TrackerStackNavigator from '@navigation/StackNavigation/TrackerStackNavigation';
import {theme} from '@styles/Theme';
import {RouteProp, useNavigation, useRoute} from '@react-navigation/native';
import SupportScreen from '@screens/Support/SupportScreen';
import Container from '@components/Container';
import AppBar, {AppBarProps} from '@components/AppBar';
import CustomHomeDrawer, {CustomHomeDrawerProps} from './CustomHomeDrawer';
import useUpdateTimers from '@modules/TrackerModule/Hooks/useUpdateTimers';
import CaseBoardScreen from '@screens/CaseBoard/CaseBoardScreen';
import SettingStackNavigator from '@navigation/StackNavigation/SettingStackNavigator';
import CaseSubmitedStackNavigator from '@navigation/StackNavigation/CaseSubmitedStackNavigator';
import AccountSettingStackNavigator from '@navigation/StackNavigation/AccountSettingStackNavigator';
import PopUpMenu from '@components/PopUpMenu';
import VoiceIntractionPanel from '@modules/VoiceComandModule/Components/VoiceIntractionPanel';
import useVoiceCapabilities from '@modules/VoiceComandModule/Hooks/useVoiceCapabilities';
import useAuthValue from '@modules/AuthModule/Hooks/useAuthValue';
import useDetectAudioDevice from '@modules/VoiceComandModule/Hooks/useDetectAudioDevice';
import useAudioPlayer from '@hooks/useAudioPlayer';
import useGetSettingConfigQuery from '@modules/SettingsModule/Hooks/useGetSettingConfigQuery';
import Audios from '@assets/audio';
import {
  ORVA_STATUS_EVENT,
  VOICE_COMAND_STATUS,
  VOICE_INETENT_EVENT,
  VOICE_INTENT,
} from '@modules/VoiceComandModule/Types/CommonTypes';
import useEventEmitter, {emitEvent} from '@hooks/useEventEmitter';
import VIPFloationBtn from '@modules/VoiceComandModule/Components/VIPFloationBtn';
import RoomCleanScreen from '@screens/RoomClean/RoomCleanScreen';
import useTrackerValue from '@modules/TrackerModule/Hooks/useTrackerValues';
import ScheduleStackNavigator from '@navigation/StackNavigation/ScheduleStackNavigator';

const {colors} = theme;

const HomeDrawer = createDrawerNavigator<HomeDrawerParamList>();

export function fireSetStausEvent(
  voiceStatus: VOICE_COMAND_STATUS,
  isShowPanel: boolean = true,
) {
  emitEvent(ORVA_STATUS_EVENT, voiceStatus, isShowPanel);
}

export default function HomeDrawerNavigator() {
  const {params} =
    useRoute<
      RouteProp<MainStackParamList, MAIN_STACK_ROUTE_NAME.HOME_DRAWER>
    >();
  const {isContinueWithActiveCase = true} = params ?? {};

  const {user, selectedOt} = useAuthValue();
  const {playAudio} = useAudioPlayer();
  const {currentActiveCase} = useTrackerValue();
  const {data: settingsDetail} = useGetSettingConfigQuery();

  const isCaseboardView = selectedOt?.isCaseboardOnly;

  // Determine initial route based on isContinueWithActiveCase parameter
  const initialRoute = isContinueWithActiveCase
    ? HOME_DRAWER_ROUTE_NAME.TRACKER_STACK
    : HOME_DRAWER_ROUTE_NAME.SCHEDULE_STACK;

  useUpdateTimers();

  const [status, setStatus] = useState<VOICE_COMAND_STATUS>(
    VOICE_COMAND_STATUS.DEFAULT,
  );
  const [wakeWordDetected, setWakeWordDetected] = useState(false);
  const [isDrawerExpanded, setIsDrawerExpanded] = useState(true);

  const isRoomCleanActive =
    currentActiveCase?.currentMilestone?.displayName ===
    MILESTONE_TRACKER_STEPS.ROOM_CLEAN;

  const {stopListening} = useVoiceCapabilities(
    user?.username,
    (isDetected: boolean) => {
      setWakeWordDetected(isDetected);
    },
  );

  useDetectAudioDevice(); // NOTE: Make sure this must be called after useVoiceCapabilitie()

  const navigation = useNavigation<DrawerNavigationProp<HomeDrawerParamList>>();

  const onVoiceIntentReceive = useCallback(
    (intent: VOICE_INTENT) => {
      switch (intent) {
        case VOICE_INTENT.VIEW_CASE_LIST:
          navigation.navigate(HOME_DRAWER_ROUTE_NAME.SCHEDULE_STACK);
          fireSetStausEvent(VOICE_COMAND_STATUS.POSITIVE);
          break;
        case VOICE_INTENT.NAVIGATE_TO_CASE_TRACKER:
          navigation.navigate(HOME_DRAWER_ROUTE_NAME.TRACKER_STACK);
          fireSetStausEvent(VOICE_COMAND_STATUS.POSITIVE);
          break;
        case VOICE_INTENT.NAVIGATE_TO_SETTINGS:
          navigation.navigate(HOME_DRAWER_ROUTE_NAME.SETTINGS_STACK);
          fireSetStausEvent(VOICE_COMAND_STATUS.POSITIVE);
          break;
        case VOICE_INTENT.NAVIGATE_TO_CASES:
          navigation.navigate(HOME_DRAWER_ROUTE_NAME.CASES);
          fireSetStausEvent(VOICE_COMAND_STATUS.POSITIVE);
          break;
        case VOICE_INTENT.VIEW_CASEBOARD:
          navigation.navigate(HOME_DRAWER_ROUTE_NAME.CASEBOARD);
          fireSetStausEvent(VOICE_COMAND_STATUS.POSITIVE);
          break;
        case VOICE_INTENT.GET_SUPPORT:
          navigation.navigate(HOME_DRAWER_ROUTE_NAME.SUPPORT);
          fireSetStausEvent(VOICE_COMAND_STATUS.POSITIVE);
          break;
        default:
          break;
      }
    },
    [navigation],
  );

  useEventEmitter(ORVA_STATUS_EVENT, (voiceStatus: VOICE_COMAND_STATUS) => {
    setStatus(voiceStatus);
    if (
      voiceStatus === VOICE_COMAND_STATUS.NEGATIVE ||
      voiceStatus === VOICE_COMAND_STATUS.POSITIVE
    ) {
      setTimeout(() => setStatus(VOICE_COMAND_STATUS.DEFAULT), 1000);
    }
  });

  useEventEmitter(VOICE_INETENT_EVENT, onVoiceIntentReceive);

  useEffect(() => {
    if (settingsDetail?.enableEarcons !== false) {
      if (status === VOICE_COMAND_STATUS.POSITIVE) {
        playAudio(Audios.Affirmative);
      }
      if (status === VOICE_COMAND_STATUS.NEGATIVE) {
        playAudio(Audios.Negative);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [settingsDetail?.enableEarcons, status]);

  useEffect(() => {
    if (wakeWordDetected) {
      if (settingsDetail?.enableEarcons !== false) {
        playAudio(Audios.Awake);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [wakeWordDetected]);

  useEffect(() => {
    if (isRoomCleanActive) {
      stopListening();
    }
  }, [isRoomCleanActive, stopListening]);

  return (
    <Container
      statusBarStyle="dark-content"
      backgroundColor={colors.background.secondary}>
      <HomeDrawer.Navigator
        initialRouteName={initialRoute}
        backBehavior="none"
        screenOptions={{
          unmountOnBlur: false,
          header: () => renderHeader({isDrawerExpanded, isRoomCleanActive}),
          drawerType: 'permanent',
          drawerStyle: {
            width: 'auto',
            justifyContent: 'center',
            backgroundColor: 'transparent',
            borderColor: 'transparent',
          },
        }}
        drawerContent={props =>
          renderCustomDrawer({
            ...props,
            isDrawerExpanded,
            setIsDrawerExpanded,
          })
        }>
        {!isRoomCleanActive && !isCaseboardView && (
          <>
            <HomeDrawer.Screen
              name={HOME_DRAWER_ROUTE_NAME.SCHEDULE_STACK}
              component={ScheduleStackNavigator}
              options={{lazy: false, unmountOnBlur: true}}
            />
            <HomeDrawer.Screen
              name={HOME_DRAWER_ROUTE_NAME.TRACKER_STACK}
              initialParams={{isContinueWithActiveCase}}
              component={TrackerStackNavigator}
              options={{lazy: false}}
            />
            <HomeDrawer.Screen
              name={HOME_DRAWER_ROUTE_NAME.CASEBOARD}
              component={CaseBoardScreen}
              options={{lazy: false}}
            />
            <HomeDrawer.Screen
              name={HOME_DRAWER_ROUTE_NAME.CASES}
              component={CaseSubmitedStackNavigator}
              options={{lazy: false, unmountOnBlur: true}}
            />
            <HomeDrawer.Screen
              name={HOME_DRAWER_ROUTE_NAME.SETTINGS_STACK}
              component={SettingStackNavigator}
            />
            <HomeDrawer.Screen
              name={HOME_DRAWER_ROUTE_NAME.ACCOUNT_SETTINGS_STACK}
              component={AccountSettingStackNavigator}
            />
          </>
        )}
        {!isRoomCleanActive && isCaseboardView && (
          <>
            <HomeDrawer.Screen
              name={HOME_DRAWER_ROUTE_NAME.SCHEDULE_STACK}
              component={ScheduleStackNavigator}
              options={{lazy: false, unmountOnBlur: true}}
            />
            <HomeDrawer.Screen
              name={HOME_DRAWER_ROUTE_NAME.CASEBOARD}
              component={CaseBoardScreen}
              options={{lazy: false}}
            />
          </>
        )}
        {isRoomCleanActive && (
          <HomeDrawer.Screen
            name={HOME_DRAWER_ROUTE_NAME.ROOM_CLEAN}
            component={RoomCleanScreen}
          />
        )}
        <HomeDrawer.Screen
          name={HOME_DRAWER_ROUTE_NAME.SUPPORT}
          component={SupportScreen}
        />
      </HomeDrawer.Navigator>
      <PopUpMenu />
      {!isRoomCleanActive && <VoiceIntractionPanel />}
      {!isRoomCleanActive && <VIPFloationBtn />}
    </Container>
  );
}

function renderHeader(props: AppBarProps) {
  const {isDrawerExpanded, isRoomCleanActive} = props;
  return (
    <AppBar
      isDrawerExpanded={isDrawerExpanded}
      isRoomCleanActive={isRoomCleanActive}
    />
  );
}
function renderCustomDrawer(props: CustomHomeDrawerProps) {
  return <CustomHomeDrawer {...props} />;
}
