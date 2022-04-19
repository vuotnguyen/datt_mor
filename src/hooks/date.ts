import moment from 'moment';
export const useDate = () => {
  const getDayMonth = (
    createAt: string,
    type: 'ddMM' | 'MMdd',
    char: '.' | '_' | '/' | string,
  ): string => {
    return moment(createAt).format(
      type == 'ddMM' ? `DD${char}MM` : `MM${char}DD`,
    );
  };
  const getFullFormatDate = (
    createAt: string,
    type: 'ddMMYYYY' | 'YYYMMdd',
    char: '.' | '_' | '/' | string,
  ): string => {
    return moment(createAt).format(
      type === 'YYYMMdd' ? `YYYY${char}MM${char}DD` : `DD${char}MM${char}YYYY`,
    );
  };
  const checkDay = (createAt: string): 'today' | 'lastDay' | 'other' => {
    let currentDate = moment();
    let createAtDate = moment(createAt);

    if (createAtDate.format('MM') == currentDate.format('MM')) {
      let dateCreateAt = parseInt(createAtDate.format('DD'));
      let dateCurrent = currentDate.format('DD');
      if (dateCurrent == dateCreateAt) {
        return 'today';
      } else if (dateCurrent - 1 == dateCreateAt) {
        return 'lastDay';
      }
    }
    // if (current.getDate() === d.getDate()) {
    //   return 'today';
    // } else if (current.getDate() - 1 === d.getDate()) {
    //   return 'lastDay';
    // }
    return 'other';
  };
  const getTime = (createAt: string): string => {
    let d = new Date(createAt);

    return moment(createAt).format('HH:mm');
  };
  const isCurrentYear = (createAt: string): boolean => {
    return moment(new Date()).format('YYYY') == moment(createAt).format('YYYY');
  };

  const getFullYearJapanFormat = (createAt: string) => {
    return moment(createAt).format('YYYY年MM月DD日');
  };

  const getCreateAtChatBoxView = (createAt: string) => {
    let result = '';

    if (isCurrentYear(createAt)) {
      switch (checkDay(createAt)) {
        case 'today': {
          result = getTime(createAt);
          break;
        }
        case 'lastDay': {
          result = '昨日';
          break;
        }
        default: {
          result = getDayMonth(createAt, 'MMdd', '/');
          break;
        }
      }
    } else {
      result = getFullFormatDate(createAt, 'YYYMMdd', '/');
    }

    return result;
  };
  const getCreateAtHead = (createAt: string) => {
    let result = '';
    if (isCurrentYear(createAt)) {
      switch (checkDay(moment(createAt))) {
        case 'today': {
          result = '今日';
          break;
        }
        case 'lastDay': {
          result = '昨日';
          break;
        }
        default: {
          result = getDayMonth(createAt, 'MMdd', '/');
          break;
        }
      }
    } else {
      result = getFullYearJapanFormat(createAt);
    }

    return result;
  };
  const getDate = (a: Date) => {
    return `${a.getDate()}/${a.getMonth()}/${a.getFullYear()}`;
  };
  const compareDate = (dateA: string, dateB: string) => {
    let a = new Date(dateA);
    let b = new Date(dateB);

    if (getDate(a) !== getDate(b)) {
      return false;
    } else {
      return true;
    }
  };

  return {
    getDayMonth,
    isCurrentYear,
    getFullFormatDate,
    checkDay,
    getTime,
    getCreateAtHead,
    getCreateAtChatBoxView,
    compareDate,
    getDate,
  };
};
