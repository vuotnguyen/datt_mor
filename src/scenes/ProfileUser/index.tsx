import React, {memo, useCallback, useEffect, useRef, useState} from 'react';
import {
  Dimensions,
  Image,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {Auth} from 'aws-amplify';
import {iconUser} from '../../assets/images/users';
import {useAppDispatch, useAppSelector} from '../../stories';
import {CustomButton} from '../../components/buttons';
import * as stylesGlobal from '../../styles';
import * as globalStyles from '../../styles';
import {colors} from '../../styles';

import ModalConfirm from '../../components/common/ModalConfirm';
import {createAction, UserAction} from '../../stories/actions';
import {common, dataCache} from '../../stories/types';
import MasonryList from '../../components/organisms/MasonryList';
import {useDispatch} from 'react-redux';
import {SafeAreaView} from 'react-native-safe-area-context';
import MESSAGES from '../../config/Messages';
import MasonryListLoading from '../../components/organisms/MasonryList/LoadingMasonry';
import COLORS from '../../styles/colors';
import { useFocusEffect, useNavigation, useScrollToTop, StackActions } from "@react-navigation/native";
import {MAIN_TAB} from '../../navigations/MainTab';
import {GetAllUserInfo} from '../../stories/actions/infoallUser';
import {getListChats} from '../../stories/actions/chat';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface Props {
  navigation: any;
  isFocused: boolean;
}

const {height, width} = Dimensions.get('screen');

const ProfileUserScreen: React.FC<Props> = ({isFocused}) => {
  const navigation = useNavigation();
  const [isShowConfirm, setIsShowConfirm] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const {UserInfo} = useAppSelector(state => state.dataUser);
  const [refresh, setRefresh] = useState<boolean>(false);
  const dispatchThunk = useDispatch();
  const dispatchLocal = useAppDispatch();
  const [minHeightScroll, SetMinHeightScroll] = useState<number>();
  const scrollRef = useRef<ScrollView | any>();
  useScrollToTop(scrollRef);

  async function signOut() {
    
    try {
      await AsyncStorage.removeItem('@userRole')
      await Auth.signOut();
      dispatchLocal(createAction(common.CLEAR_DATA, null));
      dispatchLocal(createAction(dataCache.SET_SCREEN_NAVIGATION, null));
      navigation.navigate('Login');
      
      // navigation.dispatch(
      //   StackActions.replace('Login')
      // );

    } catch (error) {
      console.log('error signing out: ', error);
    }
    // clear data when user logout
  }

  const fetchData = () => {
    const success = () => {};
    const fail = () => {};
    if (isFocused) {
      setLoading(true);
      dispatchThunk(
        UserAction.GetUserInfo(success, fail, () => {
          setLoading(false);
          setRefresh(false);
        }),
      );
    }
  };
  useFocusEffect(
    useCallback(() => {
      dispatchLocal(
        createAction(dataCache.SET_SCREEN_NAVIGATION, MAIN_TAB.Profile),
      );
      fetchData();
    }, []),
  );

  const onRefresh = () => {
    setRefresh(true);
    fetchData();
  };

  return true ? (
    <SafeAreaView style={{flex: 1, backgroundColor: '#fff'}}>
      <ScrollView
        ref={scrollRef}
        removeClippedSubviews={true}
        style={styles.container}
        nestedScrollEnabled={false}
        refreshControl={
          <RefreshControl refreshing={refresh} onRefresh={onRefresh} />
        }>
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
              // <SkeletonPlaceholder>
              //   <View
              //     style={[
              //       styles.avatarUser,
              //       {
              //         width: width * 0.3,
              //         height: width * 0.3,
              //         borderRadius: (width * 0.3) / 2,
              //       },
              //     ]}
              //   />
              // </SkeletonPlaceholder>
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
              <Image
                source={
                  UserInfo.avatar && UserInfo.avatar.path_file_thumb
                    ? {uri: UserInfo.avatar.path_file_thumb}
                    : iconUser
                }
                style={[
                  styles.avatarUser,
                  {
                    width: width * 0.3,
                    height: width * 0.3,
                    borderRadius: (width * 0.3) / 2,
                  },
                ]}
              />
            )}
            <View style={{marginVertical: 15}}>
              {loading ? (
                // <SkeletonPlaceholder>
                //   <View
                //     style={{
                //       width: width,
                //       display: 'flex',
                //       justifyContent: 'center',
                //       flexDirection: 'row',
                //     }}>
                //     <View
                //       style={[
                //         {
                //           height: 29,
                //           width: width / 2,
                //           marginBottom: 10,
                //           borderRadius: 5,
                //         },
                //       ]}
                //     />
                //   </View>
                //   <View
                //     style={{
                //       width: width,
                //       display: 'flex',
                //       justifyContent: 'center',
                //       flexDirection: 'row',
                //     }}>
                //     <View
                //       style={[{height: 14, width: width / 3, borderRadius: 5}]}
                //     />
                //   </View>
                // </SkeletonPlaceholder>
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
                    style={[stylesGlobal.text.title, {textAlign: 'center'}]}>
                    {UserInfo.fullname}
                  </Text>
                  <Text
                    style={[stylesGlobal.text.subTitle, {textAlign: 'center'}]}>
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
          </View>
        </View>
        {/* list images */}
        <View>
          <Text style={[globalStyles.text.subTitle, {marginVertical: 24}]}>
            {/* 全て表示する */}
          </Text>
          {loading ? <MasonryListLoading /> : null}
          {!loading && UserInfo.album_files.length > 0 ? (
            <MasonryList
              items={UserInfo.album_files}
              loadMore={false}
              SetMinHeightScroll={SetMinHeightScroll}
            />
          ) : !loading ? (
            <Text
              style={[
                globalStyles.text.subTitle,
                {
                  textAlign: 'center',
                  fontWeight: 'normal',
                  marginBottom: 40,
                  textAlignVertical: 'center',
                },
              ]}>
              {MESSAGES.HOME.MSG_HOME_TEXT_002}
            </Text>
          ) : null}
        </View>
        <View style={{marginBottom: height * 0.1}} />
        <ModalConfirm
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
        />
      </ScrollView>
    </SafeAreaView>
  ) : (
    <View
      style={{
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#fff',
      }}>
      <Text
        style={[
          globalStyles.text.subTitle,
          {fontWeight: 'normal', letterSpacing: 1},
        ]}>
        Coming soon ....
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 14,
  },
  avatarUser: {},
});
export default memo(ProfileUserScreen);
