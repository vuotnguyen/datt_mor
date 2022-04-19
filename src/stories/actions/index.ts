import * as Auth from './auth';
import * as ConstructionAction from './construction'
import * as ImageAction from './image';
import * as UserAction from './user';
import * as AllUserAction from './infoallUser';

export interface IAction {
  payload: any;
  type: string | number;
}
export const createAction = (type: string, payload: any) => {
  return {
    type: type,
    payload: payload,
  };
};
export {Auth, ImageAction, UserAction, AllUserAction, ConstructionAction};
