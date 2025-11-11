import Modal from '@components/Modal';
import useEventEmitter, {emitEvent} from '@hooks/useEventEmitter';
import {Strings} from '@locales/Localization';
import {theme} from '@styles/Theme';
import scaler from '@utils/Scaler';
import React, {useCallback, useMemo, useState} from 'react';
import {View, Text, StyleSheet, TouchableOpacity} from 'react-native';
import {
  CASE_DELAY_OTHER_REASON_CODE,
  CASE_LATE_TYPE,
  DELAY_REASON,
} from '../Types/CommonTypes';
import {Icon, IconButton} from 'react-native-paper';
import {globalStyles} from '@styles/GlobalStyles';
import Button from '@components/Button';
import {useForm} from 'react-hook-form';
import InputText from '@components/InputText';
import FlatListView from '@components/FlatListView';
import Divider from '@components/Divider';
import useGetDelayReasonsListQuery from '../Hooks/useGetDelayReasonsListQuery';
import capitalize from '@helpers/capitalize';
import useSubmitDelayReasonMutation from '../Hooks/useSubmitDelayReasonMutation';
import {SUBMIT_DELAY_REASON_REQUEST} from '../Types/RequestTypes';

const {colors} = theme;

interface ReasonForLateModalProps {
  type: CASE_LATE_TYPE;
  caseId: number;
  startLateBy?: number;
  endLateBy?: number;
  isFirstCase?: boolean;
  onDelayReasonSubmit?: (cb?: () => void) => void;
}

const REASON_FOR_LATE_MODAL_EVENT = 'REASON_FOR_LATE_MODAL_EVENT';

export const toggleReasonForLateModal = (data: ReasonForLateModalProps) => {
  emitEvent(REASON_FOR_LATE_MODAL_EVENT, data);
};

