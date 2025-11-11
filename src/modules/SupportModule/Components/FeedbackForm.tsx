import {View, StyleSheet} from 'react-native';
import React from 'react';
import {Text} from 'react-native-paper';
import {Strings} from '@locales/Localization';
import scaler from '@utils/Scaler';
import {useForm} from 'react-hook-form';
import InputText from '@components/InputText';
import Button from '@components/Button';
import useSubmitFeedbackMutation from '../Hooks/useSubmitFeedbackMutation';
import {globalStyles} from '@styles/GlobalStyles';
import InputRadio from '@components/InputRadio';

export default function FeedbackForm() {
  const {control, handleSubmit, watch, reset} = useForm({
    defaultValues: {
      text: '',
      type: '',
    },
  });

  const isFormNotFilled = !watch('text');

  const {mutate: submitFeedbackMutate, isPending: isSubmiting} =
    useSubmitFeedbackMutation(reset);

  return (
    <View style={globalStyles.flex1}>
      <Text style={styles.headerText}>
        {Strings.Have_feedback_Please_share}
      </Text>
      <View style={{marginVertical: scaler(16)}}>
        <InputRadio
          control={control}
          name="type"
          options={[
            {key: 'Urgent', value: 'Urgent'},
            {key: 'Feedback', value: 'Feedback'},
          ]}
        />
      </View>

      <View style={globalStyles.flex1}>
        <InputText
          control={control}
          name="text"
          label={Strings.Feedback_Label}
          placeholder={Strings.Feedback_Placeholder}
          multiline
          textAlignVertical="top"
          contentStyle={styles.inputText}
        />
      </View>

      <Button
        loading={isSubmiting}
        onPress={handleSubmit(val => {
          submitFeedbackMutate(val);
        })}
        disabled={isFormNotFilled || isSubmiting}
        style={{marginTop: scaler(24)}}
        mode="contained">
        {Strings.Submit_Feedback}
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  headerText: {
    fontSize: scaler(24),
    fontWeight: 'bold',
  },
  inputText: {justifyContent: 'flex-start', height: '100%'},
});
