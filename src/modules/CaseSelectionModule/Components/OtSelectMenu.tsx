import Button from '@components/Button';
import {Strings} from '@locales/Localization';
import useAuthValue, {
  updateAuthValue,
} from '@modules/AuthModule/Hooks/useAuthValue';
import scaler from '@utils/Scaler';
import React, {useMemo, useState} from 'react';
import useGetOtsListQuery from '../Hooks/useGetOtsListQuery';
import {ActivityIndicator, Icon, Menu} from 'react-native-paper';
import {theme} from '@styles/Theme';
import {StyleSheet, View} from 'react-native';
import {globalStyles} from '@styles/GlobalStyles';

const {colors} = theme;

const OtSelectMenu = () => {
  const [isOtMenuVisible, setIsOtMenuVisible] = useState<any>(null);
  const {selectedOtsArr = [], hospitalId} = useAuthValue();

  const {data: otsListData = []} = useGetOtsListQuery(hospitalId);

  const buttonLabel = useMemo(() => {
    if (selectedOtsArr?.length === otsListData?.length) {
      return Strings.All_OTs;
    }
    if (selectedOtsArr?.length === 0) {
      return Strings.No_OTs_Selected;
    }
    if (selectedOtsArr?.length > 1) {
      return selectedOtsArr?.[0]?.name + ' +' + (selectedOtsArr?.length - 1);
    }
    return selectedOtsArr?.[0]?.name;
  }, [selectedOtsArr, otsListData]);

  return (
    <Menu
      visible={isOtMenuVisible}
      onDismiss={() => setIsOtMenuVisible(false)}
      anchorPosition="bottom"
      contentStyle={{
        marginTop: scaler(30),
        backgroundColor: colors.background.primary,
      }}
      anchor={
        <Button
          onPress={() => setIsOtMenuVisible(true)}
          icon="chevron-down"
          mode="outlined"
          style={{marginHorizontal: scaler(16)}}>
          {buttonLabel}
        </Button>
      }>
      <MenuItemsList />
    </Menu>
  );
};

const MenuItemsList = () => {
  const {selectedOtsArr = [], hospitalId} = useAuthValue();

  const {data: otsListData, isLoading: isGettingOtsList} =
    useGetOtsListQuery(hospitalId);

  const otOptionsList = useMemo(() => {
    return (
      otsListData?.map((ot: any) => ({
        key: ot?.name,
        value: ot?.uuid,
      })) ?? []
    );
  }, [otsListData]);

  if (isGettingOtsList) {
    return (
      <Menu.Item
        contentStyle={globalStyles.colCenter}
        style={styles.menuItem}
        title={
          <View>
            <ActivityIndicator />
          </View>
        }
      />
    );
  }

  return otOptionsList.map(item => {
    const isSelected = selectedOtsArr?.some(ot => ot?.uuid === item?.value);
    return (
      <Menu.Item
        key={item?.value}
        style={styles.menuItem}
        title={item?.key}
        onPress={() => {
          updateAuthValue({
            selectedOtsArr: isSelected
              ? selectedOtsArr?.filter(ot => ot?.uuid !== item?.value)
              : [...selectedOtsArr, {uuid: item?.value, name: item?.key}],
          });
        }}
        leadingIcon={() => renderLeadingIcon(isSelected)}
        rippleColor={colors.background.tertiary}
      />
    );
  });
};

const renderLeadingIcon = (isSelected: boolean) => (
  <Icon
    source={isSelected ? 'checkbox-marked' : 'checkbox-blank-outline'}
    size={scaler(24)}
    color={isSelected ? colors.foreground.brand : colors.foreground.primary}
  />
);

const styles = StyleSheet.create({
  menuItem: {
    width: scaler(200),
  },
});

export default OtSelectMenu;
