import React, {useEffect, useMemo} from 'react';
import {Strings} from '@locales/Localization';
import scaler from '@utils/Scaler';
import {useForm} from 'react-hook-form';
import InputSelect from '@components/InputSelect';
import useAuthValue, {
  updateAuthValue,
} from '@modules/AuthModule/Hooks/useAuthValue';
import Button from '@components/Button';
import useGetOtsListQuery from '../Hooks/useGetOtsListQuery';
import {useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {MainStackParamList} from '@navigation/Types/CommonTypes';
import {HOME_DRAWER_ROUTE_NAME, MAIN_STACK_ROUTE_NAME} from '@utils/Constants';
import {USER_SELECTED_OT} from '@modules/AuthModule/Types/CommonTypes';
import useGetHospitalConfigQuery from '@modules/AuthModule/Hooks/useGetHospitalConfigQuery';
import useGetActiveCasesQuery from '../Hooks/useGetActiveCasesQuery';
import useGetUserConfigQuery from '@modules/AuthModule/Hooks/useGetUserConfigQuery';
import useKnockoutMutation from '@modules/AuthModule/Hooks/useKnockOutMutation';
import {toggleUserConsentModal} from '@components/userPermissionAlert';
import useGetTenantLogoQuery from '@modules/AuthModule/Hooks/useGetTenantLogoQuery';

export default function OtSelectionForm() {
  const {replace} =
    useNavigation<
      NativeStackNavigationProp<
        MainStackParamList,
        MAIN_STACK_ROUTE_NAME.OT_SELECTION
      >
    >();
  const {control, watch} = useForm({
    defaultValues: {
      location_id: '',
    },
  });
  const {hospitalId, firstName} = useAuthValue();

  const {data: hospitalDetail} = useGetHospitalConfigQuery(hospitalId);
  const {data: userDetail} = useGetUserConfigQuery();
  const {data: tenantLogo} = useGetTenantLogoQuery();
  const {data: otsListData, isLoading: isGettingOtsList} =
    useGetOtsListQuery(hospitalId);
  const {data: activeCasesList, isLoading: isGettingActiveCases} =
    useGetActiveCasesQuery();

  const {mutate: knockOutMuate} = useKnockoutMutation(() => {
    updateAuthValue({
      selectedOt,
    });
    if (!selectedOt?.caseId && !selectedOt?.mrn) {
      replace(MAIN_STACK_ROUTE_NAME.HOME_DRAWER, {
        isContinueWithActiveCase: false,
      });
    }
  });

  const updatedOtsListData: Array<USER_SELECTED_OT> = useMemo(
    () =>
      otsListData?.map(ot => {
        const {caseId, username, userId, mrn, currentMilestone} =
          activeCasesList?.find(({otId}) => otId === ot?.uuid) ?? {};

        return {
          ...ot,
          caseId,
          username,
          userId,
          mrn,
          currentMilestone,
          isCaseboardOnly: false,
        };
      }) ?? [],
    [activeCasesList, otsListData],
  );
  const otsOptionsList = useMemo(
    () =>
      updatedOtsListData?.map((ot: USER_SELECTED_OT) => {
        const {caseId, name, username, mrn, uuid} = ot ?? {};
        let key = name ?? 'key';
        if (caseId && mrn) {
          if (username) {
            key = `${name} ${username} case active MRN ${mrn}`;
          } else {
            key = `${name} Active case MRN ${mrn}`;
          }
        }

        return {
          key: key,
          value: uuid,
        };
      }) ?? [],
    [updatedOtsListData],
  );
  const selectedOt: USER_SELECTED_OT | undefined = useMemo(
    () => {
      if (watch('location_id') === Strings.Caseboard) {
        return {
          name: 'CB',
          isCaseboardOnly: true,
        };
      }
      const data = updatedOtsListData?.find(
        ot => ot?.uuid === watch('location_id'),
      );
      return data;
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [updatedOtsListData, watch('location_id')],
  );

  useEffect(() => {
    updateAuthValue({
      hospitalTimeZone: hospitalDetail?.timeZone,
      hospitalName: hospitalDetail?.name,
      hospitalRegion: hospitalDetail?.state,
      user: userDetail,
      tenantLogo: tenantLogo?.url,
    });
  }, [
    selectedOt,
    hospitalDetail?.timeZone,
    userDetail,
    tenantLogo?.url,
    hospitalDetail?.name,
    hospitalDetail?.state,
  ]);
  const handleOTSelection = async () => {
    if (selectedOt?.isCaseboardOnly) {
      updateAuthValue({
        selectedOt,
        selectedOtsArr: otsListData?.map(ot => ({
          uuid: ot?.uuid,
          name: ot?.name,
        })),
      });
      replace(MAIN_STACK_ROUTE_NAME.HOME_DRAWER, {
        screen: HOME_DRAWER_ROUTE_NAME.CASEBOARD,
      });
    } else {
      try {
        const {username} =
          activeCasesList?.find(({otId}) => otId === selectedOt?.uuid) ?? {};
        if (username && username !== firstName && selectedOt) {
          const title = `${username} already logged in to ${selectedOt?.name}`;
          const message = `If you proceed, ${username} will be kicked out of ${selectedOt?.name}. Would you like to take over ${selectedOt?.name}?`;
          toggleUserConsentModal({
            title,
            message,
            onConfirm: () => {
              knockOutMuate(selectedOt?.uuid);
            },
          });
        } else if (selectedOt?.uuid) {
          knockOutMuate(selectedOt.uuid);
        }
      } catch (error: any) {
        console.log(error.message);
      }
    }
  };
  return (
    <>
      <InputSelect
        options={[
          ...otsOptionsList,
          {key: Strings.Caseboard, value: Strings.Caseboard},
        ]}
        name="location_id"
        control={control}
        label={Strings.Select_Room_Label}
        isGettingOptions={isGettingOtsList || isGettingActiveCases}
        style={{marginTop: scaler(18)}}
        isLabelDefaultBehaviour={false}
      />
      <Button
        style={{marginTop: scaler(18)}}
        disabled={!watch('location_id')}
        mode="contained"
        onPress={handleOTSelection}>
        {Strings.Confirm}
      </Button>
    </>
  );
}
