import Divider from '@components/Divider';
import formatDateTime, {FORMAT_DATE_TYPE} from '@helpers/formatDateTime';
import {Strings} from '@locales/Localization';
import useTrackerValue from '@modules/TrackerModule/Hooks/useTrackerValues';
import {globalStyles} from '@styles/GlobalStyles';
import {theme} from '@styles/Theme';
import scaler from '@utils/Scaler';
import React, {FC} from 'react';
import {View, Text, StyleSheet} from 'react-native';

const {colors} = theme;

interface TrackerHeaderProps {
  isRoomCleanActive?: boolean;
}

const TrackerHeader: FC<TrackerHeaderProps> = ({isRoomCleanActive}) => {
  const {currentActiveCase} = useTrackerValue();

  if (!currentActiveCase) {
    return null;
  }

  const caseEndTime = currentActiveCase?.actualEndTime;

  const renderContent = (
    isRoomClean?: boolean,
    wheelsOutTime?: Date | null,
  ) => {
    if (isRoomClean) {
      return (
        <Text style={styles.roomCleanText}>
          <Text>{Strings.Case_Completed}</Text>
          {' - '}
          <Text style={styles.wheelsOutText}>
            {Strings.Wheels_Out_Label}
            {': '}
            {formatDateTime(wheelsOutTime, FORMAT_DATE_TYPE.LOCAL, 'HH:mm')}
          </Text>
        </Text>
      );
    }
    return (
      <>
        <Text numberOfLines={1} style={styles.text}>
          MRN {currentActiveCase?.patient?.mrn}
        </Text>

        <Divider
          direction="vertical"
          width={scaler(2)}
          height={scaler(40)}
          backgroundColor={colors?.foreground.inactive}
        />

        <Text numberOfLines={1} style={styles.text}>
          {currentActiveCase?.procedure?.name === 'Orthopaedict'
            ? 'Orthopedic'
            : currentActiveCase?.procedure?.name}
        </Text>

        <Divider
          direction="vertical"
          width={scaler(2)}
          height={scaler(40)}
          backgroundColor={colors?.foreground.inactive}
        />

        <Text numberOfLines={1} style={styles.text}>
          {currentActiveCase?.assignedSurgeon}
        </Text>
      </>
    );
  };

  return (
    <View style={[styles.container, globalStyles.rowCenter]}>
      {renderContent(isRoomCleanActive, caseEndTime)}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    gap: scaler(12),
    overflow: 'hidden',
  },
  column: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    fontSize: scaler(24),
    fontWeight: '700',
    color: colors?.foreground.primary,
    flexShrink: 1,
  },
  roomCleanText: {
    fontSize: scaler(24),
    fontWeight: '700',
    color: colors?.foreground.primary,
  },
  wheelsOutText: {
    fontSize: scaler(18),
  },
});

export default TrackerHeader;
