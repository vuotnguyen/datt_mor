import {TypedUseSelectorHook, useDispatch, useSelector} from 'react-redux';
import {createStore, combineReducers, compose, applyMiddleware} from 'redux';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {persistStore, persistReducer} from 'redux-persist';
import thunk from 'redux-thunk';
import dataCache from './reducers/dataCache';
import dataModal from './reducers/modal';
import dataIndividualChat from './reducers/IndividualChat';
import dataImage from './reducers/image';
import dataAuth from './reducers/auth';
import dataUser from './reducers/user';
import dataAllUser from './reducers/infoallUser';
import dataAllGroup from './reducers/infoAllGroup';
import dataChat from './reducers/chat';
import dataGroupChat from './reducers/groupChat';
import dataMessageRoom, {persistMessagesConfig} from './reducers/message';

const rootReducer = combineReducers({
  dataCache,
  dataModal,
  dataAuth,
  dataIndividualChat,
  dataImage,
  dataUser,
  dataAllUser,
  dataChat,
  dataGroupChat,
  dataAllGroup,
  dataMessageRoom: persistReducer(persistMessagesConfig, dataMessageRoom),
});

export const store = createStore(rootReducer, compose(applyMiddleware(thunk)));
export const persistor = persistStore(store);
// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = typeof store.dispatch;

// Use throughout your app instead of plain `useDispatch` and `useSelector`
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
