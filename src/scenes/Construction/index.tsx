import React, { useCallback, useRef, useState, useReducer, useEffect } from 'react';
import {
  Dimensions,
  FlatList,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  BackHandler,
  ActivityIndicator,
  View,
  Animated,
  Keyboard,
} from 'react-native';

import { AntDesign, Ionicons, MaterialCommunityIcons } from '../../assets/icons';
import { dataCache, modal, user } from '../../stories/types';
import { useAppDispatch, useAppSelector } from '../../stories';
import { createAction } from '../../stories/actions';
import { apiListConstruction } from '../../services/construction';
import { Construction } from '../../models/construction';
import MESSAGE from '../../config/Messages';
import {
  RouteProp,
  useFocusEffect,
  useNavigation,
  useRoute,
  useScrollToTop,
} from '@react-navigation/native';
import ConstructionShimmer from "./ConstructionShimmer";
import DropdownAlert from 'react-native-dropdownalert';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MAIN_TAB } from '../../navigations/MainTab';
import ConstructionItem from './ConstructionItem';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { RootStackNavigationProp } from '../../navigations/RootStack';
import { ButtonIcon } from '../../components/buttons';
import { debounce } from 'lodash';
import { ConstructionAction } from '../../stories/actions';
import { useDispatch } from 'react-redux';
import Svg, { Path } from 'react-native-svg';
const screen = Dimensions.get("screen");


