import React, {Fragment, useMemo, useState} from 'react';
import {Strings} from '@locales/Localization';
import {Menu} from 'react-native-paper';
import {CASE_DETAIL, CASE_STATUS, CASE_SUBMITTED} from '../Types/CommonTypes';
import {toggleCaseDeleteModal} from './CaseDeleteModal';
import TableMenu from './TableMenu';
import {StyleSheet} from 'react-native';
import scaler from '@utils/Scaler';
import {toggleManualPatientEntryModal} from './ManualPatientEntryModal';
import {toggleCaseResetModal} from './CaseResetModal';
import { toggleMoveCaseModal } from './MoveCaseModal';
import {differenceInHours} from 'date-fns';

type CaseMenuProps = Readonly<{
  caseDetail: CASE_DETAIL | (CASE_SUBMITTED & {submitted: any});
}>;

const getIsCaseSubmittedType = (caseDetail: CASE_DETAIL | CASE_SUBMITTED) => {
  return 'caseId' in caseDetail;
};

export default function CaseMenu(Props: CaseMenuProps) {
  const {caseDetail} = Props;

  const [isMenuVisible, setIsMenuVisible] = useState(false);

  const caseId = 'id' in caseDetail ? caseDetail.id : caseDetail.caseId;
  const caseStatus = 'status' in caseDetail ? caseDetail.status : null;

  const isSubmitedCaseList = getIsCaseSubmittedType(caseDetail);

  const submittedTime =
    'actualEndTime' in caseDetail
      ? caseDetail.actualEndTime
      : caseDetail.submitted?.value;

  const isSubmitted24HoursAgo = submittedTime
    ? differenceInHours(new Date(), new Date(submittedTime)) >= 24
    : false;

  const {isDeleteDisabled, isResetDisabled, isMoveDisabled, isEditDisabled} =
    useMemo(() => {
      let disableObj = {
        isDeleteDisabled: false,
        isResetDisabled: true,
        isMoveDisabled: false,
        isEditDisabled: isSubmitted24HoursAgo,
      };

      switch (caseStatus) {
        case CASE_STATUS.SUBMITTED:
          disableObj.isDeleteDisabled = true;
          disableObj.isMoveDisabled = true;
          break;

        case CASE_STATUS.ACTIVE:
          disableObj.isMoveDisabled = true;
          disableObj.isResetDisabled = false;
          disableObj.isEditDisabled = true;
          break;

        default:
          break;
      }

      return disableObj;
    }, [caseStatus, isSubmitted24HoursAgo]);

  const menuItemArr = useMemo(() => {
    return [
      {
        title: Strings.Edit,
        disabled: isEditDisabled,
        onPress: () => {
          toggleManualPatientEntryModal(caseDetail);
        },
        hidden: false,
      },
      {
        title: Strings.Delete,
        disabled: isDeleteDisabled,
        onPress: () => {
          toggleCaseDeleteModal(caseId);
        },
        hidden: isSubmitedCaseList,
      },
      {
        title: Strings.Reset,
        disabled: isResetDisabled,
        onPress: () => {
          toggleCaseResetModal(caseId);
        },
        hidden: isSubmitedCaseList,
      },
      {
        title: Strings.Move,
        disabled: isMoveDisabled,
        onPress: () => {
          toggleMoveCaseModal(caseDetail)
        },
        hidden: isSubmitedCaseList,
      },
    ];
  }, [
    isDeleteDisabled,
    isEditDisabled,
    isSubmitedCaseList,
    isResetDisabled,
    isMoveDisabled,
    caseDetail,
    caseId,
  ]);

  return (
    <TableMenu
      isMenuVisible={isMenuVisible}
      setIsMenuVisible={setIsMenuVisible}>
      {menuItemArr.map(item => (
        <Fragment key={item?.title}>
          {item.hidden ? null : (
            <Menu.Item
              title={item.title}
              disabled={item.disabled}
              onPress={() => {
                setIsMenuVisible(false);
                item?.onPress?.();
              }}
              style={styles.menuItem}
            />
          )}
        </Fragment>
      ))}
    </TableMenu>
  );
}

const styles = StyleSheet.create({
  menuItem: {
    paddingHorizontal: scaler(16),
    paddingVertical: scaler(12),
  },
});
