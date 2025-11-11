import {globalStyles} from '@styles/GlobalStyles';
import {theme} from '@styles/Theme';
import React, {FC} from 'react';
import {StyleSheet, View} from 'react-native';
import {IconButton, Portal, Text} from 'react-native-paper';
import Body from './Body';
import scaler from '@utils/Scaler';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

const {colors} = theme;

type SideModalDrawerProps = {
  visible?: boolean;
  onClose?: () => void;
  title?: string;
  subTitle?: string | null;
  children?: React.ReactNode;
  scrollViewRef?: React.RefObject<any>;
};

const SideModalDrawer: FC<SideModalDrawerProps> = ({
  visible,
  onClose,
  title,
  subTitle,
  children,
  scrollViewRef,
}) => {
  const {top} = useSafeAreaInsets();

  return visible ? (
    <Portal>
      <View
        style={[
          globalStyles.blurView,
          {backgroundColor: colors.backdrop, paddingTop: top},
        ]}>
        <View style={styles.container}>
          <Body nestedScrollEnabled ref={scrollViewRef}>
            <View style={styles.header}>
              <View>
                <Text variant="titleLarge">{title}</Text>
                {subTitle && (
                  <Text style={{fontSize: scaler(12)}}>{subTitle}</Text>
                )}
              </View>
              <IconButton
                icon="close"
                size={scaler(24)}
                hitSlop={scaler(8)}
                style={{
                  margin: scaler(0),
                  width: scaler(24),
                  height: scaler(28),
                }}
                onPress={onClose}
              />
            </View>
            {children}
          </Body>
        </View>
      </View>
    </Portal>
  ) : null;
};

export const SideModalDrawerBody = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  return (
    <View
      style={[
        globalStyles.flex1,
        {
          marginHorizontal: scaler(24),
        },
      ]}>
      {children}
    </View>
  );
};

export const SideModalDrawerFooter = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  return <View>{children}</View>;
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    margin: scaler(24),
  },
  container: {
    backgroundColor: 'rgba(247, 242, 250, 1)',
    alignSelf: 'flex-end',
    width: '36%',
    flex: 1,
    borderRadius: scaler(16),
  },
  formInput: {
    marginTop: scaler(18),
  },
  btnContainer: {
    flexDirection: 'row',
    margin: scaler(24),
    marginTop: 0,
  },
});

export default SideModalDrawer;