const ConstructionScreen = (): JSX.Element => {
  const navigation = useNavigation<RootStackNavigationProp>();
  const FlatlistRef = useRef<FlatList | any>();
  useScrollToTop(FlatlistRef);
  const [keyword, setKeyword] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [listConstruction, setListConstruction] = useState<Array<Construction>>(
    [],
  );
  const [dropDownAlert, setDropDownAlert] = useState<DropdownAlert | null>();
  const dispatch = useAppDispatch();
  const dispatchThunk = useDispatch();

  const [role, setRole] = useState('');
  const [lastKey, setLastKey] = useState('');
  const [sortBy, setSortBy] = useState('')
  const [loadMore, setLoadMore] = useState(true)
  const [toolTip, setToolTip] = useState(false)
  const [yOption, setYOption] = useState(0)
  const [item, setItem] = useState()

  // const [isLongPress, setIsLongPress] = useState(false)
  // const [selectedDel, setSelectedDel] = useState([])

  // const [stateImage, setStateImage] = useState({isLongPress: false, selectedDel: []})

  const { isLoadConstruction, isLongPressImage, listImageDelete } = useAppSelector((state) => state.dataCache);

  const addConstruction = () => {
    dispatch(createAction(dataCache.IS_LONGPRESS_IMAGE, false))
    dispatch(createAction(dataCache.IS_LOAD_CONSTRUCTION, false))
    navigation.navigate('CreateConstruction');
  };

  const checkRole = async () => {
    let roleuser = await AsyncStorage.getItem('@userRole');
    if (roleuser != null) {
      setRole(roleuser);
    }
    console.log('user role ', roleuser);

  }

  //get list contruction
  const fetchData = (search: string) => {
    listConstruction.length == 0 ? setLoading(true) : setLoading(false);
    const success = (res: any) => {
      const resData: Array<Construction> = JSON.parse(
        JSON.stringify(res.data.data),
      );
      setListConstruction(listConstruction.concat(resData));
      if (res.data.last_key != null) {
        let key = res.data.last_key.SK?.replace('#', '%23')
        let sort = res.data.last_key.sort_by?.replace('#', '%23')

        setLastKey(key)
        setSortBy(sort)
      } else setLoadMore(false)
    };
    const fail = (error: any) => {
      dropDownAlert?.alertWithType(
        'error',
        MESSAGE.COMMON.MSG_COMMON_TEXT_ERROR,
        error,
      );
    };
    const finish = () => {
      setLoading(false)
    };
    dispatchThunk(ConstructionAction.ListConstruction(lastKey, sortBy, search, success, fail, finish));
  };

  const deleteImage = () => {
    console.log(listImageDelete);
    
    const success = (res: any) => {
      dropDownAlert?.alertWithType(
        'success',
        MESSAGE.COMMON.MSG_COMMON_TEXT_ERROR,
        'xoas anh thanh cong',
      );
      setTimeout(() => {
        dispatch(createAction(dataCache.IS_LOAD_CONSTRUCTION, true))
      }, 1500);
    };
    const fail = (error: any) => {
      dropDownAlert?.alertWithType(
        'error',
        MESSAGE.COMMON.MSG_COMMON_TEXT_ERROR,
        error,
      );
    };
    const finish = () => {
    };
    dispatchThunk(ConstructionAction.deleteImageConstruction(listImageDelete, success, fail, finish));
  }

  /**
   *  call get list data
   */
  useEffect(() => {
    checkRole()
    if (isLoadConstruction == true) {
      reload()
    }
  }, [isLoadConstruction]);

  const reload = useCallback(() => {
    setKeyword('')
    setLoadMore(true)
    setLastKey('')
    setListConstruction([])
    setSortBy('')
    fetchData(keyword);
  }, [])

  useFocusEffect(
    useCallback(() => {
      dispatch(createAction(dataCache.IS_LONGPRESS_IMAGE, false))
      dispatch(
        createAction(dataCache.SET_SCREEN_NAVIGATION, MAIN_TAB.Construction),
      );
      const onBackPress = () => {
        return true;
      };
      BackHandler.addEventListener('hardwareBackPress', onBackPress);

      return () =>
        BackHandler.removeEventListener('hardwareBackPress', onBackPress);
    }, []),
  );
  /**
   * refresh
   */
  const onRefresh = useCallback(() => {
    setKeyword('')
    setLoadMore(true)
    setLastKey('')
    setListConstruction([])
    setSortBy('')
    fetchData(keyword);
  }, []);

  const handleLoadMore = () => {
    if (loadMore == true) {
      fetchData(keyword)
    }
  }
  const showToolTip = (item: any, toolTip: boolean, y: number) => {
    console.log('item ', item);
    setToolTip(toolTip)
    setYOption(y)
    setItem(item)
  }
  const gotoScreen = (name: string) => {
    dispatch(createAction(dataCache.IS_LONGPRESS_IMAGE, false))
    dispatch(createAction(dataCache.IS_LOAD_CONSTRUCTION, false))
    setToolTip(false)
    navigation.navigate(name, { item })
  }
  const LoadingGroup = () => (
    <>
      <ConstructionShimmer />
      <ConstructionShimmer />
      <ConstructionShimmer />
      <ConstructionShimmer />
      <ConstructionShimmer />
    </>
  );
  const _handleSearch = useCallback((str: string) => {
    setLoadMore(true)
    fetchData(str)
  }, []);
  const handler = useCallback(debounce(_handleSearch, 1000), []);
  const handleOnChangeText = useCallback(
    (e: string) => {
      setKeyword(e);
      if (!loading) setLoading(true);
      handler(e.trim());
    },
    [loading],
  );
  const _handleClear = useCallback(() => {
    setLoadMore(true)
    setKeyword('');
    setListConstruction([])
    fetchData('');
  }, []);

  const checkList = () => {
    if (listConstruction.length == 0) {
      return <Text style={{ flex: 1, textAlign: 'center', marginTop: 20 }}
        onPress={Keyboard.dismiss}>{keyword == '' ? MESSAGE.CONSTRUCTION.MSG_NON_CONSTRUCTION : MESSAGE.CONSTRUCTION.MSG_NON_CONSTRUCTION_SEARCH}</Text>
    } else {
      return (
        <FlatList
          ref={FlatlistRef}
          onScroll={Keyboard.dismiss}
          onRefresh={onRefresh}
          refreshing={loading}
          renderItem={item => (
            <ConstructionItem
              item={item}
              clickDetail={(item: any, toolTip: boolean, y: number) => showToolTip(item, toolTip, y)} />
          )}
          data={listConstruction}
          key={'a'}
          keyExtractor={(item, index) => 'a' + index.toString()}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.1}
          ListFooterComponent={loadMore == true ? <ActivityIndicator size={'large'} /> : null}
        />
      )
    }
  }
  const showSearch = () => {
    return (
      isLongPressImage == false ?
        <View
          style={{
            backgroundColor: '#E0E0E0',
            marginHorizontal: 5,
            marginTop: 16,
            borderRadius: 10,
            paddingLeft: 10,
            marginBottom: 5,
            flexDirection: 'row',
          }}>
          <View style={[styles.inpWrapper, { height: 40 }]}>
            <TextInput
              placeholder={MESSAGE.CONSTRUCTION.MSG_CONSTRUCTION_SEARCH}
              style={styles.input}
              value={keyword ? keyword : ''}
              numberOfLines={1}
              placeholderTextColor={'#444444'}
              autoFocus={false}
              onSubmitEditing={() => _handleSearch(keyword)}
              onChangeText={handleOnChangeText}
            />
            <ButtonIcon onPress={() => _handleClear()}>
              <View
                style={{
                  paddingHorizontal: 10,
                  paddingVertical: 7,
                  display: keyword ? 'flex' : 'none',
                }}>
                <AntDesign name={'close'} size={16} />
              </View>
            </ButtonIcon>
          </View>
        </View>
        :
        <View
          style={{
            backgroundColor: '#0295FF',
            justifyContent: 'flex-end',
            marginTop: 16,
            height: 40,
            flexDirection: 'row',
            alignItems: 'center',
            paddingRight: 10
          }}>
          <AntDesign style={{ marginHorizontal: 10 }} name={'delete'} size={30} color={'white'} onPress={deleteImage} />
          <MaterialCommunityIcons style={{ marginHorizontal: 10 }} name={'folder-move-outline'} size={30} color={'white'} />
        </View>
    )
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']} >
      <DropdownAlert
        updateStatusBar={false}
        ref={ref => setDropDownAlert(ref)}
        activeStatusBarBackgroundColor={'#ffffff'}
        zIndex={99}
        closeInterval={2000}
      />
      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        {
          isLongPressImage == true ?
            <Ionicons name={'chevron-back-sharp'} size={20}
              onPress={() => {
                dispatch(createAction(dataCache.IS_LONGPRESS_IMAGE, false))
              }} />
            :
            <View style={{ width: 20 }} />
        }

        <Text
          style={{
            fontSize: 16,
            fontWeight: '900',
            color: '#000000',
            textAlign: 'center',
          }}>
          {MESSAGE.CONSTRUCTION.MSG_CONSTRUCTION_TITLE}
        </Text>
        <View style={{ width: 20 }} />
      </View>
      {showSearch()}
      {loading == true ?
        <LoadingGroup />
        :
        checkList()

      }

      {/* {renderAdd} */}
      {role === 'Admin' ? (
        <TouchableOpacity style={styles.buttonAdd} onPress={addConstruction}>
          <Ionicons name="add-outline" color="#fff" size={40} />
        </TouchableOpacity>
      ) : null}
      {toolTip == true ?
        <TouchableOpacity
          onPress={() => setToolTip(false)} style={styles.optionContainer}>
          <View style={{
            position: 'absolute',
            backgroundColor: '#FFFFFF',
            borderRadius: 10,
            right: 12,
            bottom: screen.height - yOption + 10,
          }}>
            <View style={{ flexDirection: 'row', paddingVertical: 15 }}>
              <TouchableOpacity style={styles.bottomOption} onPress={() => console.log('bao cao screen')}>
                <Text style={styles.textOption}>チャット</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.bottomOption} onPress={() => console.log('bao cao screen')}>
                <Text style={styles.textOption}>指示</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.bottomOption} onPress={() => console.log('bao cao screen')}>
                <Text style={styles.textOption}>報告</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.bottomOption} onPress={() => role == 'Admin' ? gotoScreen('EditConstruction') : gotoScreen('DetailConstruction')}>
                <Text style={styles.textOption}>{role == 'Admin' ? MESSAGE.CONSTRUCTION.UPDATE : MESSAGE.CONSTRUCTION.INFO}</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.triangle} />
          </View>
        </TouchableOpacity>
        : null

      }
    </SafeAreaView>
  );
};

