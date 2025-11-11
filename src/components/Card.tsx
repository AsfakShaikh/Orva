import React from 'react';
import { View, Text, Image, StyleSheet, ImageSourcePropType } from 'react-native';
import scaler from '@utils/Scaler';
import Button from './Button';
import { globalStyles } from '@styles/GlobalStyles';
import { theme } from '@styles/Theme';

const { colors } = theme;
interface CardProps {
  cardImage: ImageSourcePropType;
  cardTitle: string;
  description: string;
  buttonText: string;
  pressAction: () => void;
}

const Card: React.FC<CardProps> = ({
  cardImage,
  description,
  buttonText,
  cardTitle,
  pressAction,
}) => {
  return (
    <View style={styles.card}>
      <View style={styles.imageContainer}>
        <Image source={cardImage} style={globalStyles.fullFlexImage} />
      </View>

      <View style={styles.contentContainer}>
        <View style={globalStyles.flex1}>
          <Text style={styles.title}>{cardTitle}</Text>
          <Text style={styles.description}>{description}</Text>
        </View>
        <Button style={{ width: '100%' }} icon="account-voice" onPress={pressAction} mode="contained">
          "{buttonText}"
        </Button>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: colors.background.primary,
    borderRadius: scaler(16),
    overflow: 'hidden',
    // height: '100%',
    elevation: 5,
  },
  imageContainer: {
    height: scaler(200),

  },
  title: {
    fontSize: scaler(18),
    color: colors.foreground.primary,
    fontFamily: 'Inter',
    fontWeight: 'bold',
    lineHeight: scaler(24),
    marginBottom: scaler(8),
  },
  description: {
    fontSize: scaler(18),
    color: colors.foreground.primary,
    fontFamily: 'Inter',
    fontWeight: '400',
    lineHeight: scaler(24),
  },
  contentContainer: {
    flex: 1,
    padding: scaler(24),
  },
});

export default Card;
