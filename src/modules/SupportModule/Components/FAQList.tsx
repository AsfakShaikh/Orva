// Not Using - Unmark when start using
import {StyleSheet, View} from 'react-native';
import React from 'react';
import {Text} from 'react-native-paper';
import {Strings} from '@locales/Localization';
import scaler from '@utils/Scaler';
import {globalStyles} from '@styles/GlobalStyles';

export default function FAQList() {
  const faqList = [
    {
      question: 'What is ORVA?',
      answer:
        'ORVA stands for Operating Room Voice Assistant and its job is to help you save time so you can do the most important job - patient care. ORVA is a voice assistant that allows you to track key milestones by using your voice during a surgical procedure. These milestones are also shared back to operational teams to help make improvements for the care team.',
    },
    {
      question: 'What can ORVA do for me?',
      answer:
        'ORVA can help you track key operational milestones and timeout by just using your voice. You can speak to ORVA in a natural language way by saying things like “Hey ORVA, the procedure has started” to log incision start time. The milestones you can log are wheels in, anesthesia start, patient ready, procedure start, procedure end, ready to exit, wheels out, room clean, and room ready. ',
    },
  ];
  return (
    <View style={{marginTop: scaler(32), gap: scaler(20)}}>
      <Text variant="headlineSmall">{Strings.FAQ_Heading}</Text>
      {faqList.map(item => (
        <View key={item?.question}>
          <View style={styles.rowView}>
            <Text style={styles.question}>Q: </Text>
            <Text style={[styles.question, globalStyles.flex1]}>
              {item?.question}
            </Text>
          </View>
          <View style={styles.rowView}>
            <Text style={styles.answer}>A: </Text>
            <Text style={[styles.answer, globalStyles.flex1]}>
              {item?.answer}
            </Text>
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  question: {
    fontSize: scaler(16),
    fontWeight: 'bold',
  },
  answer: {
    fontSize: scaler(16),
    marginTop: scaler(4),
  },
  rowView: {
    flexDirection: 'row',
  },
});
