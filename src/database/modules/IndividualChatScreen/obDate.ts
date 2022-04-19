export const NAME_SCHEMA = 'IndividualChat/ObDate';
export type ObDateType = {
  date: string;
  showed: boolean;
};
export const ObDateSchema = {
  name: NAME_SCHEMA,
  properties: {
    date: 'string',
    showed: 'bool',
  },
};
