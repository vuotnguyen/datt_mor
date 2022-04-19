import React, {memo, useCallback, useRef, useState} from 'react';
import {
  Dimensions,
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {Auth} from 'aws-amplify';
import {useAppDispatch, useAppSelector} from '../../stories';
import {CustomButton} from '../../components/buttons';
import * as stylesGlobal from '../../styles';
import * as globalStyles from '../../styles';
import {colors} from '../../styles';

import ModalConfirm from '../../components/common/ModalConfirm';
import {createAction, UserAction} from '../../stories/actions';
import {common, dataCache, modal, user} from '../../stories/types';
import {useDispatch} from 'react-redux';
import {SafeAreaView} from 'react-native-safe-area-context';
import MESSAGES from '../../config/Messages';
import COLORS from '../../styles/colors';
import ImageResView from '../../components/organisms/ImageResView/ImageMasonry';
import LoadingMansoryV2 from '../../components/organisms/MasonryList/LoadingMansoryV2';

import {connectDB} from '../../database';
import {ProfileSchemaOp} from '../../database/modules/ProfileScreen';
import AvatarHandle from './AvatarHandle';
import {ProfileSchemaType} from '../../database/modules/ProfileScreen/profileSchema';
import {getUserInfoPaging} from '../../services/user';
import {IImageProfile} from '../../models/image';
import {LastEvaluatedKeyImage} from '../../models/chat';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ChatDBHelperInstance } from '../../database/DatabaseHelper';
import {
  useNavigation,
  useScrollToTop,
  useFocusEffect,
  StackActions,
} from '@react-navigation/native';
import {MAIN_TAB} from '../../navigations/MainTab';

