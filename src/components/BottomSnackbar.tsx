import React, { FC, useCallback, useEffect, useMemo, useState } from 'react';
import BottomSheet from './BottomSheet';
import { StyleSheet, Text, View } from 'react-native';
import scaler from '@utils/Scaler';
import { theme } from '@styles/Theme';
import LabeledAvatar from './LabeledAvatar';
import { globalStyles } from '@styles/GlobalStyles';
import { Icon } from 'react-native-paper';
import SignalBar from './SignalBar';
import useEventEmitter, { emitEvent } from '@hooks/useEventEmitter';
import { STATUS } from '@utils/Constants';
import { SvgProps } from 'react-native-svg';
import Button from './Button';
import Icons from '@assets/Icons';

const { colors } = theme;

interface BottomSnackbarProps {
  title?: string | React.ReactNode;
  description?: string;
  type?: STATUS;
  rightIcon?: FC<SvgProps>;
  actionBtnDetails?: {
    label: string;
    onPress?: () => void;
    icons?: FC<SvgProps>;
  };
}

const BOTTOM_SNACKBAR_EVENT = 'BOTTOM_SNACKBAR_EVENT';

function createBottomSnackbarHandler() {
  const errorToast = (options?: Omit<BottomSnackbarProps, 'type'>) => {
    emitEvent(BOTTOM_SNACKBAR_EVENT, {
      type: STATUS.ERROR,
      ...options,
    });
  };
  const successToast = (options?: BottomSnackbarProps) => {
    emitEvent(BOTTOM_SNACKBAR_EVENT, {
      type: STATUS.SUCCESS,
      ...options,
    });
  };
  const infoToast = (options?: BottomSnackbarProps) => {
    emitEvent(BOTTOM_SNACKBAR_EVENT, {
      type: STATUS.INFO,
      ...options,
    });
  };
  return { errorToast, successToast, infoToast };
}

const BottomSnackbarHandler = createBottomSnackbarHandler();
export { BottomSnackbarHandler };

const BottomSnackbar = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [details, setDetails] = useState<BottomSnackbarProps>();

  const { title, description, type, rightIcon, actionBtnDetails } = details ?? {};

  useEventEmitter(BOTTOM_SNACKBAR_EVENT, (payload: BottomSnackbarProps) => {
    setDetails(payload);
    setIsVisible(true);
  });

  // effect is used to handle the visibility
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isVisible) {
      timer = setTimeout(() => {
        setIsVisible(false);
      }, 5000);
    }
    return () => clearTimeout(timer);
  }, [isVisible]);

  const { iconName, iconContainerColor } = useMemo(() => {
    let iconNameD;
    let iconContainerColorD;

    switch (type) {
      case STATUS.ERROR:
        iconNameD = 'exclamation-thick';
        iconContainerColorD = colors.background.attention;
        break;
      case STATUS.SUCCESS:
        iconNameD = 'check-bold';
        iconContainerColorD = colors.background.progress;
        break;
      default:
        break;
    }

    return { iconName: iconNameD, iconContainerColor: iconContainerColorD };
  }, [type]);

  const isRightIconVisible = useMemo(() => {
    return type === STATUS.ERROR || type === STATUS.SUCCESS;
  }, [type]);

  const renderActionBtnIcon = useCallback(() => {
    if (actionBtnDetails?.icons) {
      return actionBtnDetails.icons({
        width: scaler(18),
        height: scaler(18),
      });
    }

    return <Icons.Settings width={scaler(18)} height={scaler(18)} />;
  }, [actionBtnDetails]);

  return (
    <BottomSheet
      backgroundColor={'transparent'}
      showDragHandle={false}
      visible={isVisible}
      onDismiss={() => setIsVisible(false)}
      onBackdropPress={() => setIsVisible(false)}
      contentContainerStyle={styles.container}>
      <View>
        <View style={styles.contentContainer}>
          <LabeledAvatar />
          <View style={globalStyles.flex1}>
            {title && (
              typeof title === 'string' ? (
                <Text style={[styles.title, description && styles.bold]}>
                  {title}
                </Text>
              ) : (
                title
              )
            )}
            {description && (
              <Text style={styles.description}>{description}</Text>
            )}
          </View>
          {actionBtnDetails && (
            <Button
              mode="outlined"
              icon={renderActionBtnIcon}
              onPress={actionBtnDetails.onPress}
              contentStyle={{
                height: scaler(40),
              }}
              labelStyle={styles.actionBtnLabel}>
              {actionBtnDetails.label}
            </Button>
          )}
          {isRightIconVisible && (
            <View
              style={[
                styles.statusContainer,
                {
                  backgroundColor: iconContainerColor,
                },
              ]}>
              {rightIcon ? (
                rightIcon({
                  width: scaler(18),
                  height: scaler(18),
                  color: colors.foreground.inverted,
                })
              ) : (
                <Icon
                  source={iconName}
                  size={scaler(18)}
                  color={colors.foreground.inverted}
                />
              )}
            </View>
          )}
        </View>
        <SignalBar.Status type={type} statusWidth="40%" />
      </View>
    </BottomSheet>
  );
};

const styles = StyleSheet.create({
  container: {
    borderTopLeftRadius: scaler(32),
    borderTopRightRadius: scaler(32),
    backgroundColor: colors.background.inactive,
  },
  contentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    gap: scaler(16),
    padding: scaler(24),
    paddingBottom: scaler(16),
  },
  statusContainer: {
    width: scaler(36),
    height: scaler(36),
    borderRadius: scaler(18),
    borderWidth: scaler(3),
    borderColor: colors.background.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: scaler(16),
    color: colors?.foreground?.primary,
  },
  description: {
    color: colors?.foreground?.primary,
    marginTop: scaler(2),
    fontSize: scaler(14),
  },
  bold: {
    fontWeight: '700',
  },
  actionBtnLabel: {
    marginVertical: 0,
    paddingVertical: 0,
    color: colors.foreground.primary,
    fontSize: scaler(16),
    fontWeight: '400',
  },
});

export default BottomSnackbar;
