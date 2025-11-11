import React, {useMemo} from 'react';
import {StyleSheet, Text, View} from 'react-native';
import InputSelect from '@components/InputSelect';
import {Strings} from '@locales/Localization';
import {theme} from '@styles/Theme';
import scaler from '@utils/Scaler';
import {useForm} from 'react-hook-form';
import useGetLanguagesQuery from '../Hooks/useGetLanguagesQuery';

const {colors} = theme;

interface SpeechRecognitionSettingsProps {
  languageId?: number;
  onLanguageChange?: (languageId: number) => void;
}

const SpeechRecognitionSettings = ({
  languageId,
  onLanguageChange,
}: SpeechRecognitionSettingsProps) => {
  const {data: languagesData, isLoading: isGettingLanguages} =
    useGetLanguagesQuery();

  const languagesList = useMemo(
    () =>
      languagesData?.map(language => ({
        key: language.name,
        value: language.id,
      })) ?? [],
    [languagesData],
  );

  const {control} = useForm({
    defaultValues: {
      nativeLanguage: languageId ?? '',
    },
  });
  return (
    <View>
      <Text style={styles.title}>{Strings.Speech_Recognition}</Text>
      <Text style={styles.desc}>{Strings.Speech_Recognition_Desc}</Text>
      <InputSelect
        control={control}
        name="nativeLanguage"
        options={languagesList}
        placeholder={Strings.Native_Language}
        isGettingOptions={isGettingLanguages}
        style={styles.nativeLanguageInput}
        onSelect={val => {
          onLanguageChange?.(val);
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  title: {
    fontSize: scaler(18),
    fontWeight: '700',
    lineHeight: scaler(24),
    color: colors.foreground.primary,
    marginBottom: scaler(6),
  },
  desc: {
    fontSize: scaler(12),
    lineHeight: scaler(18),
    color: colors.foreground.primary,
  },
  nativeLanguageInput: {
    marginTop: scaler(24),
  },
});

export default SpeechRecognitionSettings;
