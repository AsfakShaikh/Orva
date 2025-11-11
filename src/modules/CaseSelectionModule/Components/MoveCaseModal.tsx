import InputSelect from '@components/InputSelect';
import useEventEmitter, { emitEvent } from '@hooks/useEventEmitter';
import { Strings } from '@locales/Localization';
import React, { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Portal, Text } from 'react-native-paper';
import useGetOtsListQuery from '../Hooks/useGetOtsListQuery';
import useAuthValue from '@modules/AuthModule/Hooks/useAuthValue';
import { theme } from '@styles/Theme';
import scaler from '@utils/Scaler';
import Button from '@components/Button';
import { StyleSheet, View } from 'react-native';
import { CASE_DETAIL, CASE_LIST_ITEM, CASE_SUBMITTED } from '../Types/CommonTypes';
import usemoveCaseMutation from '../Hooks/useMoveCaseMutation';
import { MOVE_CASE_REQUEST } from '../Types/RequestTypes';
import { BottomSnackbarHandler } from '@components/BottomSnackbar';
import useGetCaseByOtsQuery from '../Hooks/useGetCaseByOtsQuery';

const TOGGLE_MOVE_CASE_MODAL_EVENT = 'TOGGLE_MOVE_CASE_MODAL_EVENT';

export function toggleMoveCaseModal(_case?: CASE_DETAIL | CASE_SUBMITTED) {
  emitEvent(TOGGLE_MOVE_CASE_MODAL_EVENT, _case);
}

export default function MoveCaseModal() {
  const [visible, setVisible] = useState(false);
  const [caseDetail, setCaseDetail] = useState<CASE_LIST_ITEM | undefined>();

  useEventEmitter(TOGGLE_MOVE_CASE_MODAL_EVENT, (_case?: CASE_LIST_ITEM) => {
    setVisible(prev => !prev);
    _case && setCaseDetail(_case);
  });

  const { hospitalId, selectedOt, selectedOtsArr } = useAuthValue();

  const { control, watch, handleSubmit, reset } = useForm({
    defaultValues: {
      room: caseDetail?.otId,
    },
  });

  const otIdsString = useMemo(
    () =>
      selectedOtsArr?.map(ot => ot?.uuid)?.join(','),
    [selectedOtsArr],
  );

  const { refetch: refetchPlannedCaseList } = useGetCaseByOtsQuery({ otIds: otIdsString || "" })


  useEffect(() => {
    if (visible) {
      reset({
        room: caseDetail?.otId,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  const { data: otsListData, isLoading: isGettingOtsList } =
    useGetOtsListQuery(hospitalId);

  const { mutate: moveCaseMutation } = usemoveCaseMutation();

  const otsOptionsList = useMemo(
    () =>
      otsListData?.map((ot: any) => {
        let key = ot?.name;
        if (ot?.uuid === caseDetail?.otId) {
          key = `${ot?.name} (${Strings.current_room})`;
        }

        return {
          key: key,
          value: ot?.uuid,
        };
      }) ?? [],
    [otsListData, selectedOt?.uuid, caseDetail?.otId],
  );

  const moveCaseSubmit = (newOtId: string, caseDetail: CASE_LIST_ITEM) => {
    const payload: MOVE_CASE_REQUEST = {
      newOtId,
      caseDetail
    }

    const newOtDetail = otsListData?.find(ot => ot.uuid == newOtId);
    const oldOtDetail = otsListData?.find(ot => ot.uuid == caseDetail.otId);
    moveCaseMutation(payload, {
      onSuccess: () => {
        refetchPlannedCaseList()
        BottomSnackbarHandler.successToast({
          title: <Text style={{ fontSize: 16, color: theme.colors.foreground.primary }}>
            The selected case for Patient{' '}
            <Text style={{ fontWeight: 'bold' }}>MRN#{' '} {payload.caseDetail.patient?.mrn || ""}</Text> in{' '}
            <Text style={{ fontWeight: 'bold' }}>{oldOtDetail?.name}</Text> is moved to{' '}
            <Text style={{ fontWeight: 'bold' }}>{newOtDetail?.name}</Text>
          </Text>
        })
      },
      onError: () => {
        BottomSnackbarHandler.errorToast({
          title: <Text style={{ fontSize: 16, color: theme.colors.foreground.primary }}>
            The selected case for Patient{' '}
            <Text style={{ fontWeight: 'bold' }}>MRN#{' '} {payload.caseDetail.patient?.mrn || ""}</Text> in{' '}
            <Text style={{ fontWeight: 'bold' }}>{oldOtDetail?.name}</Text> was not moved to{' '}
            <Text style={{ fontWeight: 'bold' }}>{newOtDetail?.name}</Text>
          </Text>
        })
      }
    })
  }

  return (
    <Portal>
      {visible && (
        <View
          style={{
            flex: 1,
            backgroundColor: 'rgba(0,0,0,0.5)',
            justifyContent: 'center',
            alignItems: 'center',
          }}>
          <View style={styles.container}>
            <Text style={styles.header}>
              {Strings.Move_Case_to_Another_Room}
            </Text>

            <InputSelect
              control={control}
              name="room"
              label={Strings.Select_Room_Label}
              options={otsOptionsList}
              isGettingOptions={isGettingOtsList}
              selectedTrailingIcon="check"
              style={{ marginTop: scaler(18) }}
            />

            <Button
              style={{ marginTop: scaler(24), marginBottom: scaler(8) }}
              disabled={watch('room') === caseDetail?.otId}
              mode="contained"
              onPress={handleSubmit(() => {
                setTimeout(() => setVisible(false), 300);
                caseDetail &&
                  moveCaseSubmit(watch('room') || "", caseDetail)
              })}>
              {Strings.Move_Case}
            </Button>

            <Button onPress={() => setVisible(false)} mode="text">
              {Strings.Cancel}
            </Button>
          </View>
        </View>
      )}
    </Portal>

  );
}
const { colors } = theme;

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.background.primary,
    width: scaler(400),
    alignSelf: 'center',
    borderRadius: scaler(16),
    padding: scaler(16),
  },
  header: {
    textAlign: 'center',
    fontSize: scaler(18),
    fontWeight: 'bold',
  },
});
