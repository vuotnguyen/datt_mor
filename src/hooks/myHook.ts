export const checkNull = (
  value: string | number | null,
  typeCheck: 'string' | 'number',
) => {
  return value ? value : typeCheck == 'string' ? '' : 0;
};

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
