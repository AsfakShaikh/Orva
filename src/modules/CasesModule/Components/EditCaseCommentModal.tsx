import Button from '@components/Button';
import InputText from '@components/InputText';
import SideModalDrawer, {
  SideModalDrawerBody,
} from '@components/SideModalDrawer';
import useEventEmitter, {emitEvent} from '@hooks/useEventEmitter';
import {Strings} from '@locales/Localization';
import {globalStyles} from '@styles/GlobalStyles';
import scaler from '@utils/Scaler';
import React, {useCallback, useMemo, useState} from 'react';
import {useForm} from 'react-hook-form';
import {StyleSheet, View} from 'react-native';
import Divider from '@components/Divider';
import {useTheme} from 'react-native-paper';
import {detectChange} from '@helpers/detectChange';
import useUpdateCaseMutation from '@modules/CaseSelectionModule/Hooks/useUpdateCaseMutation';
import {fireSaveAndMoveNextTimelineEvent} from '@screens/SubmitedCases/CaseDetailScreen';
import isNotNull from '@helpers/isNotNull';

const EDIT_CASE_COMMENT_MODAL_EVENT = 'EDIT_CASE_COMMENT_MODAL_EVENT';

interface EditCaseCommentModalProps {
  caseId?: number;
  comments?: string | null;
  timelineItemIndex?: number;
  isVisible?: boolean;
}

export const toggleEditCaseCommentModal = (
  data?: EditCaseCommentModalProps,
) => {
  emitEvent(EDIT_CASE_COMMENT_MODAL_EVENT, data);
};

const EditCaseCommentModal = () => {
  const {colors} = useTheme();
  const [visible, setVisible] = useState(false);
  const [detail, setDetail] = useState<EditCaseCommentModalProps>();
  const {timelineItemIndex, comments, caseId} = detail ?? {};
  const {mutate: updateCaseMutate, isPending: isUpdatingCase} =
    useUpdateCaseMutation(false);

  const {control, watch, reset, handleSubmit} = useForm();

  const onClose = useCallback(() => {
    reset();
    setVisible(false);
  }, [reset]);

  const setFormData = useCallback(
    (data?: EditCaseCommentModalProps) => {
      const formDefaultValues = {
        comments: data?.comments ?? '',
      };
      reset(formDefaultValues);
    },
    [reset],
  );

  useEventEmitter(
    EDIT_CASE_COMMENT_MODAL_EVENT,
    (data?: EditCaseCommentModalProps) => {
      setVisible(prev =>
        isNotNull(data?.isVisible) ? data?.isVisible : !prev,
      );
      setDetail(data);
      setFormData(data);
    },
  );

  const isSubmitDisabled = useMemo(() => {
    const isCommentsChanged = detectChange(comments, watch('comments'));
    return !watch('comments') || !isCommentsChanged || isUpdatingCase;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [watch('comments'), comments, isUpdatingCase]);

  const onSubmitSuccess = (
    val?: string | null,
    isSaveAndMoveNext?: boolean,
  ) => {
    onClose();
    setDetail(prev => ({
      ...prev,
      comments: val,
    }));
    if (isSaveAndMoveNext && isNotNull(timelineItemIndex)) {
      fireSaveAndMoveNextTimelineEvent(timelineItemIndex);
    }
  };

  const onSubmit = (isSaveAndMoveNext?: boolean) =>
    handleSubmit(val => {
      if (!caseId) {
        return;
      }
      updateCaseMutate(
        {
          caseId,
          comments: val.comments,
        },
        {
          onSuccess: res =>
            onSubmitSuccess(res?.data?.comments, isSaveAndMoveNext),
        },
      );
    })();

  return (
    <SideModalDrawer
      title={Strings.Edit_Comments}
      visible={visible}
      onClose={onClose}>
      <SideModalDrawerBody>
        {/* Content */}
        <InputText
          control={control}
          name="comments"
          label={Strings.Comments}
          multiline
          textAlignVertical="top"
          contentStyle={globalStyles.multilineInput}
          autoFocus
        />

        <Divider
          style={{
            marginHorizontal: scaler(-24),
            marginTop: scaler(64),
            marginBottom: scaler(16),
          }}
          backgroundColor={colors.outlineVariant}
        />

        {/* Buttons */}
        <View style={styles.btnContainer}>
          <Button
            onPress={() => onSubmit()}
            disabled={isSubmitDisabled}
            style={globalStyles.flex1}
            contentStyle={styles.btn}
            mode="contained">
            {Strings.Save_Changes}
          </Button>
          <Button
            onPress={() => onSubmit(true)}
            disabled={isSubmitDisabled}
            style={globalStyles.flex1}
            contentStyle={styles.btn}
            mode="outlined">
            {Strings.Save_and_Next}
          </Button>
        </View>
      </SideModalDrawerBody>
    </SideModalDrawer>
  );
};

export default EditCaseCommentModal;

const styles = StyleSheet.create({
  btnContainer: {
    flexDirection: 'row',
    gap: scaler(24),
    marginBottom: scaler(24),
  },

  btn: {
    height: scaler(40),
  },
});
