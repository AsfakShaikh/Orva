import useEventEmitter, {emitEvent} from '@hooks/useEventEmitter';
import React, {useMemo, useState} from 'react';
import {Keyboard, StyleSheet, Text, View} from 'react-native';
import {Button, Snackbar as PaperSnackbar} from 'react-native-paper';
import {HEADER_SNACKBAR_TYPE} from '@utils/Types';
import {$RemoveChildren} from 'react-native-paper/lib/typescript/types';
import scaler from '@utils/Scaler';
import Icons from '@assets/Icons';
import {SnackbarColor, theme} from '@styles/Theme';
import {globalStyles} from '@styles/GlobalStyles';

const SHOW_HEADER_SNACKBAR_EVENT = 'SHOW_HEADER_SNACKBAR_EVENT';

type SnackbarOptionsProps = {
  type?: HEADER_SNACKBAR_TYPE;
  action?: $RemoveChildren<typeof Button> & {label: string};
  duration?: number;
  isBodyIcon?: boolean;
};

function createHeaderSnackbarHandler() {
  const attentionToast = (
    text: string,
    bodyText?: string,
    options?: SnackbarOptionsProps,
  ) => {
    Keyboard.dismiss();
    emitEvent(SHOW_HEADER_SNACKBAR_EVENT, {
      text,
      bodyText,
      options: {type: HEADER_SNACKBAR_TYPE.ATTENTION, ...options},
    });
  };
  const successToast = (
    text: string,
    bodyText?: string,
    options?: SnackbarOptionsProps,
  ) => {
    Keyboard.dismiss();
    emitEvent(SHOW_HEADER_SNACKBAR_EVENT, {
      text,
      bodyText,
      options: {type: HEADER_SNACKBAR_TYPE.SUCCESS, ...options},
    });
  };
  const neutralToast = (
    text: string,
    bodyText?: string,
    options?: SnackbarOptionsProps,
  ) => {
    Keyboard.dismiss();
    emitEvent(SHOW_HEADER_SNACKBAR_EVENT, {
      text,
      bodyText,
      options: {type: HEADER_SNACKBAR_TYPE.NEUTRAL, ...options},
    });
  };

  const defaultToast = (
    text: string,
    bodyText?: string,
    options?: SnackbarOptionsProps,
  ) => {
    Keyboard.dismiss();
    emitEvent(SHOW_HEADER_SNACKBAR_EVENT, {
      text,
      bodyText,
      options: {type: HEADER_SNACKBAR_TYPE.DEFAULT, ...options},
    });
  };
  const supportToast = (
    text: string,
    bodyText?: string,
    options?: SnackbarOptionsProps,
  ) => {
    Keyboard.dismiss();
    emitEvent(SHOW_HEADER_SNACKBAR_EVENT, {
      text,
      bodyText,
      options: {type: HEADER_SNACKBAR_TYPE.SUPPORT, ...options},
    });
  };

  return {
    successToast,
    neutralToast,
    attentionToast,
    defaultToast,
    supportToast,
  };
}

const HeaderSnackbarHandler = createHeaderSnackbarHandler();
export {HeaderSnackbarHandler};

export default function HeaderSnackbar() {
  const [visible, setVisible] = useState(false);
  const [header, setHeader] = useState('');
  const [body, setBody] = useState<string | undefined>();
  const [barOptions, setBarOptions] = useState<SnackbarOptionsProps>({});
  useEventEmitter(
    SHOW_HEADER_SNACKBAR_EVENT,
    ({
      text,
      bodyText,
      options,
    }: {
      text: string;
      bodyText?: string;
      options?: any;
    }) => {
      setVisible(true);
      setHeader(text);
      setBody(bodyText);
      setBarOptions(options);
    },
  );

  const {type, action, duration = 8000} = barOptions;

  const backgroundColor = useMemo(() => {
    switch (type) {
      case HEADER_SNACKBAR_TYPE.ATTENTION:
        return SnackbarColor.ERROR;
      case HEADER_SNACKBAR_TYPE.SUCCESS:
        return SnackbarColor.SUCCESS;
      case HEADER_SNACKBAR_TYPE.SUPPORT:
        return SnackbarColor.SUPPORT;
      case HEADER_SNACKBAR_TYPE.NEUTRAL:
        return SnackbarColor.NORMAL;
      default:
        return SnackbarColor.DEFAULT;
    }
  }, [type]);

  const IconComponent = useMemo(() => {
    if (
      type === HEADER_SNACKBAR_TYPE.SUCCESS ||
      type === HEADER_SNACKBAR_TYPE.DEFAULT
    ) {
      return Icons.SuccessAlert;
    }
    return Icons.InfoAlert;
  }, [type]);

  const iconColor = useMemo(() => {
    return type === HEADER_SNACKBAR_TYPE.DEFAULT
      ? colors.foreground.primary
      : colors.foreground.inverted;
  }, [type]);

  const textColor = useMemo(() => {
    return type === HEADER_SNACKBAR_TYPE.DEFAULT
      ? colors.foreground.primary
      : colors.foreground.inverted;
  }, [type]);

  return (
    visible && (
      <View style={styles.container}>
        <PaperSnackbar
          visible={visible}
          onDismiss={() => setVisible(false)}
          duration={duration}
          style={[
            styles.paper,
            {
              backgroundColor: backgroundColor,
            },
          ]}
          action={action}
          icon="close"
          onIconPress={() => setVisible(false)}>
          <View style={styles.main}>
            <IconComponent style={styles.icon} color={iconColor} />

            <View style={globalStyles.flex1}>
              <Text
                style={[
                  styles.header,
                  {
                    color: textColor,
                  },
                ]}>
                {header}
              </Text>
              {body && (
                <View style={[globalStyles.row, {gap: scaler(4)}]}>
                  {barOptions?.isBodyIcon && (
                    <Icons.AIGenerated
                      fill="white"
                      width={scaler(16)}
                      height={scaler(16)}
                    />
                  )}
                  <Text
                    style={[
                      styles.body,
                      {
                        color: textColor,
                      },
                    ]}>
                    {body}
                  </Text>
                </View>
              )}
              {action && (
                <Text
                  onPress={action.onPress}
                  style={[
                    styles.label,
                    {
                      color: textColor,
                    },
                  ]}>
                  {action.label}
                </Text>
              )}
            </View>
          </View>
        </PaperSnackbar>
      </View>
    )
  );
}

const {colors} = theme;

const styles = StyleSheet.create({
  main: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  header: {
    fontSize: scaler(16),
    fontWeight: '700',
    letterSpacing: scaler(1),
    // textShadowColor: '#000000',
    // textShadowOffset: {width: -1, height: 1},
    // textShadowRadius: 1,
    lineHeight: scaler(16),
    textAlignVertical: 'center',
  },
  label: {
    fontSize: scaler(13),
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
  body: {
    fontSize: scaler(13),
    fontWeight: '400',
  },
  container: {
    zIndex: 1000,
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: scaler(64),
  },
  icon: {
    marginRight: scaler(10),
  },
  paper: {
    margin: scaler(0),
    borderRadius: scaler(0),
    alignItems: 'center',
    flex: 1,
  },
});
