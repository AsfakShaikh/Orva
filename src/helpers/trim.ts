const trim = (str: string | undefined) => {
  if (typeof str === 'string') {
    return str.trim();
  }
  return '';
};

export default trim;
