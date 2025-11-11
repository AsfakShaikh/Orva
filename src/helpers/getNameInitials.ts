export const getNameInitials = (firstName?: string, lastName?: string) => {
  if (firstName) {
    const initials =
      firstName?.slice(0, 1) + (lastName ? lastName?.slice(0, 1) : '');
    return initials.toUpperCase();
  }
  return '';
};
