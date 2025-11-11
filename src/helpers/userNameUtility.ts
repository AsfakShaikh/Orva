const getFirstCharAndLastFullName = (str?: string | null): string => {
  if (str && str.trim().length > 0) {
    const words = str.trim().split(' ');
    const firstChar = words[0].charAt(0).toUpperCase();
    const lastName = words[words.length - 1];
    const capitalizedLastName =
      lastName.charAt(0).toUpperCase() + lastName.slice(1);
    return `${firstChar}. ${capitalizedLastName}`;
  }
  return '';
};

export default getFirstCharAndLastFullName;
