import React from 'react';
import {OptionalLocaleString} from '@locales/Localization';
import Modal from './Modal';
import {ButtonProps, Text} from 'react-native-paper';
import {globalStyles} from '@styles/GlobalStyles';
import {StyleSheet, TextStyle, View} from 'react-native';
import scaler from '@utils/Scaler';
import Button from './Button';

type ButtonObjType = {
  id: string | number;
  title: OptionalLocaleString;
} & Omit<ButtonProps, 'children'>;

type CommonAlertTypes = Readonly<{
  icon?: React.JSX.Element;
  heading?: OptionalLocaleString;
  subHeading?: OptionalLocaleString;
  buttonsArr?: Array<ButtonObjType>;
  visible: boolean;
  onDismiss?: () => void;
  headerTextAlign?: TextStyle['textAlign'];
  backdropBg?: string;
  spaceBetweenBtn?: boolean;
}>;

export default function CommonAlert(Props: CommonAlertTypes) {
  const {
    icon,
    heading,
    subHeading,
    buttonsArr,
    visible,
    headerTextAlign = 'center',
    spaceBetweenBtn = false,
    onDismiss,
    backdropBg = '#1F1F1F',
  } = Props;

  return (
    <Modal
      visible={visible}
      statusBarTranslucent
      onBackdropPress={onDismiss}
      backdropBg={backdropBg}>
      <View style={globalStyles.dialogContainer}>
        {icon && (
          // eslint-disable-next-line react-native/no-inline-styles
          <View style={{marginBottom: scaler(16), alignItems: 'center'}}>
            {icon}
          </View>
        )}
        {heading && (
          <Text
            variant="headlineSmall"
            style={{
              textAlign: headerTextAlign,
              marginBottom: scaler(16),
            }}>
            {heading}
          </Text>
        )}
        {subHeading && <Text variant="bodyMedium">{subHeading}</Text>}
        {buttonsArr && (
          <View style={[styles?.buttonContainer, spaceBetweenBtn ? { display: 'flex', justifyContent: 'space-between' } : null]}>
            {buttonsArr?.map((item, index) => {
              const {id, title, ...btnProps} = item;
              return (
                <Button
                  compact
                  contentStyle={{height: scaler(40)}}
                  style={{marginLeft: index === 0 ? 0 : scaler(8)}}
                  key={id}
                  {...btnProps}>
                  {title}
                </Button>
              );
            })}
          </View>
        )}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  buttonContainer: {
    width: '100%',
    flexWrap: 'wrap',
    justifyContent: 'flex-end',
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: scaler(24),
  },
});
