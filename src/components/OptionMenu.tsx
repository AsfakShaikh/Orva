import {theme} from '@styles/Theme';
import scaler from '@utils/Scaler';
import React, {FC} from 'react';
import {StyleSheet, View} from 'react-native';
import {IconButton, Menu, MenuItemProps, MenuProps} from 'react-native-paper';

const {colors} = theme;

type OptionMenuProps = {
  options: Array<Omit<MenuItemProps, 'title'> & {title: string}>;
  onAnchorPress?: () => void;
  onItemPress?: (val: any) => void;
} & Pick<
  MenuProps,
  'visible' | 'onDismiss' | 'anchorPosition' | 'contentStyle'
> &
  Partial<Pick<MenuProps, 'anchor'>>;

const OptionMenu: FC<OptionMenuProps> = ({
  options,
  onAnchorPress,
  anchor,
  onItemPress,
  ...props
}) => {
  return (
    <Menu
      anchorPosition="bottom"
      contentStyle={{
        marginTop: scaler(30),
        backgroundColor: colors.background.primary,
      }}
      {...props}
      anchor={
        anchor ?? (
          <View
            style={{
              width: scaler(38),
              height: scaler(18),
            }}>
            <IconButton
              style={styles.anchorBtn}
              onPress={onAnchorPress}
              size={scaler(20)}
              icon="dots-vertical"
            />
          </View>
        )
      }>
      {options.map(item => (
        <Menu.Item
          key={item?.title}
          style={{width: scaler(200)}}
          {...item}
          onPress={e => {
            onItemPress?.(item);
            item?.onPress?.(e);
          }}
        />
      ))}
    </Menu>
  );
};

export default OptionMenu;

const styles = StyleSheet.create({
  anchorBtn: {
    position: 'absolute',
    top: scaler(-10),
    right: 0,
    margin: 0,
  },
});
