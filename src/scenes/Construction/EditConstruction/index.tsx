import {
  RouteProp,
  useFocusEffect,
  useNavigation,
  useRoute,
} from '@react-navigation/native';
import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  Keyboard,
  LayoutAnimation,
  Modal,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  UIManager,
  View,
} from 'react-native';
import { DatePicker } from 'react-native-common-date-picker';
import DropdownAlert from 'react-native-dropdownalert';
import { TextInput } from 'react-native-gesture-handler';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  AntDesign,
  Ionicons,
  MaterialCommunityIcons,
} from '../../../assets/icons';
import ModalConfirm from '../../../components/common/ModalConfirm';
import MESSAGE from '../../../config/Messages';
import { User } from '../../../models/chat';
import { Construction1, WorkItem } from '../../../models/construction';
import { MAIN_TAB } from '../../../navigations/MainTab';
import { RootStackParamsList } from '../../../navigations/RootStack';
import { TypeDataUpdateConstruction } from '../../../services/construction';
import { useAppDispatch, useAppSelector } from '../../../stories';
import { ConstructionAction, createAction } from '../../../stories/actions';
import { dataCache } from '../../../stories/types';
import * as globalStyles from '../../../styles';
import SearchUserList from '../../GroupChatCreate/SearchUser';
import ListUser from '../CreateConstruction/listUser';

import { useDispatch } from 'react-redux';

type TRoute = RouteProp<RootStackParamsList, 'EditConstruction'>;

export type EditConstructionScreenParams = {
  item: any;
};

let data: any;

const { width } = Dimensions.get('screen');