const {height, width} = Dimensions.get('screen');
const ProfileUserScreen = (): JSX.Element => {
  const [count, setCount] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(false);
  const {UserInfo, myAlbum} = useAppSelector(state => state.dataUser);
  const [refresh, setRefresh] = useState<boolean>(false);
  const navigation = useNavigation();

  const dispatchThunk = useDispatch();
  const dispatchLocal = useAppDispatch();
  const FlatlistRef = useRef<FlatList | any>();
  useScrollToTop(FlatlistRef);
  useFocusEffect(
    useCallback(() => {
      dispatchLocal(
        createAction(dataCache.SET_SCREEN_NAVIGATION, MAIN_TAB.Profile),
      );
      fetchData();
    }, []),
  );

  const signOut = async () => {
    try {
      const storeData = async (userid: string) => {
        try {
          await AsyncStorage.setItem('@userid', userid);
        } catch (e) {
          // saving error
        }
      };
      storeData('');
      await ChatDBHelperInstance.deleteMessageLocal();
      await Auth.signOut();
      dispatchLocal(createAction(common.CLEAR_DATA, null));
      dispatchLocal(createAction(dataCache.SET_SCREEN_NAVIGATION, null));
      // navigation.navigate('Auth');
      console.log('logout');
      navigation.dispatch(   
        StackActions.replace('Auth') 
    );
    } catch (error) {
      console.log('error signing out: ', error);
    }
  };

  const fetchData = useCallback(() => {
    getDataProfileFromRealm();
  }, []);

  const getDataProfileFromRealm = async () => {
    let idUser = '';
    const getUserID = async () => {
      try {
        const value = await AsyncStorage.getItem('@userid');
        if (value !== null) {
          // value previously stored
          idUser = value;
        }
      } catch (e) {
        // error reading value
      }
    };
    await getUserID();
    console.log('idUser profile', idUser);
    const realmOpen = await connectDB();
    let lastKeyLocal: string = '';

    realmOpen.write(async () => {
      const profileLocal = realmOpen.objectForPrimaryKey<ProfileSchemaType>(
        ProfileSchemaOp.NAME_SCHEMA,
        idUser,
      );

      /**
       *  check exist image Date Before
       */
      if (profileLocal) {
        lastKeyLocal = profileLocal.lastKey;
        dispatchThunk(UserAction.fetchProfileLocalStorages(profileLocal));
        setRefresh(false);
      }

      try {
        const respone = await getUserInfoPaging(lastKeyLocal); //lastKeyLocal,);
        /**
         *  parse  respone data json to object
         */
        const resConvert = JSON.parse(JSON.stringify(respone));

        const newProfileArr: Array<IImageProfile> = [];

        if (
          resConvert.data.album_files &&
          resConvert.data.album_files.data.length
        ) {
          resConvert.data.album_files.data.map(
            (item: IImageProfile, index: number) => {
              let result: IImageProfile = {
                ...item,
              };
              //console.log("result", result)
              newProfileArr.push(result);
            },
          );
        }

        /**
         * handle last key from api respone
         */
        const LastEvaluatedKey: LastEvaluatedKeyImage =
          resConvert.data.album_files.LastEvaluatedKey;

        const lastKey =
          LastEvaluatedKey.id &&
          LastEvaluatedKey.gsi &&
          LastEvaluatedKey.create_at
            ? `${LastEvaluatedKey.id}%26${
                LastEvaluatedKey.gsi
              }%26${LastEvaluatedKey.create_at.replace(/:/g, '%3A')}`
            : '';
        //resConvert.data.LastEvaluatedKey;
        const profileUpdating = {
          id: idUser,
          email: resConvert.data.email,
          fullname: resConvert.data.fullname,
          username: resConvert.data.username,
          avatar: resConvert.data.avatar,
          address: resConvert.data.address,
          create_at: resConvert.data.create_at,
          album_files: newProfileArr,
          lastKey,
        };

        /**
         * connectDB data local and insert new room data
         */

        realmOpen.write(() => {
          const profileLocal = realmOpen.objectForPrimaryKey<ProfileSchemaType>(
            ProfileSchemaOp.NAME_SCHEMA,
            idUser,
          );

          if (profileLocal) {
            /**
             * if exist update room
             */
            profileUpdating.album_files.map(m => {
              let idx = profileLocal.album_files.findIndex(
                mlc => mlc.id == m.id,
              );
              /**
               * if existed
               *    update
               * else
               *    add new
               */
              //if (idx == -1) imageDateBeforeUpdating.image.push(m);
              if (idx == -1) {
                profileLocal.album_files.unshift(m);
              } else {
                profileLocal.album_files[idx].id = m.id;
                profileLocal.album_files[idx].file_name = m.file_name;
                profileLocal.album_files[idx].path_file = m.path_file;
                profileLocal.album_files[idx].path_file_thumb =
                  m.path_file_thumb;
                profileLocal.album_files[idx].create_at = m.create_at;
              }
            });
            /**
             * update room lastkey
             */
            profileLocal.lastKey = profileUpdating.lastKey;
            console.log('done Profile Update');
            if (profileUpdating.album_files.length > 0) {
              dispatchThunk(UserAction.fetchProfileLocalStorages(profileLocal));
            }
          } else {
            /**
             * create new record when this room not exist
             */
            realmOpen.create(ProfileSchemaOp.NAME_SCHEMA, profileUpdating);
            dispatchThunk(
              UserAction.fetchProfileLocalStorages(profileUpdating),
            );
            setRefresh(false);
            console.log('done Profile Create');
          }
        });
      } catch (error) {
        setRefresh(false);
        console.log('error', error);
      }
    });
  };

  const onRefresh = useCallback(() => {
    setRefresh(true);
    fetchData();
  }, []);

  const handleReadmore = useCallback(() => {
    if (!loading) {
      setCount(count + 1);
      if (count <= myAlbum.totalPages) {
        dispatchLocal(createAction(user.GET_ALBUM_PAGINATION, count));
      }
    }
  }, []);

  return (
    <SafeAreaView style={{flex: 1, backgroundColor: '#fff'}} edges={['top', 'left', 'right']}>
      <FlatList
        ref={FlatlistRef}
        data={myAlbum.listCurrent}
        keyExtractor={(item, index) => `MasonryListProfile_${index}`}
        numColumns={2}
        onRefresh={onRefresh}
        refreshControl={
          <RefreshControl refreshing={refresh} onRefresh={onRefresh} />
        }
        onEndReached={() => handleReadmore()}
        onEndReachedThreshold={16}
        refreshing={refresh}
        // scrollEnabled={!loading}
        showsVerticalScrollIndicator={false}
        showsHorizontalScrollIndicator={false}
        scrollEventThrottle={16}
        columnWrapperStyle={{
          marginHorizontal: 14,
          paddingBottom: 8,
          display: loading ? 'none' : 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexDirection: 'row',
          flex: 1,
        }}
        ListEmptyComponent={() =>
          !loading ? (
            <Text
              style={[
                globalStyles.text.subTitle,
                {
                  textAlign: 'center',
                  fontWeight: 'normal',
                  marginBottom: 24,
                  textAlignVertical: 'center',
                },
              ]}>
              {MESSAGES.HOME.MSG_HOME_TEXT_001}
            </Text>
          ) : null
        }
        ListHeaderComponent={() => (
          <>
            <View style={{padding: 14, marginBottom: 24}}>
              {/* header avatar */}
              <View
                style={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  marginTop: height * 0.1,
                }}>
                <View
                  style={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}>
                  {loading ? (
                    <View
                      style={[
                        styles.avatarUser,
                        {
                          width: width * 0.3,
                          height: width * 0.3,
                          borderRadius: (width * 0.3) / 2,
                          backgroundColor: COLORS.LOADING,
                        },
                      ]}
                    />
                  ) : (
                    // avatar
                    <>
                      <AvatarHandle
                        size={width * 0.3}
                        avatar={UserInfo.avatar}
                      />
                      {/* <AvatarRes
                        size={width * 0.3}
                        uri={
                          UserInfo.avatar && UserInfo.avatar.path_file_thumb
                            ? UserInfo.avatar.path_file_thumb
                            : ''
                        }
                        style={styles.avatarUser}
                      /> */}
                    </>
                  )}
                  <View style={{marginVertical: 15}}>
                    {loading ? (
                      <>
                        <View
                          style={{
                            width: width,
                            display: 'flex',
                            justifyContent: 'center',
                            flexDirection: 'row',
                          }}>
                          <View
                            style={[
                              {
                                height: 29,
                                width: width / 2,
                                marginBottom: 10,
                                borderRadius: 5,
                                backgroundColor: COLORS.LOADING,
                              },
                            ]}
                          />
                        </View>
                        <View
                          style={{
                            width: width,
                            display: 'flex',
                            justifyContent: 'center',
                            flexDirection: 'row',
                          }}>
                          <View
                            style={[
                              {
                                height: 14,
                                width: width / 3,
                                borderRadius: 5,
                                backgroundColor: COLORS.LOADING,
                              },
                            ]}
                          />
                        </View>
                      </>
                    ) : (
                      <>
                        <Text
                          style={[
                            stylesGlobal.text.title,
                            {textAlign: 'center'},
                          ]}>
                          {UserInfo.fullname}
                        </Text>
                        <Text
                          style={[
                            stylesGlobal.text.subTitle,
                            {textAlign: 'center'},
                          ]}>
                          {UserInfo.address}
                        </Text>
                      </>
                    )}
                  </View>
                </View>
                <View style={{width: '100%', marginVertical: 14}}>
                  <CustomButton
                    title="チャット"
                    outlined={false}
                    colorButton="#fff"
                    textColor={loading ? 'rgba(0,0,0,0.6)' : '#000'}
                    onPress={() => {
                      navigation.navigate('Chats');
                    }}
                    disabled={loading}
                    style={
                      loading
                        ? {borderColor: 'rgba(0,0,0,0.6)'}
                        : {backgroundColor: 'transparent'}
                    }
                  />
                </View>
                <View style={{width: '100%'}}>
                  <ButtonLogout loading={loading} handleConfirm={signOut} />
                </View>
              </View>
            </View>
            {loading ? <LoadingMansoryV2 /> : null}
          </>
        )}
        renderItem={({item, index}) => (
          <Pressable
            onPress={() => {
              dispatchLocal(
                createAction(modal.SET_MODAL, {
                  isShow: true,
                  value: item,
                }),
              );
            }}>
            <ImageResView indexItem={index} uri={item.path_file_thumb} />
          </Pressable>
        )}
        ListFooterComponent={() => (
          <View style={{width: width, height: height * 0.12}} />
        )}
      />
      {/* <ModalConfirm
        visible={isShowConfirm}
        setVisible={setIsShowConfirm}
        handleConfirm={() => signOut()}
        titleModal={MESSAGES.DIALOG.MSG_DIALOG_TITLE_001}
        message={MESSAGES.DIALOG.MSG_DIALOG_TEXT_001}
        buttonClose={{
          color: colors.SUCCESS,
          text: MESSAGES.COMMON.BUTTON.CANCEL,
        }}
        buttonConfirm={{
          color: colors.DANGER,
          text: MESSAGES.COMMON.BUTTON.CONFIRM,
        }}
      /> */}
    </SafeAreaView>
  );
};
const ButtonLogout: React.FC<{
  loading: boolean;
  handleConfirm: () => void;
}> = memo(({loading, handleConfirm}) => {
  const [isShowConfirm, setIsShowConfirm] = useState<boolean>(false);
  return (
    <>
      <CustomButton
        title="ログアウト"
        outlined={false}
        colorButton="#FF5E5E"
        borderColor="#000"
        textColor="#fff"
        onPress={() => {
          console.log('run btn ログアウト ');
          setIsShowConfirm(true);
        }}
        disabled={loading}
        colorDisabled="rgba(255,94,94,0.6)"
        style={loading ? {borderColor: 'rgba(0,0,0,0.6)'} : {}}
      />
      <ModalConfirm
        visible={isShowConfirm}
        setVisible={setIsShowConfirm}
        handleConfirm={handleConfirm}
        titleModal={MESSAGES.DIALOG.MSG_DIALOG_TITLE_001}
        message={MESSAGES.DIALOG.MSG_DIALOG_TEXT_001}
        buttonClose={{
          color: colors.SUCCESS,
          text: MESSAGES.COMMON.BUTTON.CANCEL,
        }}
        buttonConfirm={{
          color: colors.DANGER,
          text: MESSAGES.COMMON.BUTTON.CONFIRM,
        }}
      />
    </>
  );
});
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 14,
  },
  avatarUser: {},
});
export default ProfileUserScreen;
