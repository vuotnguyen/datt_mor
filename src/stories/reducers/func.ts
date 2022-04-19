export const PaginationFunc = <T>(arr: Array<T>, itemPerPage: number) => {
  let list = arr;
  let listPagination: Array<T[]> = [];
  let totalPages = Math.round(list.length / itemPerPage);
  for (let i = 1; i <= totalPages; i++) {
    const indexOfLast = i * itemPerPage;
    const indexOfFirst = indexOfLast - itemPerPage;
    const listItem = list.slice(indexOfFirst, indexOfLast);
    listPagination.push(listItem);
  }
  return {
    listPagination,
    totalPages,
  };
};

export const convertSpecialKeyWebsocket = (str: string) => {
  let value = str;
  value.replace('CR#', '');
  value.replace('USER#', '');
  return value;
};
