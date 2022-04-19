export enum TypeToash {
  CUSTOM = 'custom',
  ERROR = 'error',
  INFO = 'info',
  SUCCESS = 'success',
  WARN = 'warn',
}

export interface IToast {
  isShow: boolean;
  type: ('custom' | 'error' | 'info' | 'success' | 'warn');
  title: string;
  message: string;
}
