import {Strings} from '@locales/Localization';
import useDetectAudioDevice from '@modules/VoiceComandModule/Hooks/useDetectAudioDevice';
import useSystemValues from '@modules/VoiceComandModule/Hooks/useSystemValues';
import {globalStyles} from '@styles/GlobalStyles';
import {theme} from '@styles/Theme';
import scaler from '@utils/Scaler';
import React from 'react';
import {StyleSheet, Text, View} from 'react-native';

const {colors} = theme;

const BluetoothDeviceStatus = () => {
  const {connectedDevice} = useSystemValues();
  const {isDeviceConnected} = useDetectAudioDevice();

  const isBtConnected = isDeviceConnected && connectedDevice;
  return (
    <View>
      <Text style={styles.title}>{Strings.Bluetooth_Status}</Text>
      <Text style={styles.desc}>{Strings.Bluetooth_Status_Desc}</Text>
      <View style={styles.btStatusCard}>
        <View
          style={[
            styles.btStatus,
            isBtConnected
              ? styles.btStatusConnected
              : styles.btStatusDisconnected,
          ]}
        />
        <Text style={globalStyles.blackText}>
          {isBtConnected
            ? connectedDevice?.deviceName ?? Strings.Unknown_Device
            : Strings.No_Bluetooth_audio_device_connected}
        </Text>
      </View>
    </View>
  );
};

export default BluetoothDeviceStatus;

const styles = StyleSheet.create({
  title: {
    fontSize: scaler(18),
    fontWeight: '700',
    lineHeight: scaler(24),
    color: colors.foreground.primary,
    marginBottom: scaler(6),
  },
  desc: {
    fontSize: scaler(12),
    lineHeight: scaler(18),
    color: colors.foreground.primary,
  },
  btStatusCard: {
    borderRadius: scaler(8),
    borderWidth: scaler(1),
    borderColor: colors.border.default,
    paddingVertical: scaler(16),
    paddingHorizontal: scaler(24),
    gap: scaler(24),
    marginVertical: scaler(24),
    flexDirection: 'row',
  },
  btStatus: {
    width: scaler(18),
    height: scaler(18),
    borderRadius: scaler(18),
  },
  btStatusDisconnected: {
    backgroundColor: colors.foreground.attention,
  },
  btStatusConnected: {
    backgroundColor: colors.foreground.progress,
  },
});
