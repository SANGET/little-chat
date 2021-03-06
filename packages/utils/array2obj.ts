function array2obj(array: any[], objKey: string) {
  const res = {};
  array.forEach((item) => {
    res[item[objKey.toString()]] = item;
  });
  return res;
}

export default array2obj;
