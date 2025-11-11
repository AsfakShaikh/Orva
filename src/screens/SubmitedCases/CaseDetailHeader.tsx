import Button from '@components/Button';
import Divider from '@components/Divider';
import {Strings} from '@locales/Localization';
import {CaseSubmittedStackParamList} from '@navigation/Types/CommonTypes';
import {useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {globalStyles} from '@styles/GlobalStyles';
import {theme} from '@styles/Theme';
import {SUBMIT_CASES_STACK_ROUTE_NAME} from '@utils/Constants';
import scaler from '@utils/Scaler';
import React from 'react';
import {View, Text, StyleSheet, Pressable} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';

const {colors} = theme;
interface CaseDetailHeaderProps {
  mrn: string | undefined;
  surgeon: string | undefined;
  procedureName: string | undefined;
  isEditEnabled?: boolean;
  onBtnPress?: () => void;
  isBeforeDayEnd?: boolean;
}
const CaseDetailHeader = ({
  mrn,
  surgeon,
  procedureName,
  isEditEnabled = false,
  onBtnPress,
  isBeforeDayEnd = true,
}: CaseDetailHeaderProps) => {
  const {navigate} =
    useNavigation<
      NativeStackNavigationProp<
        CaseSubmittedStackParamList,
        SUBMIT_CASES_STACK_ROUTE_NAME.SUBMITTED_CASES
      >
    >();

  return (
    <View style={styles.container}>
      <Pressable
        style={styles.bradCramView}
        onPress={() => navigate(SUBMIT_CASES_STACK_ROUTE_NAME.SUBMITTED_CASES)}>
        <Ionicons
          name="chevron-back"
          size={30}
          color={colors?.foreground.secondary}
        />
      </Pressable>
      {!!mrn && (
        <>
          <Text numberOfLines={1} style={styles.text}>
            MRN {mrn}
          </Text>

          <Divider
            direction="vertical"
            width={scaler(2)}
            height={scaler(40)}
            backgroundColor={colors?.foreground.inactive}
          />
        </>
      )}

      {!!procedureName && (
        <>
          <Text numberOfLines={1} style={styles.text}>
            {procedureName}
          </Text>

          <Divider
            direction="vertical"
            width={scaler(2)}
            height={scaler(40)}
            backgroundColor={colors?.foreground.inactive}
          />
        </>
      )}

      <Text numberOfLines={1} style={styles.text}>
        {surgeon}
      </Text>

      <View style={globalStyles.flex1} />

      <Button
        disabled={!isBeforeDayEnd}
        mode="outlined"
        icon="pencil-outline"
        onPress={onBtnPress}>
        {isEditEnabled ? Strings.Confirm_Changes : Strings.Edit}
      </Button>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    paddingVertical: scaler(16),
    paddingRight: scaler(8),
    borderBottomWidth: scaler(1),
    borderBottomColor: colors.foreground.inactive,
    gap: scaler(12),
    alignItems: 'center',
  },
  bradCramView: {
    flexDirection: 'row',
  },
  column: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    fontSize: scaler(24),
    fontWeight: '700',
    color: '#000',
    maxWidth: scaler(300),
  },
});

export default CaseDetailHeader;
