import useGetAllUserListQuery from '@modules/CaseSelectionModule/Hooks/useGetAllUserListQuery';
import {NOTIFICATION_RECIPIENT_TYPE} from '../Types/CommonTypes';
import useGetUserRolesQuery from '@modules/CaseSelectionModule/Hooks/useGetUserRolesQuery';
import useGetUserListByRoleQuery from '@modules/CaseSelectionModule/Hooks/useGetUserListByRoleQuery';
import {useMemo} from 'react';
import trim from '@helpers/trim';
import useGetUserRoleDeptMappingQuery from '@modules/CaseSelectionModule/Hooks/userGetUserRoleDeptMappingQuery';

type UseGetSendSmsDrawerDetailsProps = {
  activeTab: NOTIFICATION_RECIPIENT_TYPE;
  selectedRole: string | null;
  selectedDepartment: string | null;
};

function useGetSendSmsDrawerDetails({
  activeTab,
  selectedRole,
  selectedDepartment,
}: UseGetSendSmsDrawerDetailsProps) {
  const {data: users, isLoading: isLoadingUsers} = useGetAllUserListQuery(
    activeTab === NOTIFICATION_RECIPIENT_TYPE.USER,
  );

  const {data: roleDeptMappingList, isLoading: isLoadingRoleDeptMapping} =
    useGetUserRoleDeptMappingQuery(
      activeTab === NOTIFICATION_RECIPIENT_TYPE.DEPARTMENT,
    );

  const {data: rolesList, isLoading: isLoadingRolesList} = useGetUserRolesQuery(
    activeTab === NOTIFICATION_RECIPIENT_TYPE.ROLE,
  );

  const roleDeptMappedObj = useMemo(() => {
    return roleDeptMappingList?.reduce((acc, curr) => {
      if (acc[curr.department]) {
        acc[curr.department].push(curr.role);
      } else {
        acc[curr.department] = [curr.role];
      }
      return acc;
    }, {} as Record<string, Array<string>>);
  }, [roleDeptMappingList]);

  const finalSelectedRole: Array<string> | null = useMemo(() => {
    if (activeTab === NOTIFICATION_RECIPIENT_TYPE.ROLE && selectedRole) {
      return [selectedRole];
    }
    if (
      activeTab === NOTIFICATION_RECIPIENT_TYPE.DEPARTMENT &&
      selectedDepartment
    ) {
      return roleDeptMappedObj?.[selectedDepartment] ?? null;
    }
    return null;
  }, [activeTab, selectedRole, selectedDepartment, roleDeptMappedObj]);

  const {data: usersByRole, isLoading: isLoadingUsersByRole} =
    useGetUserListByRoleQuery(finalSelectedRole ?? null);

  const usersOptionsList = useMemo(() => {
    const userList =
      activeTab === NOTIFICATION_RECIPIENT_TYPE.USER ? users : usersByRole;

    if (!userList) {
      return [];
    }
    return userList?.map(user => ({
      key: `${user.firstName} ${user.lastName}`,
      value: user.id,
      id: user.id,
      first_name: user.firstName,
      last_name: user.lastName,
      role: user.role,
      department: '',
      phoneNumber:
        trim(user?.notificationConfig?.countryCode) +
        trim(user?.notificationConfig?.phoneNumber),
    }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, users, usersByRole]);

  const departmentOptionsList = useMemo(() => {
    if (!roleDeptMappedObj) {
      return [];
    }
    return Object.keys(roleDeptMappedObj).map(department => ({
      key: department,
      value: department,
    }));
  }, [roleDeptMappedObj]);

  const rolesOptionsList = useMemo(() => {
    if (!rolesList) {
      return [];
    }
    return rolesList?.map(role => ({
      key: role,
      value: role,
    }));
  }, [rolesList]);

  const isLoadingUsersList = useMemo(() => {
    return isLoadingUsers || isLoadingUsersByRole;
  }, [isLoadingUsers, isLoadingUsersByRole]);

  return {
    isLoadingRolesList,
    isLoadingUsersList,
    isLoadingDepartmentList: isLoadingRoleDeptMapping,
    usersOptionsList,
    rolesOptionsList,
    departmentOptionsList,
  };
}

export default useGetSendSmsDrawerDetails;