export default ConstructionScreen;
const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    // zIndex: 2,
    flex: 1,
  },
  buttonAdd: {
    width: 56,
    height: 56,
    backgroundColor: '#0295FF',
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    right: 12,
    bottom: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.46,
    shadowRadius: 11.14,

    elevation: 17,
  },
  addText: {
    fontSize: 40,
    color: '#fff',
    textAlign: 'center',
  },

  noImageText: { textAlign: 'center', marginTop: 20, marginBottom: 16 },
  bottomOption: {
    backgroundColor: '#F2994A',
    borderRadius: 5,
    height: 24,
    marginHorizontal: 12,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.32,
    shadowRadius: 5.46,

    elevation: 9,
  },
  textOption: {
    fontSize: 14,
    fontWeight: '200',
    color: 'white',
    textAlign: 'center',
    paddingVertical: 4,
    paddingHorizontal: 10,
    alignItems: 'center'
  },
  optionContainer: {
    backgroundColor: '#00000080', width: screen.width, height: screen.height, position: 'absolute'
  },
  triangle: {
    // marginTop: 10,
    position: 'absolute',
    top: 50,
    right: 20,
    backgroundColor: "transparent",
    borderStyle: "solid",
    borderLeftWidth: 10,
    borderRightWidth: 10,
    borderTopWidth: 20,
    borderLeftColor: "transparent",
    borderRightColor: "transparent",
    borderTopColor: "white",
  },
  input: {
    textAlign: 'left',
    fontSize: 14,
    flex: 1,
  },
  inpWrapper: {
    // width: width,
    flex: 1,

    borderBottomColor: 'transparent',
    backgroundColor: 'rgba(230,230,230,0.5)',
    borderRadius: 10,
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
  },
});
