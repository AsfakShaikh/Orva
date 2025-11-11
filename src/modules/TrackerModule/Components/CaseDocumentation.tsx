// ExpandableList.tsx
import ExpandableRow from '@modules/TrackerModule/Components/ExpandableRow';
import scaler from '@utils/Scaler';
import React, {forwardRef, useImperativeHandle} from 'react';
import {useForm} from 'react-hook-form';
import {ScrollView, StyleSheet} from 'react-native';
import CaseDocumentationLoader from './CaseDocumentationLoader';

interface CaseDocumentationProps {
  isSyncingDocumentation?: boolean;
}
const CaseDocumentation = forwardRef<any, CaseDocumentationProps>(
  ({isSyncingDocumentation}, ref) => {
    const items = [
      {
        id: 1,
        title: 'Anesthesia Type',
        entries: 2,
        data: [
          {
            id: 1,
            label: 'General Anesthesia',
            text: 'Voice note text to speech transcription',
            checked: true,
            timestamp: '12:20',
            user: 'Umer Ahmed',
            confidence: '100%',
            confidenceColor: '#000',
          },
          {
            id: 2,
            label: 'Spinal Anesthesia',
            checked: false,
            text: 'Voice note text to speech transcription',
            timestamp: '12:20',
            user: 'Umer Ahmed',
            confidence: '50%',
            confidenceColor: '#e58e26',
          },
        ],
      },
      {id: 2, title: 'Temperature Control', entries: 3},
      {id: 3, title: 'Patient Position', entries: 3},
      {id: 4, title: 'DVT Prevention', entries: 2},
      {id: 5, title: 'Head Support', status: 'Waiting for Entry'},
      {id: 6, title: 'Eye Support', status: 'Waiting for Entry'},
      {id: 7, title: 'Left Arm Position', status: 'Waiting for Entry'},
      {id: 8, title: 'Right Arm Position', status: 'Waiting for Entry'},
    ];

    const {handleSubmit, control} = useForm({
      defaultValues: {
        items: items.map(item => ({
          title: item.title,
          data: item.data?.map(d => ({checked: d.checked})) || [],
        })),
      },
    });

    const onSubmit = (data: any) => {
      console.log('Form Data:', data);

      const selectedItems = data.items
        .map((group: any, i: number) => ({
          title: items[i].title,
          selected: group.data
            ?.map((d: any, j: number) => ({
              ...items[i].data?.[j],
              checked: d.checked,
            }))
            ?.filter((x: any) => x?.checked),
        }))
        .filter((g: any) => g.selected?.length > 0);

      console.log(selectedItems);
    };

    useImperativeHandle(ref, () => ({
      submitForm: () => handleSubmit(onSubmit)(),
    }));

    if (isSyncingDocumentation) {
      return <CaseDocumentationLoader />;
    }

    return (
      <ScrollView
        style={styles.listContainer}
        showsVerticalScrollIndicator={false}
        nestedScrollEnabled={true}>
        {items.map((item, index) => {
          const {id, title, status, entries, data} = item;
          return (
            <ExpandableRow
              key={id}
              control={control}
              title={title}
              status={status}
              entries={entries}
              expandData={data}
              index={index}
            />
          );
        })}
      </ScrollView>
    );
  },
);

export default CaseDocumentation;

const styles = StyleSheet.create({
  listContainer: {
    marginVertical: scaler(10),
  },
});