const EditConstruction = (): JSX.Element => {
  // const deleteItem = Array<any>()
  const route = useRoute<TRoute>();
  const dispatch = useAppDispatch();
  const {
    params: { item },
  } = route;
  const id = route.params.item.item.construction_id;
  console.log(id);

  const navigation = useNavigation();

  const [name, setName] = useState(item?.construction_name);
  const [idWorkItem, setIdWorkItem] = useState('');
  const [nameWorkItem, setNameWorkItem] = useState('');
  const [itemWorkItem, setItemWorkItem] = useState();
  const [address, setAddress] = useState(item?.construction_address);
  const [selected, setselected] = useState<Array<User>>([]);
  const [listNew, setListNew] = useState<Array<User>>(selected);
  const [visible, setVisible] = useState(0);
  const [visibleUser, setVisibleUser] = useState(false);
  const [i, setIndex] = useState(0);
  const [workItems, setWorkItems] = useState([
    {
      id: '00000',
      name: '',
      startDate: '',
      endDate: '',
      isUpdate: false,
      newItem: false,
    },
  ]);
  const [updateworkItems, setUpdateWorkItems] = useState<Array<any>>([]);
  const [updateUser, setUpdateUser] = useState<Array<User>>([]);
  const [deleteItem, setDeleteItem] = useState<Array<any>>([]);
  const [error, setError] = useState({ name: false, address: false });
  const [dropDownAlert, setDropDownAlert] = useState<DropdownAlert | null>();
  const [showAlert, setShowAlert] = useState(false);

  const date = new Date().toISOString()
  const current = date.slice(0, 4) + '/' + date.slice(5, 7) + '/' + date.slice(8, 10)
  const [currentDate, setCurrentDate] = useState(current)

  const [maxDate, setMaxDate] = useState('2100-01-01');
  const [minDate, setMinDate] = useState('2000-01-01');
  const [newDate, setNewDate] = useState(false);
  const [isShowConfirm, setIsShowConfirm] = useState<boolean>(false);
  const [titleConfirm, setTitleConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [adminId, setAdminId] = useState('');
  const dispatchThunk = useDispatch();

  let scrollRef: any;

  const fetchData = () => {
    setLoading(true);
    const success = (res: any) => {
      let name = res.data.data.construction_name;
      let address = res.data.data.construction_address;
      let arrWorkItem = res.data.data.work_items;
      let arrUser = res.data.data.users;
      setAdminId(res.data.data.admin_id);

      for (let i = 0; i < arrUser.length; i++) {
        const element = arrUser[i];
        selected.push({
          user_id: element.PK,
          email: element.email,
          full_name: element.full_name,
          username: element.username,
          avatar: element.avatar,
          address: '',
          create_at: element.create_at,
          SK: element.SK,
          user_role: element.user_role,
        });
      }
      setUpdateUser(selected);
      let arr = [];
      for (let i = 0; i < arrWorkItem.length; i++) {
        const element = arrWorkItem[i];
        arr.push({
          id: element.work_item_id,
          name: element.work_item_name,
          startDate: element.work_item_start_date,
          endDate: element.work_item_end_date,
          isUpdate: false,
          newItem: false,
        });
      }
      let dataAPI: Construction1 = {
        name: name,
        address: address,
        workItems: arr,
        users: selected,
      };
      data = dataAPI;
      setAddress(address);
      setName(name);
      setWorkItems(arr);
      setselected(selected);
    };
    const fail = (error: any) => {
      dropDownAlert?.alertWithType(
        'error',
        MESSAGE.COMMON.MSG_COMMON_TEXT_ERROR,
        error,
      );
    };
    const finish = () => {
      setLoading(false);
    };
    dispatchThunk(
      ConstructionAction.getConstruction(id, success, fail, finish),
    );
  };
  useEffect(() => {
    fetchData();
    const showSubscription = Keyboard.addListener('keyboardDidShow', () => {
      setVisible(0);
    });
    return () => {
      showSubscription.remove();
    };
  }, []);
  useFocusEffect(
    useCallback(() => {
      dispatch(
        createAction(dataCache.SET_SCREEN_NAVIGATION, MAIN_TAB.Construction),
      );
    }, []),
  );

  const confirmDate = useCallback(
    (date: any) => {
      let array = workItems;
      if (visible === 1) {
        array[i] = {
          id: workItems[i].id,
          name: workItems[i]?.name,
          startDate: date,
          endDate: workItems[i]?.endDate,
          isUpdate: true,
          newItem: workItems[i]?.newItem,
        };
        return (
          setWorkItems(array),
          setVisible(0),
          setMinDate(date),
          setUpdateWorkItems(array)
        );
      }
      if (visible === 2) {
        array[i] = {
          id: workItems[i].id,
          name: workItems[i]?.name,
          startDate: workItems[i]?.startDate,
          endDate: date,
          isUpdate: true,
          newItem: workItems[i]?.newItem,
        };
        return (
          setWorkItems(array),
          setVisible(0),
          setMaxDate(date),
          setUpdateWorkItems(array)
        );
      }
    },
    [visible, i],
  );

  if (Platform.OS === 'android') {
    UIManager.setLayoutAnimationEnabledExperimental &&
      UIManager.setLayoutAnimationEnabledExperimental(true);
  }

  const popupAlertDel = () => {
    setTitleConfirm(
      MESSAGE.CRUD_CONSTRUCTION(
        name,
        MESSAGE.CONSTRUCTION.MSG_CONSTRUCTION_DELETE_CONFIRM,
      ),
    );
    setIsShowConfirm(true);
  };

  const setAnimation = () => {
    LayoutAnimation.configureNext({
      duration: 500,
      create: {
        type: LayoutAnimation.Types.easeIn,
        property: LayoutAnimation.Properties.scaleXY,
        springDamping: 0.7,
      },
    });
  };
  const makeId = () => {
    var text = '';
    var possible =
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    for (var i = 0; i < 5; i++) {
      text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
  };
  const checkWorkItems = () => {
    for (let i: number = 0; i < workItems.length; i++) {
      if (
        workItems[i].name === '' &&
        workItems[i].startDate === '' &&
        workItems[i].endDate === ''
      ) {
        setShowAlert(true);
        dropDownAlert?.alertWithType(
          'error',
          MESSAGE.COMMON.MSG_COMMON_TEXT_ERROR,
          MESSAGE.CONSTRUCTION.CONSTRUCTION_ADD_WORKITEM_ERROR,
        );
        return false;
      }
      if (workItems[i].startDate != '' && workItems[i].endDate === '') {
        setShowAlert(true);
        dropDownAlert?.alertWithType(
          'error',
          MESSAGE.COMMON.MSG_COMMON_TEXT_ERROR,
          MESSAGE.CONSTRUCTION.CONSTRUCTION_CHECK_WORKITEM_DATE,
        );
        return false;
      }
      if (workItems[i].startDate == '' && workItems[i].endDate != '') {
        setShowAlert(true);
        dropDownAlert?.alertWithType(
          'error',
          MESSAGE.COMMON.MSG_COMMON_TEXT_ERROR,
          MESSAGE.CONSTRUCTION.CONSTRUCTION_CHECK_WORKITEM_DATE,
        );
        return false;
      }
    }
    return true;
  };
  const addItem = () => {
    if (workItems.length > 0) {
      scrollRef.scrollToEnd();
    }
    setMinDate('2000-01-01');
    setMaxDate('2100-01-01');
    if (checkWorkItems()) {
      let id: string;
      id = makeId();
      workItems.push({
        id: id,
        name: '',
        startDate: '',
        endDate: '',
        isUpdate: false,
        newItem: true,
      });
      setAnimation();
      setWorkItems(workItems.slice(0));
    }
  };
  const delConstruction = () => {
    const success = (res: any) => {
      dropDownAlert?.alertWithType(
        'success',
        MESSAGE.COMMON.MSG_COMMON_TEXT_SUCCESS,
        MESSAGE.CRUD_CONSTRUCTION(
          name,
          MESSAGE.CONSTRUCTION.MSG_CONSTRUCTION_DELETE,
        ),
      );
      dispatch(createAction(dataCache.IS_LOAD_CONSTRUCTION, true))
      setTimeout(() => navigation.goBack(), 1500);
    };
    const fail = (error: any) => {
      dropDownAlert?.alertWithType(
        'error',
        MESSAGE.COMMON.MSG_COMMON_TEXT_ERROR,
        error,
      );
    };
    const finish = () => { };
    dispatchThunk(
      ConstructionAction.deleteConstruction(id, success, fail, finish),
    );
  };
  const confirmRemoveWorkItem = (id: string, item1: any) => {
    setIdWorkItem(id);
    let item = workItems.slice().filter(item => item.id == id);
    setNameWorkItem(item[0].name);
    if (
      item[0].name == '' &&
      item[0].startDate == '' &&
      item[0].endDate == ''
    ) {
      removeItem(id, item1);
    } else {
      setItemWorkItem(item1);
      setIsShowConfirm(true);
      setTitleConfirm(
        MESSAGE.CRUD_CONSTRUCTION(
          item[0].name,
          MESSAGE.CONSTRUCTION.MSG_CONSTRUCTION_DELETE_WORKITEM,
        ),
      );
    }
  };
  const removeItem = (id: String, item: any) => {
    item.delete = true;
    if (item.newItem == false) {
      deleteItem.push(item);
    }
    setWorkItems(workItems.slice().filter(item => item.id !== id));
  };

  const visibleCalendar = (
    index: number,
    type: number,
    sDate: string,
    eDate: string,
  ) => {
    if (visible == 1 || visible == 2) {
      setVisible(0);
    } else {
      if (sDate != '' && eDate != '') {
        setNewDate(false);
      } else {
        setNewDate(true);
      }

      if (workItems[index].name === '') {
        setShowAlert(true);
        dropDownAlert?.alertWithType(
          'error',
          MESSAGE.COMMON.MSG_COMMON_TEXT_WARN,
          MESSAGE.CONSTRUCTION.CONSTRUCTION_CHECK_WORKITEM_NAME,
        );
      } else {
        if (sDate !== '' && eDate !== '') {
          if (type === 1) {
            setMinDate('2000-01-01');
            setCurrentDate(sDate);
            setMaxDate(eDate);
          }
          if (type === 2) {
            setMaxDate('2100-01-01');
            setCurrentDate(eDate);
            setMinDate(sDate);
          }
        } else {
          if (sDate == '' && eDate != '') {
            setMinDate('2000-01-01');
            setMaxDate(eDate);
            setCurrentDate(current);
          } else if (eDate == '' && sDate != '') {
            setMinDate(sDate);
            setMaxDate('2100-01-01');
            setCurrentDate(current);
          } else {
            setMinDate('2000-01-01');
            setMaxDate('2100-01-01');
            setCurrentDate(current);
          }
        }
        setVisible(type);
        setIndex(index);
        scroll(index);
      }
    }
  };
  const scroll = (index: number) => {
    scrollRef.scrollToIndex({
      index: index,
      animated: true,
      viewPosition: 0.5,
    });
  };
  const onCancel = (index: number) => {
    setVisible(0);
    if (Platform.OS === 'ios') {
      scrollRef.scrollToIndex({
        index: index,
        animated: true,
        viewOffset: width / 2,
      });
    }
  };

  const changeWIName = (text: string, index: number) => {
    scroll(index);
    let array = workItems;
    array[index] = {
      id: array[index].id,
      name: text,
      startDate: array[index]?.startDate,
      endDate: array[index]?.endDate,
      isUpdate: true,
      newItem: array[index]?.newItem,
    };
    setWorkItems(array);
    setUpdateWorkItems(array);
  };

  const renderItem = ({ item, index }: any) => {
    let sDate = item.startDate;
    let eDate = item.endDate;
    const nameItem = item.name;
    return (
      <View style={styles.itemBox}>
        <TouchableOpacity
          style={styles.closeBox}
          onPress={() => confirmRemoveWorkItem(item.id, item)}>
          <AntDesign name={'close'} size={20} color={'#9FA5AA'} />
        </TouchableOpacity>
        <TextInput
          style={[globalStyles.text.text, styles.textInputWorkItem]}
          onChangeText={text => {
            // name = text;
            changeWIName(text, index);
          }}
          placeholder={MESSAGE.CONSTRUCTION.MSG_CONSTRUCTION_NAME_WORKITEM}
          maxLength={20}
          defaultValue={nameItem ?? null}
          onFocus={() => {
            scroll(index);
          }}
          onBlur={() => onCancel(index)}
        />
        <View style={styles.underLine} />
        <View style={styles.calendarBox}>
          <View style={{ flex: 1 }}>
            <TouchableOpacity
              style={styles.date}
              onPress={() =>
                showAlert == false
                  ? visibleCalendar(index, 1, sDate, eDate)
                  : console.log('dont show')
              }>
              {sDate ? (
                <Text
                  style={[
                    globalStyles.text.text,
                    { color: '#000', marginLeft: 5 },
                  ]}>
                  {sDate}
                </Text>
              ) : (
                <Text
                  style={[
                    globalStyles.text.text,
                    {
                      color: '#ADB2B6',
                      marginLeft: 5,
                    },
                  ]}>
                  {MESSAGE.CONSTRUCTION.MSG_CONSTRUCTION_START_DATE}
                </Text>
              )}
              <MaterialCommunityIcons
                name="calendar-range"
                color="#9FA5AA"
                size={26}
              />
            </TouchableOpacity>
            <View style={styles.underLine} />
          </View>
          <View style={styles.iconTilde}>
            <MaterialCommunityIcons name="tilde" color="#9FA5AA" size={18} />
          </View>
          <View style={{ flex: 1 }}>
            <TouchableOpacity
              style={styles.date}
              onPress={() =>
                showAlert == false
                  ? visibleCalendar(index, 2, sDate, eDate)
                  : console.log('dont show')
              }>
              <View>
                {eDate ? (
                  <Text
                    style={[
                      globalStyles.text.text,
                      { color: '#000', marginLeft: 5 },
                    ]}>
                    {eDate}
                  </Text>
                ) : (
                  <Text
                    style={[
                      globalStyles.text.text,
                      {
                        color: '#ADB2B6',
                        marginLeft: 5,
                      },
                    ]}>
                    {MESSAGE.CONSTRUCTION.MSG_CONSTRUCTION_END_DATE}
                  </Text>
                )}
              </View>
              <View>
                <MaterialCommunityIcons
                  name="calendar-range"
                  color="#9FA5AA"
                  size={26}
                />
              </View>
            </TouchableOpacity>
            <View style={styles.underLine} />
          </View>
        </View>
      </View>
    );
  };
  const listHeader = () => {
    return (
      <View>
        <View style={{ marginHorizontal: 16 }}>
          <TextInput
            style={[globalStyles.text.text, styles.textInput]}
            onChangeText={setName}
            placeholder={MESSAGE.CONSTRUCTION.MSG_CONSTRUCTION_NAME}
            maxLength={50}
            value={name}
          />
          <View
            style={[
              styles.underLine,
              { backgroundColor: error.name ? 'red' : '#9FA5AA' },
            ]}
          />
          <TextInput
            style={[globalStyles.text.text, styles.textInput]}
            onChangeText={setAddress}
            placeholder={MESSAGE.CONSTRUCTION.MSG_CONSTRUCTION_ADDRESS}
            maxLength={80}
            value={address}
          />
          <View
            style={[
              styles.underLine,
              { backgroundColor: error.address ? 'red' : '#9FA5AA' },
            ]}
          />
        </View>
        <ListUser
          selected={selected}
          setSelected={setselected}
          setListNew={setListNew}
          openModal={() => setVisibleUser(true)}
        />
        {workItems.length > 0 ?
          <Text style={[globalStyles.text.text, { marginLeft: 16, marginTop: 32 }]}>
            工種
          </Text>
          :
          null
        }
      </View>
    );
  };
  const popupAlert = () => {
    let dataCurrent: Construction1 = {
      name: name,
      address: address,
      workItems: workItems,
      users: selected.reverse(),
    };
    if (JSON.stringify(data) == JSON.stringify(dataCurrent)) {
      dispatch(createAction(dataCache.IS_LOAD_CONSTRUCTION, false))
      navigation.goBack();
    } else {
      setTitleConfirm(MESSAGE.CONSTRUCTION.MSG_CONFIRM_BACK_LISTCONSTRUCTION);
      setIsShowConfirm(true);
    }
  };
  const check = () => {
    if (name === '') {
      dropDownAlert?.alertWithType(
        'error',
        MESSAGE.COMMON.MSG_COMMON_TEXT_ERROR,
        MESSAGE.CONSTRUCTION.CONSTRUCTION_CHECK_CONTRUCTION_NAME,
      );
      return false;
    }
    let result = true;
    for (let i: number = 0; i < workItems.length; i++) {
      if(workItems[i].name == ''){
        result = false
      }
      if (workItems[i].startDate == '' && workItems[i].endDate != '') {
        result = false;
      } else if (workItems[i].startDate != '' && workItems[i].endDate == '') {
        result = false;
      }
      if (result === false) {
        dropDownAlert?.alertWithType(
          'error',
          MESSAGE.COMMON.MSG_COMMON_TEXT_ERROR,
          MESSAGE.CONSTRUCTION.CONSTRUCTION_CHECK_WORKITEM_DATE,
        );
        return false;
      }
    }

    return true;
  };
  const handleUpdateConstruction = () => {
    let arrWorkItem = [...workItems, ...deleteItem];

    let array: Array<WorkItem> = [];
    let users: any = selected;
    users = selected.map(s => s.user_id);
    // users.unshift(UserInfo.id);
    if (check()) {
      for (let i: number = 0; i < arrWorkItem.length; i++) {
        if (arrWorkItem[i].isUpdate == true || arrWorkItem[i].delete == true) {
          array.push({
            work_item_name: arrWorkItem[i].name,
            work_item_start_date: arrWorkItem[i].startDate,
            work_item_end_date: arrWorkItem[i].endDate,
            work_item_id:
              arrWorkItem[i].newItem == true ? '' : arrWorkItem[i]?.id,
            delete:
              arrWorkItem[i].delete == undefined
                ? false
                : arrWorkItem[i].delete,
          });
        }
      }
      array.map(item => {
        if (item.delete == false) {
          delete item.delete;
        }
        return item;
      });

      let arrUserUpdate: any = [];

      for (let j = 0; j < selected.length; j++) {
        const element1 = selected[j];
        let isAdd = false;
        updateUser.forEach(element => {
          if (element1.email == element.email) {
            isAdd = true;
          }
        });
        if (isAdd == false) {
          arrUserUpdate.push({ email: element1.email });
        }
      }

      updateUser.forEach(element => {
        let isDel = true;
        selected.forEach(element1 => {
          if (element.email == element1.email) {
            isDel = false;
          }
        });
        if (isDel == true) {
          arrUserUpdate.push({
            PK: element.user_id,
            SK: element.SK,
            delete: true,
          });
        }
      });

      let data: TypeDataUpdateConstruction = {
        construction_name: name,
        construction_address: address,
        work_items: array,
        users: arrUserUpdate,
      };
      const success = (res: any) => {
        const msgUpdateSuccess =
          MESSAGE.CONSTRUCTION.MSG_UPDATE_SUCCESS_LEFT +
          name +
          MESSAGE.CONSTRUCTION.MSG_UPDATE_SUCCESS_RIGHT;
        dropDownAlert?.alertWithType(
          'success',
          MESSAGE.COMMON.MSG_COMMON_TEXT_SUCCESS,
          msgUpdateSuccess,
        );
        dispatch(createAction(dataCache.IS_LOAD_CONSTRUCTION, true))
        setTimeout(() => navigation.goBack(), 1500);
      };
      const fail = (error: any) => {
        dropDownAlert?.alertWithType(
          'error',
          MESSAGE.COMMON.MSG_COMMON_TEXT_ERROR,
          error,
        );
      };
      const finish = () => { };
      dispatchThunk(
        ConstructionAction.UpdateConstruction(data, id, success, fail, finish),
      );
    }
  };

  const onBack = () => {
    setVisibleUser(false);
    setselected(listNew);
  };
  const onUpdateUser = () => {
    setVisibleUser(false);
    setListNew(selected);
  };
  const handleConfirm = () => {
    switch (titleConfirm) {
      case MESSAGE.CONSTRUCTION.MSG_CONFIRM_BACK_LISTCONSTRUCTION:
        dispatch(createAction(dataCache.IS_LOAD_CONSTRUCTION, false))
        navigation.goBack();
        break;
      case MESSAGE.CRUD_CONSTRUCTION(
        name,
        MESSAGE.CONSTRUCTION.MSG_CONSTRUCTION_DELETE_CONFIRM,
      ):
        delConstruction();
        break;
      case MESSAGE.CRUD_CONSTRUCTION(
        nameWorkItem,
        MESSAGE.CONSTRUCTION.MSG_CONSTRUCTION_DELETE_WORKITEM,
      ):
        removeItem(idWorkItem, itemWorkItem);
        break;
      default:
        break;
    }
  };
  return loading == true ? (
    <SafeAreaView style={styles.container}>
      <ActivityIndicator
        size="large"
        color="black"
        style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}
      />
    </SafeAreaView>
  ) : (
    <SafeAreaView style={styles.container}>
      <ModalConfirm
        visible={isShowConfirm}
        setVisible={setIsShowConfirm}
        handleConfirm={handleConfirm}
        titleModal={'確認'}
        message={titleConfirm}
        buttonClose={{
          color: globalStyles.colors.SUCCESS,
          text: MESSAGE.COMMON.BUTTON.CANCEL,
        }}
        buttonConfirm={{
          color: globalStyles.colors.DANGER,
          text: MESSAGE.COMMON.BUTTON.CONFIRM,
        }}
      />
      <DropdownAlert
        updateStatusBar={false}
        ref={ref => setDropDownAlert(ref)}
        activeStatusBarBackgroundColor={'#ffffff'}
        zIndex={99}
        closeInterval={2000}
        onClose={(data: any) => {
          setShowAlert(false);
        }}
      />
      <TouchableWithoutFeedback disabled={true}>
        <View>
          <View style={styles.header}>
            <Text style={styles.textHeader}>
              {MESSAGE.CONSTRUCTION.MSG_CONSTRUCTION_TITLE_UPDATE}
            </Text>
            <View style={styles.buttonHeder}>
              <TouchableOpacity style={styles.headerLeft} onPress={popupAlert}>
                <Ionicons name="chevron-back" size={28} color="#000" />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.headerRight}
                onPress={handleUpdateConstruction}>
                <Text style={[styles.textHeader, { color: '#fff' }]}>
                  {MESSAGE.CONSTRUCTION.MSG_CONSTRUCTION_DETAIL}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
          <FlatList
            keyboardDismissMode={'on-drag'}
            ref={ref => {
              scrollRef = ref;
            }}
            data={workItems}
            renderItem={renderItem}
            keyExtractor={(item, index) => `itemList-${index}`}
            ListHeaderComponent={listHeader()}
            ListFooterComponent={
              <View style={{ paddingHorizontal: 16 }}>
                <TouchableOpacity
                  style={[styles.buttonBox]}
                  onPress={
                    showAlert == false
                      ? addItem
                      : () => console.log('doont show')
                  }>
                  <Text style={[globalStyles.text.text, { color: '#fff' }]}>
                    {MESSAGE.CONSTRUCTION.MSG_CONSTRUCTION_ADD_WORKITEM}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.buttonBox,
                    { marginBottom: 100, backgroundColor: '#EB5757' },
                  ]}
                  onPress={popupAlertDel}>
                  <Text style={[globalStyles.text.text, { color: '#fff' }]}>
                    {MESSAGE.CONSTRUCTION.MSG_CONSTRUCTION_DELETE_WORKITEM}
                  </Text>
                </TouchableOpacity>
              </View>
            }
          />
        </View>
      </TouchableWithoutFeedback>
      {visible !== 0 ? (
        <>
          <View style={styles.datePicker}>
            <DatePicker
              confirm={confirmDate}
              cancel={() => onCancel(i)}
              maxDate={maxDate}
              minDate={minDate}
              // defaultDate={newDate == true ? date : currentDate}
              defaultDate={currentDate}
              confirmText={MESSAGE.COMMON.BUTTON.CONFIRM_DATE}
              cancelText={MESSAGE.COMMON.BUTTON.CANCEL_002}
            />
          </View>
        </>
      ) : null}
      <Modal
        visible={visibleUser}
        onRequestClose={() => setVisibleUser(false)}
        animationType={'slide'}>
        <SafeAreaView>
          <View style={styles.headerModal}>
            <Text style={styles.textHeader}>
              {MESSAGE.CONSTRUCTION.MSG_CONSTRUCTION_LIST_USER}
            </Text>
            <View style={styles.buttonHeder}>
              <TouchableOpacity style={styles.headerLeft} onPress={onBack}>
                <Ionicons name="chevron-back" size={28} color="#000" />
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.headerRight, { marginRight: 8 }]}
                onPress={onUpdateUser}>
                <Text style={[styles.textHeader, { color: '#fff' }]}>
                  {MESSAGE.CONSTRUCTION.MSG_CONSTRUCTION_OK}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
          <SearchUserList
            selected={selected}
            setSelected={setselected}
            myID={adminId}
          />
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
};
export default EditConstruction;

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#DADADA',
  },
  textHeader: {
    fontSize: 16,
    fontWeight: '500',
  },
  buttonHeder: {
    position: 'absolute',
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerLeft: {
    marginLeft: -10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerRight: {
    backgroundColor: '#F2994A',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 5,
  },
  underLine: {
    height: 1,
    marginTop: 12,
    backgroundColor: '#9FA5AA',
  },
  textInput: {
    marginTop: 20,
    marginLeft: 20,
  },
  textInputWorkItem: {
    marginTop: 20,
    marginLeft: 10,
  },
  title: {
    fontSize: 15,
    fontWeight: '700',
  },
  titleBox: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 37,
    alignItems: 'center',
  },
  itemBox: {
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#9FA5AA',
    paddingHorizontal: 8,
    paddingBottom: 20,
    marginTop: 20,
    width: width - 32,
    marginHorizontal: 16,
  },
  calendarBox: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 20,
  },
  iconTilde: { marginBottom: 18, marginHorizontal: 20 },
  date: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    justifyContent: 'space-between',
    paddingLeft: 5,
  },
  datePicker: {
    bottom: 0,
    position: 'absolute',
    paddingTop: 1,
    borderTopWidth: 1,
    borderTopColor: '#9FA5AA',
    width,
    backgroundColor: '#fff',
  },
  buttonBox: {
    backgroundColor: '#2F80ED',
    alignItems: 'center',
    paddingVertical: 15,
    borderRadius: 3,
    marginVertical: 26,
  },
  rightButton: {
    backgroundColor: '#BDBDBD',
    paddingHorizontal: 25,
    paddingVertical: 7,
    borderRadius: 3,
  },
  footerItembox: {
    width: width / 2,
  },
  headerModal: {
    paddingRight: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 10,
    marginLeft: 10,
  },
  closeBox: {
    position: 'absolute',
    top: -15,
    right: -15,
    height: 30,
    width: 30,
    alignItems: 'center',
    backgroundColor: '#E0E0E0',
    borderRadius: 30,
    justifyContent: 'center',
  },
});
