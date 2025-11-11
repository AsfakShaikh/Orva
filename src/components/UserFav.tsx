import {getNameInitials} from '@helpers/getNameInitials';
import useAuthValue from '@modules/AuthModule/Hooks/useAuthValue';
import scaler from '@utils/Scaler';
import {StyleSheet, Text, View} from 'react-native';
import React, {FC} from 'react';
import {theme} from '@styles/Theme';
import useTrackerValue from '@modules/TrackerModule/Hooks/useTrackerValues';
import {MILESTONE_TRACKER_STEPS} from '@utils/Constants';
import Icons from '@assets/Icons';
const {colors} = theme;

type UserFavProps = {
  isPanel?: boolean;
  icon?: React.ReactNode;
};

const UserFav: FC<UserFavProps> = ({isPanel = false, icon}) => {
  const {firstName, LastName: lastName} = useAuthValue();
  const {currentActiveCase} = useTrackerValue();

  const isRoomCleanActive =
    currentActiveCase?.currentMilestone?.displayName ===
    MILESTONE_TRACKER_STEPS.ROOM_CLEAN;

  const renderIcon = () => {
    if (isRoomCleanActive) {
      return <Icons.UserUnknown />;
    }
    if (icon) {
      return icon;
    }

    return (
      <Text style={styles.profileTxt}>
        {getNameInitials(firstName, lastName)}
      </Text>
    );
  };

  return (
    <View
      style={[
        styles.profile,
        {
          backgroundColor: isPanel
            ? colors?.foreground?.activity
            : colors?.foreground?.secondary,
        },
      ]}>
      {renderIcon()}
    </View>
  );
};
const styles = StyleSheet.create({
  profile: {
    height: scaler(36),
    width: scaler(36),
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },

  profileTxt: {
    color: 'white',
    fontSize: scaler(16),
    fontWeight: '700',
  },
});
export default UserFav;
