import React, {Dispatch, SetStateAction} from 'react';
import {theme} from '@styles/Theme';
import scaler from '@utils/Scaler';
import {Menu, IconButton} from 'react-native-paper';

type TableMenuProps = Readonly<{
  children: JSX.Element | Array<JSX.Element>;
  isMenuVisible?: boolean;
  setIsMenuVisible?: Dispatch<SetStateAction<boolean>>;
}>;

export default function TableMenu(Props: TableMenuProps) {
  const {children, isMenuVisible = false, setIsMenuVisible} = Props;
  const {colors} = theme;

  return (
    <Menu
      visible={isMenuVisible}
      contentStyle={{
        backgroundColor: colors.background.primary,
        marginTop: scaler(26),
        borderRadius: scaler(8),
        minWidth: scaler(180),
      }}
      onDismiss={() => setIsMenuVisible?.(false)}
      anchor={
        <IconButton
          onPress={() => setIsMenuVisible?.(true)}
          style={{
            borderRadius: scaler(8),
            backgroundColor: isMenuVisible
              ? colors.background.inverse
              : colors.background.secondary,
            margin: scaler(0),
          }}
          mode="contained"
          icon="dots-vertical"
          size={scaler(16)}
          iconColor={
            isMenuVisible
              ? colors.foreground.inverted
              : colors.foreground.primary
          }
        />
      }
      anchorPosition="bottom">
      {children}
    </Menu>
  );
}