const ReasonForLateModal = () => {
  const [visible, setVisible] = useState(false);
  const [isOtherReason, setIsOtherReason] = useState<boolean>(false);
  const [details, setDetails] = useState<ReasonForLateModalProps | undefined>();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [isReasonsSubmitted, setIsReasonsSubmitted] = useState({
    isStartSubmitted: false,
    isEndSubmitted: false,
  });

  const {
    onDelayReasonSubmit,
    type,
    isFirstCase,
    startLateBy,
    endLateBy,
    caseId,
  } = details ?? {};

  const isBoth = type === CASE_LATE_TYPE.BOTH;
  const isStart = (() => {
    if (isBoth && !isReasonsSubmitted.isStartSubmitted) {
      return true;
    }
    if (isBoth && !isReasonsSubmitted.isEndSubmitted) {
      return false;
    }
    return type === CASE_LATE_TYPE.START;
  })();

  const {
    mutate: submitDelayReason,
    isPending: isSubmitting,
    isSuccess: isSubmitReasonSuccess,
    reset: resetSubmitReason,
  } = useSubmitDelayReasonMutation();
  const {data: reasonsListData = [], isLoading} = useGetDelayReasonsListQuery();

  const reasonsList = useMemo(() => {
    return reasonsListData?.reduce((acc, itm) => {
      if (itm?.category === 'OTHER') {
        return acc;
      }
      if (isFirstCase && itm?.whenToShow === 'NON_FIRST_CASES') {
        return acc;
      }
      if (isStart && itm?.caseTiming === CASE_LATE_TYPE.END) {
        return acc;
      }
      if (!isStart && itm?.caseTiming === CASE_LATE_TYPE.START) {
        return acc;
      }
      acc[itm?.category] = [...(acc[itm?.category] ?? []), itm];
      return acc;
    }, {} as Record<string, DELAY_REASON[]>);
  }, [reasonsListData, isFirstCase, isStart]);

  const lateBy = useMemo(() => {
    let val = isStart ? startLateBy ?? 0 : endLateBy ?? 0;
    return Math.round(val);
  }, [isStart, startLateBy, endLateBy]);

  useEventEmitter(REASON_FOR_LATE_MODAL_EVENT, data => {
    setVisible(prev => !prev);
    setDetails(data);
  });

  const updateSubmitStatus = () => {
    if (isBoth) {
      setIsReasonsSubmitted(prev => ({
        isStartSubmitted: isStart ? true : prev.isStartSubmitted,
        isEndSubmitted: isStart ? prev.isEndSubmitted : true,
      }));

      isReasonsSubmitted?.isStartSubmitted && setVisible(false);
      reset();
    }
  };

  const {control, handleSubmit, setValue, watch, reset} = useForm({
    defaultValues: {
      reason:
        details?.isFirstCase && !isStart
          ? 'LATE_START_CAUSED_LATE_COMPLETION'
          : '',
      otherReason: '',
    },
  });

  const submitReason = useCallback(
    (payload: SUBMIT_DELAY_REASON_REQUEST) => {
      submitDelayReason(payload, {
        onSuccess: () => {
          if ((isBoth && !isStart) || !isBoth) {
            onDelayReasonSubmit?.(() => {
              updateSubmitStatus();
            });
          } else {
            resetSubmitReason();
            updateSubmitStatus();
          }
        },
      });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [isBoth, isStart],
  );

  const onSubmit = handleSubmit(val => {
    if (!caseId || !type) {
      return;
    }

    let reasonCode = val?.reason;
    if (isOtherReason) {
      reasonCode = isStart
        ? CASE_DELAY_OTHER_REASON_CODE.OTHER_START
        : CASE_DELAY_OTHER_REASON_CODE.OTHER_END;
    }

    submitReason({
      caseId,
      delayType: isStart ? CASE_LATE_TYPE.START : CASE_LATE_TYPE.END,
      reasonCode,
      customReasonText: isOtherReason ? val?.otherReason : null,
      delayDurationMinutes: lateBy,
    });
  });

  const onSkip = () => {
    if (!caseId || !type) {
      return;
    }

    submitReason({
      caseId,
      delayType: isStart ? CASE_LATE_TYPE.START : CASE_LATE_TYPE.END,
      reasonCode: isStart
        ? CASE_DELAY_OTHER_REASON_CODE.OTHER_START
        : CASE_DELAY_OTHER_REASON_CODE.OTHER_END,
      customReasonText: 'Skipped',
      delayDurationMinutes: lateBy,
    });
  };

  const isSubmitEnabled =
    !isSubmitting &&
    (isOtherReason ? watch('otherReason') : watch('reason')) &&
    !isSubmitReasonSuccess;

  return (
    <Modal visible={visible}>
      <View style={styles.container}>
        {/* Heading */}
        <View style={[globalStyles.center]}>
          <Text style={styles.heading}>
            {isStart
              ? Strings.Reason_for_Late_Start
              : Strings.Reason_for_Late_End}
            <Text style={styles.boldText}>
              {isBoth && ` (${isStart ? 1 : 2}/2)`}
            </Text>
          </Text>
          <IconButton
            size={scaler(22)}
            onPress={() => setVisible(false)}
            style={styles.closeIcon}
            icon="close"
          />
        </View>

        {/* Subheading */}
        <Text style={styles.subheading}>
          <Text>
            {isStart
              ? Strings.Case_started_late_by
              : Strings.Case_ended_late_by}
          </Text>
          <Text style={styles.lateTimeText}>{` ${Math.round(
            lateBy,
          )} mins. `}</Text>
          <Text>{Strings.Help_us_understand_why}</Text>
        </Text>

        {/* Reason Selection */}
        <View style={styles.reasonOptionContainer}>
          <Text style={styles.subheading}>
            {isOtherReason ? Strings.Other_reason : Strings.Select_reason}:
          </Text>
          <Text
            onPress={() => setIsOtherReason(prev => !prev)}
            style={styles.reasonOptionText}>
            {isOtherReason ? Strings.Select_reason : Strings.Other_reason}
          </Text>
        </View>

        <View style={{height: isOtherReason ? scaler(116) : scaler(224)}}>
          {isOtherReason && (
            <InputText
              control={control}
              name="otherReason"
              label={Strings.Other_Reasons_Label}
              placeholder={Strings.Other_Reasons_Placeholder}
              multiline
              textAlignVertical="top"
              contentStyle={styles.inputText}
            />
          )}
          {!isOtherReason && (
            <>
              {!isLoading && (
                <View style={[globalStyles.rowCenter, styles.reasonsBar]}>
                  {Object.keys(reasonsList)?.map((itm, indx) => {
                    if (!selectedCategory && indx === 0) {
                      setSelectedCategory(itm);
                    }
                    const isSelected = selectedCategory === itm;
                    return (
                      <Button
                        key={itm}
                        mode={isSelected ? 'contained' : 'text'}
                        contentStyle={{
                          height: scaler(28),
                        }}
                        compact
                        labelStyle={[
                          styles.reasonBtnLabel,
                          {
                            color: isSelected
                              ? colors.foreground.inverted
                              : colors.foreground.primary,
                          },
                        ]}
                        onPress={() => {
                          if (!isSelected) {
                            setSelectedCategory(itm);
                          }
                        }}>
                        {capitalize(itm)}
                      </Button>
                    );
                  })}
                </View>
              )}
              <FlatListView
                isLoading={isLoading}
                data={selectedCategory ? reasonsList[selectedCategory] : []}
                renderItem={({item}) => {
                  const isSelected = watch('reason') === item?.reasonCode;
                  return (
                    <TouchableOpacity
                      onPress={() => setValue('reason', item?.reasonCode)}
                      style={[globalStyles.row, styles.reasonText]}>
                      <Icon
                        source={
                          isSelected ? 'radiobox-marked' : 'radiobox-blank'
                        }
                        color={
                          isSelected
                            ? colors.foreground.brand
                            : colors.foreground.primary
                        }
                        size={scaler(18)}
                      />
                      <Text style={{color: colors.foreground.primary}}>
                        {item?.reasonName}
                      </Text>
                    </TouchableOpacity>
                  );
                }}
                ItemSeparatorComponent={renderItemSeperator}
              />
            </>
          )}
        </View>

        {/* Button Group */}
        <View style={[globalStyles.rowCenter]}>
          <Button
            disabled={isSubmitting}
            onPress={onSkip}
            contentStyle={styles.btn}
            style={globalStyles.flex1}>
            {Strings.Skip}
          </Button>
          <Button
            loading={isSubmitting}
            disabled={!isSubmitEnabled}
            onPress={onSubmit}
            contentStyle={styles.btn}
            style={globalStyles.flex1}>
            {Strings.Submit}
          </Button>
        </View>
      </View>
    </Modal>
  );
};

export default ReasonForLateModal;

const renderItemSeperator = () => {
  return (
    <Divider
      style={{marginVertical: scaler(4)}}
      backgroundColor={colors.border.inactive}
    />
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: scaler(24),
    backgroundColor: 'rgba(236, 230, 240, 1)',
    padding: scaler(24),
    gap: scaler(16),
  },
  heading: {
    fontSize: scaler(22),
    color: colors.foreground.primary,
  },
  subheading: {
    fontSize: scaler(14),
    color: colors.foreground.secondary,
  },
  reasonOptionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  reasonOptionText: {
    fontSize: scaler(14),
    color: colors.foreground.brand,
    textDecorationLine: 'underline',
  },
  reasonText: {
    gap: scaler(12),
    padding: scaler(8),
    alignItems: 'center',
  },
  lateTimeText: {
    fontWeight: 'bold',
  },
  closeIcon: {
    position: 'absolute',
    right: scaler(-12),
  },
  btn: {
    height: scaler(40),
  },
  inputText: {justifyContent: 'flex-start', height: '100%'},
  reasonsBar: {
    borderRadius: scaler(42),
    backgroundColor: colors.background.primary,
    padding: scaler(2),
    marginBottom: scaler(8),
  },
  reasonBtnLabel: {
    marginVertical: scaler(0),
    fontSize: scaler(14),
    lineHeight: scaler(18),
    fontFamily: 'Inter-Regular',
  },
  boldText: {
    fontWeight: '700',
  },
});
