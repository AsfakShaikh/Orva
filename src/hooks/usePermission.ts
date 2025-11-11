/* eslint-disable react-hooks/exhaustive-deps */
import {OptionalLocaleString, Strings} from '@locales/Localization';
import {useCallback} from 'react';
import {Linking} from 'react-native';
import {
  Permission,
  request,
  requestMultiple,
  PermissionStatus,
  RESULTS,
} from 'react-native-permissions';
import {BottomSnackbarHandler} from '@components/BottomSnackbar';

export default function usePermission() {
  const requestPermission = useCallback(
    async (
      permission: Permission,
      label: OptionalLocaleString,
      onSuccess?: () => void,
      mandatory: boolean = false,
      onError?: (result: PermissionStatus) => void,
      errorTitle?: string,
      errorMessage?: string,
    ) => {
      let isPermissionAllowed = false;
      try {
        const result = await request(permission);
        switch (result) {
          case RESULTS.GRANTED:
            isPermissionAllowed = true;
            onSuccess?.();
            break;
          case RESULTS.DENIED:
            if (mandatory) {
              requestPermission(
                permission,
                label,
                onSuccess,
                mandatory,
                onError,
                errorTitle,
                errorMessage,
              );
            }
            break;

          case RESULTS.BLOCKED:
            onError?.(result);
            if (mandatory) {
              BottomSnackbarHandler.errorToast({
                title: errorTitle ?? `Not ${label} Access`,
                description:
                  errorMessage ??
                  `${label} permission is blocked, please enable in the phone settings`,
                actionBtnDetails: {
                  label: Strings.Open_Settings,
                  onPress: Linking.openSettings,
                },
              });
            }
            break;

          case RESULTS.LIMITED:
            onError?.(result);
            BottomSnackbarHandler.errorToast({
              title: errorTitle ?? `Not ${label} Access`,
              description: errorMessage ?? `${label} permission is limited`,
            });
            break;

          case RESULTS.UNAVAILABLE:
            onError?.(result);
            BottomSnackbarHandler.errorToast({
              title: errorTitle ?? `Not ${label} Access`,
              description: errorMessage ?? `${label} permission is unavailable`,
            });
            break;

          default:
            break;
        }
      } catch (error) {}

      return isPermissionAllowed;
    },
    [],
  );

  const requestMultiplePermission = useCallback(
    async (
      permissionsList: Array<{
        permission: Permission;
        label: OptionalLocaleString;
        mandatory?: boolean;
        onError?: (result: PermissionStatus) => void;
        errorTitle?: string;
        errorMessage?: string;
      }>,
      onSuccess?: () => void,
    ) => {
      let isPermissionsAllowed = false;
      try {
        const result = await requestMultiple(
          permissionsList.map(({permission}) => permission),
        );

        let mandatoryPermissionList = permissionsList.filter(
          ({mandatory}) => mandatory,
        );

        let totalMandatoryPermissions = mandatoryPermissionList.length;
        let approvedMandatoryPermissions = 0;

        permissionsList.forEach(
          ({
            permission,
            label,
            mandatory,
            onError,
            errorTitle,
            errorMessage,
          }) => {
            switch (result[permission]) {
              case RESULTS.GRANTED:
                approvedMandatoryPermissions++;
                break;
              case RESULTS.DENIED:
                if (mandatory) {
                  requestPermission(permission, label);
                }
                break;
              case RESULTS.BLOCKED:
                onError?.(result[permission]);
                if (mandatory) {
                  BottomSnackbarHandler.errorToast({
                    title: errorTitle ?? `Not ${label} Access`,
                    description:
                      errorMessage ??
                      `${label} permission is blocked, please enable in the phone settings`,
                    actionBtnDetails: {
                      label: Strings.Open_Settings,
                      onPress: Linking.openSettings,
                    },
                  });
                  return false;
                }
                break;
              case RESULTS.LIMITED:
                onError?.(result[permission]);
                BottomSnackbarHandler.errorToast({
                  title: errorTitle ?? `Not ${label} Access`,
                  description: errorMessage ?? `${label} permission is limited`,
                });
                break;

              case RESULTS.UNAVAILABLE:
                onError?.(result[permission]);
                BottomSnackbarHandler.errorToast({
                  title: errorTitle ?? `Not ${label} Access`,
                  description:
                    errorMessage ?? `${label} permission is unavailable`,
                });
                break;

              default:
                break;
            }
          },
        );

        if (totalMandatoryPermissions === approvedMandatoryPermissions) {
          isPermissionsAllowed = true;
          onSuccess?.();
        }
      } catch (error) {}

      return isPermissionsAllowed;
    },
    [],
  );

  return {requestPermission, requestMultiplePermission};
}
