import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  GestureResponderEvent,
  ViewStyle,
  TextStyle,
  View,
} from 'react-native';
import scaler from '@utils/Scaler';

interface CustomButtonProps {
  buttonText: string;
  onPress: (event: GestureResponderEvent) => void;
  buttonStyle?: ViewStyle;
  textStyle?: TextStyle;
  icon?: React.ReactNode;
}

const CustomButton: React.FC<CustomButtonProps> = ({
  buttonText,
  onPress,
  buttonStyle,
  textStyle,
  icon,
}) => {
  return (
    <TouchableOpacity style={buttonStyle ?? styles.button} onPress={onPress}>
      <View style={styles.btnInerItem}>
        {icon && <View style={styles.iconContainer}>{icon}</View>}
        <Text style={textStyle ?? styles.buttonText}>{buttonText}</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    backgroundColor: '#64568e',
    paddingVertical: scaler(10),
    paddingHorizontal: scaler(20),
    borderRadius: scaler(30),
    justifyContent: 'center',
    alignItems: 'center',
    width: '80%',
  },
  btnInerItem: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
  },
  iconContainer: {
    marginRight: scaler(8),
  },
  buttonText: {
    color: '#fff',
    fontSize: scaler(14),
  },
});

export default CustomButton;
