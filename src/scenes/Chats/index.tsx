import React, {useCallback, useEffect, useRef, useState} from 'react';
import {
  Dimensions,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableNativeFeedback,
  Platform,
  View,
  TextInput,
} from 'react-native';
// import {Input} from 'native-base';
import * as stylesGlobal from '../../styles';
import {SafeAreaView} from 'react-native-safe-area-context';
import MESSAGES from '../../config/Messages';
import {useDispatch} from 'react-redux';
import {getListChats} from '../../stories/actions/chat';
import {GetAllUserInfo} from '../../stories/actions/infoallUser';
import {getAllGroupInfo} from '../../stories/actions/infoAllGroup';
import Fontisto from 'react-native-vector-icons/Fontisto';
import {
  AntDesign,
  FontAwesome5,
  MaterialCommunityIcons,
  Octicons,
  Entypo,
} from '../../assets/icons';
import PopupTop from '../../components/common/PopupTop';
import ListChats from './ListChats';
import ButtonOptionCreate from './ButtonCreateOptional';
import {useAppDispatch} from '../../stories';
import {createAction} from '../../stories/actions';
import {dataCache} from '../../stories/types';
import {
  useFocusEffect,
  useNavigation,
  useScrollToTop,
} from '@react-navigation/native';
import {RootStackNavigationProp} from '../../navigations/RootStack';
import {MAIN_TAB} from '../../navigations/MainTab';
import {ChatDBHelperInstance} from '../../database/DatabaseHelper';
import {database} from '../../database/watermelonDB';

export interface Props {
  navigation: any;
}
//TODO Kha should be change next line to constain
const {height, width} = Dimensions.get('screen');

const ChatsScreen = (): JSX.Element => {
  const navigation = useNavigation<RootStackNavigationProp>();
  const [obCache, setObCache] = useState<{
    loading: boolean;
    refresh: boolean;
  }>({
    loading: false,
    refresh: false,
  });
  const scrollRef = useRef<ScrollView | any>();
  useScrollToTop(scrollRef);
  const dispatch = useAppDispatch();

  const dispatchThunk = useDispatch();
  const fetchData = async () => {
    setObCache({refresh: obCache.refresh, loading: true});
    const success = () => {};
    const fail = () => {};
    const final = () => {
      setObCache({loading: false, refresh: false});
    };
    try {
    } catch (error) {
      console.log('error getlistchat', error);
    }
    // dispatchThunk(getAllGroupInfo({}));
    dispatchThunk(GetAllUserInfo(success, fail, () => undefined));
    // dispatchThunk(getAllGroupInfo({}));
    dispatchThunk(getListChats(success, fail, final));
  };
  useEffect(()=>{
      dispatchThunk(GetAllUserInfo(() => undefined, () => undefined, () => undefined));
  },[]);
  useFocusEffect(
    useCallback(() => {
      dispatch(createAction(dataCache.SET_SCREEN_NAVIGATION, MAIN_TAB.Chats));
      const success = () => {};
      const fail = () => {};
      const final = () => {};
      dispatchThunk(getListChats(success, fail, final));
    }, []),
  );
  const onRefresh = () => {
    fetchData();
  };
  return (
    <SafeAreaView
      style={[styles.container, {backgroundColor: '#fff'}]}
      edges={['top', 'left', 'right']}>
      <View style={{position: 'relative', zIndex: 1}}>
        <ScrollView
          nestedScrollEnabled={false}
          removeClippedSubviews={true}
          ref={scrollRef}
          refreshControl={
            <RefreshControl
              refreshing={obCache.refresh}
              onRefresh={onRefresh}
            />
          }
          scrollEventThrottle={16}
          showsVerticalScrollIndicator={false}
          showsHorizontalScrollIndicator={false}
          stickyHeaderIndices={[0]}>
          {/* header */}
          <View style={styles.headerContainer}>
            <View style={styles.headerTop}>
              <Text style={styles.headerTopText}>チャット</Text>
              <View style={styles.buttonOptionContainer}>
                <ButtonOptionCreate />
              </View>
            </View>
            <View style={styles.headerBot}>
              <TouchableNativeFeedback
                background={TouchableNativeFeedback.SelectableBackground()} // eslint-disable-line new-cap
                style={{
                  display: 'flex',
                  flex: 1,
                  flexDirection: 'row',
                  // backgroundColor:'#000'
                }}
                onPress={() => {
                  navigation.navigate('SearchChat');
                }}>
                <View style={[styles.inpWrapper, {height: 35}]}>
                  <TextInput
                    placeholder={MESSAGES.CHAT.MSG_CHAT_TEXT_007}
                    style={styles.input}
                    numberOfLines={1}
                    accessible={false}
                    showSoftInputOnFocus={false}
                    disableFullscreenUI
                    editable={false}
                    // disabled
                    onPressIn={() => {
                      navigation.navigate('SearchChat');
                    }}
                  />
                  <View style={{paddingHorizontal: 10, paddingVertical: 7}}>
                    <Fontisto name={'search'} size={16} />
                  </View>
                </View>
              </TouchableNativeFeedback>
            </View>
          </View>

          {/* list chat box */}
          <ListChats loading={obCache.loading} />
          {/*<View style={{height: height * 0.15, width: width}} />*/}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

const screen = Dimensions.get('screen');

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  wrapperBox: {
    borderStyle: 'solid',
    borderBottomColor: 'rgba(0,0,0,0.1)',
    borderBottomWidth: 1,
  },
  userBox: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    width: '100%',
  },
  avatarUser: {
    width: screen.width * 0.15,
    height: screen.width * 0.15,
    borderRadius: (screen.width * 0.15) / 2,
  },
  inpWrapper: {
    // width: width,
    flex: 1,
    paddingHorizontal: 5,
    borderBottomColor: 'transparent',
    backgroundColor: 'rgba(230,230,230,0.5)',
    borderRadius: 10,
    paddingVertical: 0,
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
  },
  inputIcon: {},
  input: {
    textAlign: 'left',
    fontSize: 14,
    flex: 1,
  },
  headerContainer: {
    backgroundColor: '#fff',
    marginBottom: 10,
  },
  headerTop: {
    ...stylesGlobal.header.top,
    justifyContent: 'center',
    position: 'relative',
    zIndex: 5,
    width: width,
    flex: 1,
    display: 'flex',
    flexDirection: 'row',
  },
  headerTopText: {
    ...stylesGlobal.text.subTitle,
    textAlign: 'center',
  },
  buttonOptionContainer: {
    position: 'absolute',
    right: 2,
    top: 0,
    bottom: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  headerBot: {
    paddingHorizontal: 10,
    paddingTop: 5,
    paddingBottom: 5,
  },
});

export default ChatsScreen;
