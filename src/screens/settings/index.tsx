// Not in use
import Button from '@components/Button';
import Container from '@components/Container';
import Tabs from '@components/Tabs';
import {Strings} from '@locales/Localization';
import useSaveSettingsMutation from '@modules/SettingsModule/Hooks/useSaveSettingsMutation';
import Notifications from '@modules/CaseSelectionModule/Components/Notifications';
import OrvaPreferences from '@modules/CaseSelectionModule/Components/OrvaPreferences';
import useUpdateNotificationPrefMutation from '@modules/CaseSelectionModule/Hooks/useUpdateNotificationPrefMutation';
import {theme} from '@styles/Theme';
import scaler from '@utils/Scaler';
import React, {useState} from 'react';
import {StyleSheet, Text, View} from 'react-native';

const settingsTabsOptions = [
  {label: Strings.Orva_Preferences, value: 0},
  {label: Strings.Notifications, value: 1},
];

export default function Setting() {
  const [orvaPreferences, setOrvaPreferences] = useState({
    enable_earcons: true,
  });
  const [orvaPrefChangeDetected, setOrvaPrefChangeDetected] = useState(false);

  const [notificationPref, setNotificationPref] = useState({
    countryCode: '',
    phoneNumber: '',
    turnoverTimeToggle: false,
    firstCaseTimeToggle: false,
  });
  const [notificationPrefChangeDetected, setNotificationPrefChangeDetected] =
    useState(false);

  const [activeTab, setActiveTab] = useState(0);

  const {mutate: saveSettingMutate, isPending: isSavingSetting} =
    useSaveSettingsMutation(() => setOrvaPrefChangeDetected(false));

  const {
    mutate: updateNotificationPrefMutate,
    isPending: isUpdatingNotificationPref,
  } = useUpdateNotificationPrefMutation(() =>
    setNotificationPrefChangeDetected(false),
  );

  const saveSettings = () => {
    if (orvaPrefChangeDetected) {
      saveSettingMutate({
        timeFormat: '24_HOURS',
        enableEarcons: orvaPreferences.enable_earcons,
      });
    }
    if (notificationPrefChangeDetected) {
      updateNotificationPrefMutate({
        countryCode: notificationPref?.countryCode,
        phoneNumber: notificationPref.phoneNumber,
        turnoverTimeToggle: notificationPref?.turnoverTimeToggle,
        firstCaseTimeToggle: notificationPref?.firstCaseTimeToggle,
      });
    }
  };

  return (
    <Container backgroundColor={colors.background.secondary}>
      <View style={{paddingHorizontal: scaler(16)}}>
        <View style={styles.mainContainer}>
          <View style={styles.subMain}>
            <Text style={styles.settings}>{Strings.Settings}</Text>
            <Button
              style={styles.btn}
              mode="contained"
              onPress={saveSettings}
              loading={isSavingSetting || isUpdatingNotificationPref}
              disabled={
                (!orvaPrefChangeDetected && !notificationPrefChangeDetected) ||
                isSavingSetting ||
                isUpdatingNotificationPref
              }>
              {Strings.Save_Settings}
            </Button>
          </View>
          <Tabs
            options={settingsTabsOptions}
            setActiveTab={setActiveTab}
            activeTab={activeTab}
          />
          {activeTab === 0 && (
            <OrvaPreferences
              onPreferenceChange={val =>
                setOrvaPreferences({
                  enable_earcons: val?.enable_earcons ?? false,
                })
              }
              setChangeDetected={setOrvaPrefChangeDetected}
            />
          )}
          {activeTab === 1 && (
            <Notifications
              onPreferenceChange={val => setNotificationPref(val)}
              setChangeDetected={setNotificationPrefChangeDetected}
            />
          )}
        </View>
      </View>
    </Container>
  );
}

const {colors} = theme;

const styles = StyleSheet.create({
  subMain: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  settings: {
    fontSize: scaler(32),
    fontWeight: '700',
    marginLeft: scaler(24),
    color: '#000',
  },
  btn: {marginRight: scaler(15)},
  commonBtn: {
    width: scaler(320),
  },
  mainContainer: {
    width: '100%',
    paddingTop: scaler(20),
  },
  container: {gap: scaler(32), alignItems: 'center', marginTop: scaler(24)},

  iconButton: {
    height: scaler(96),
    width: scaler(96),
    margin: 0,
    borderRadius: scaler(28),
  },
  title: {
    color: colors.foreground.primary,
    fontFamily: 'Inter',
    textAlign: 'center',
    lineHeight: scaler(38),
    fontWeight: '700',
    fontSize: scaler(32),
  },
  description: {
    color: colors.foreground.primary,
    fontFamily: 'Inter',
    fontWeight: '400',
    lineHeight: scaler(30),
    fontSize: scaler(24),
    textAlign: 'center',
  },
});
