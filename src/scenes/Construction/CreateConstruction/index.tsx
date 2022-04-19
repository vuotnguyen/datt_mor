import { useNavigation } from '@react-navigation/native';
import React, { useCallback, useEffect, useState } from 'react';
import {
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
import { TypeDataCreateConstruction } from '../../../services/construction';
import { useAppDispatch, useAppSelector } from '../../../stories';
import * as globalStyles from '../../../styles';
import SearchUserList from '../../GroupChatCreate/SearchUser';
import ListUser from './listUser';

import { dataCache } from '../../../stories/types';
import { ConstructionAction, createAction } from '../../../stories/actions';
import { useDispatch } from 'react-redux';

const { width } = Dimensions.get('screen');

const CreateConstruction = (): JSX.Element => {
  const navigation = useNavigation();
  const [name, setName] = useState('');
  const [idWorkItem, setIdWorkItem] = useState('');
  const [address, setAddress] = useState('');
  const [visible, setVisible] = useState(0);
  const [visibleUser, setVisibleUser] = useState(false);
  const [i, setIndex] = useState(0);
  const [workItems, setWorkItems] = useState([
    { id: '00000', name: '', startDate: '', endDate: '' },
  ]);
  const [error, setError] = useState({ name: false, address: false });
  const { UserInfo } = useAppSelector(state => state.dataUser);
  const [selected, setSelected] = useState<Array<User>>([
    { ...UserInfo, full_name: UserInfo.fullname },
  ]);
  const [listNew, setListNew] = useState<Array<User>>(selected);

  let scrollRef: any;
  const [dropDownAlert, setDropDownAlert] = useState<DropdownAlert | null>();
  const [showAlert, setShowAlert] = useState(false);
  const [showAlertDate, setShowAlertDate] = useState(false);

  const [maxDate, setMaxDate] = useState('2100-01-01');
  const [minDate, setMinDate] = useState('2000-01-01');
  const date = new Date().toISOString()
  const current = date.slice(0, 4) + '/' + date.slice(5, 7) + '/' + date.slice(8, 10)
  const [currentDate, setCurrentDate] = useState(current)

  // const [date, setDate] = useState({maxDate : '2100-01-01' ,minDate: '2000-01-01', currentDate : new Date() + ''})

  const [isShowConfirm, setIsShowConfirm] = useState<boolean>(false);
  const [titleConfirm, setTitleConfirm] = useState('');
  const dispatchThunk = useDispatch();

  const dispatchLocal = useAppDispatch();
  useEffect(() => {
    const showSubscription = Keyboard.addListener('keyboardDidShow', () => {
      setVisible(0);
    });
    return () => {
      showSubscription.remove();
    };
  }, []);

  const confirmDate = useCallback(
    (date: any) => {
      let array = workItems;
      if (visible === 1) {
        array[i] = {
          id: workItems[i].id,
          name: workItems[i]?.name,
          startDate: date,
          endDate: workItems[i]?.endDate,
        };
        return setWorkItems(array), setVisible(0), setMinDate(date)
      }
      if (visible === 2) {
        array[i] = {
          id: workItems[i].id,
          name: workItems[i]?.name,
          startDate: workItems[i]?.startDate,
          endDate: date,
        };
        return setWorkItems(array), setVisible(0), setMaxDate(date);
      }
    },
    [visible, i],
  );

  if (Platform.OS === 'android') {
    UIManager.setLayoutAnimationEnabledExperimental &&
      UIManager.setLayoutAnimationEnabledExperimental(true);
  }

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
  const addItem = () => {
    if (workItems.length > 0) {
      scrollRef.scrollToEnd();
    }
    setMinDate('2000-01-01');
    setMaxDate('2100-01-01');
    if (checkWorkItems()) {
      let id: string;
      id = makeId();
      workItems.push({ id: id, name: '', startDate: '', endDate: '' });
      setAnimation();
      setWorkItems(workItems.slice(0));
    }
  };
  const removeItem = (id: string) => {
    setIdWorkItem(id);
    let item = workItems.slice().filter(item => item.id == id);
    if (
      item[0].name == '' &&
      item[0].startDate == '' &&
      item[0].endDate == ''
    ) {
      setWorkItems(workItems.slice().filter(item => item.id !== id));
    } else {
      setIsShowConfirm(true);
      setTitleConfirm(
        MESSAGE.CRUD_CONSTRUCTION(
          item[0].name,
          MESSAGE.CONSTRUCTION.MSG_CONSTRUCTION_DELETE_CONFIRM,
        ),
      );
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
  const visibleCalendar = (
    index: number,
    type: number,
    name: string,
    sDate: string,
    eDate: string,
  ) => {

    console.log(index, type, name, sDate, eDate);

    if (visible == 1 || visible == 2) {
      setVisible(0);
    } else {
      if (name === '') {
        setShowAlertDate(true);
        dropDownAlert?.alertWithType(
          'error',
          MESSAGE.COMMON.MSG_COMMON_TEXT_WARN,
          MESSAGE.CONSTRUCTION.CONSTRUCTION_CHECK_WORKITEM_NAME,
        );
      } else {
        if (sDate !== '' && eDate !== '') {
          if (type === 1) {
            setMinDate('2000-01-01');
            setMaxDate(eDate);
            setCurrentDate(sDate)
            // set currrent date cho calendar
          }
          if (type === 2) {
            setMaxDate('2100-01-01');
            setMinDate(sDate);
            setCurrentDate(eDate)
          }
        } else {
          if (type === 1) {
            setMinDate('2000-01-01');
            setCurrentDate(current)
          }
          if (type === 2) {
            setMaxDate('2100-01-01');
            setCurrentDate(current)
          }
        }
        setVisible(type);
        setIndex(index);
        scroll(index);
      }
    }
  };
  const renderItem = ({ item, index }: any) => {
    let name = '';
    // Swift right
    // let scrollRef = index;
    // const handleClickEnd = (e: any) => {
    //     let {x} = e.nativeEvent.contentOffset
    //     scrollRef.scrollToOffset({
    //       offset: 0,
    //       animated: true,
    //     });
    //     if (x > 50) {
    //         removeItem(item.id)
    //         console.log(x)
    //     }
    //   };
    let sDate = item.startDate;
    if (sDate) {
      sDate =
        sDate.slice(0, 4) + '/' + sDate.slice(5, 7) + '/' + sDate.slice(8, 10);
    }
    let eDate = item.endDate;
    if (eDate) {
      eDate =
        eDate.slice(0, 4) + '/' + eDate.slice(5, 7) + '/' + eDate.slice(8, 10);
    }
    const nameItem = item.name;
    return (
      <View style={styles.itemBox}>
        <TouchableOpacity
          style={styles.deleteBox}
          onPress={() => removeItem(item.id)}>
          <AntDesign name={'close'} size={20} color={'#9FA5AA'} />
        </TouchableOpacity>
        <TextInput
          style={[globalStyles.text.text, styles.textInputWorkItem]}
          onChangeText={text => {
            scroll(index);
            name = text;
            let array = workItems;
            array[index] = {
              id: array[index].id,
              name: name,
              startDate: array[index]?.startDate,
              endDate: array[index]?.endDate,
            };
            setWorkItems(array);
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
                showAlertDate == false
                  ? visibleCalendar(
                    index,
                    1,
                    workItems[index].name,
                    sDate,
                    eDate,
                  )
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
                showAlertDate == false
                  ? visibleCalendar(
                    index,
                    2,
                    workItems[index].name,
                    sDate,
                    eDate,
                  )
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
          setSelected={setSelected}
          setListNew={setListNew}
          openModal={() => setVisibleUser(true)}
        />
        <Text style={[globalStyles.text.text, { marginLeft: 16, marginTop: 32 }]}>
          {MESSAGE.CONSTRUCTION.MSG_CONSTRUCTION_LIST_WORKITEM}
        </Text>
      </View>
    );
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
      if (workItems[i].startDate == '' && workItems[i].endDate != '') {
        result = false;
      } else if (workItems[i].startDate != '' && workItems[i].endDate == '') {
        result = false;
      } else {
        result = true;
      }
    }
    if (result === false) {
      dropDownAlert?.alertWithType(
        'error',
        MESSAGE.COMMON.MSG_COMMON_ERROR_001,
        MESSAGE.CONSTRUCTION.CONSTRUCTION_CHECK_WORKITEM_DATE,
      );
      return false;
    }
    return true;
  };

  const popupAlert = () => {
    if (
      name == '' &&
      address == '' &&
      JSON.stringify(workItems) ==
      JSON.stringify([{ id: '00000', name: '', startDate: '', endDate: '' }]) &&
      JSON.stringify(selected) == JSON.stringify([{ ...UserInfo, full_name: UserInfo.fullname }])
    ) {
      dispatchLocal(createAction(dataCache.IS_LOAD_CONSTRUCTION, false));
      navigation.goBack()
    } else {
      setIsShowConfirm(true);
      setTitleConfirm(MESSAGE.CONSTRUCTION.MSG_CONFIRM_BACK_LISTCONSTRUCTION);
    }
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
  const handleCreateConstruction = () => {
    let array: Array<any> = [];
    let users: any = selected;
    users = selected.map(s => s.email);
    // users.unshift(UserInfo.id);
    console.log(users);
    if (check()) {
      for (let i: number = 0; i < workItems.length; i++) {
        if (
          workItems[i].name === '' &&
          workItems[i].startDate === '' &&
          workItems[i].endDate === ''
        ) {
        } else {
          array.push({
            work_item_name: workItems[i].name,
            work_item_start_date: workItems[i].startDate,
            work_item_end_date: workItems[i].endDate,
          });
        }
      }
      let data: TypeDataCreateConstruction = {
        construction_name: name,
        construction_address: address,
        work_items: array,
        users: users,
      };
      const success = () => {
        const msgSuccess =
          MESSAGE.CONSTRUCTION.MSG_CREATE_SUCCESS_LEFT +
          name +
          MESSAGE.CONSTRUCTION.MSG_CREATE_SUCCESS_RIGHT;

        //set reload construction screen
        dispatchLocal(createAction(dataCache.IS_LOAD_CONSTRUCTION, true));

        dropDownAlert?.alertWithType(
          'success',
          MESSAGE.COMMON.MSG_COMMON_TEXT_SUCCESS,
          msgSuccess,
        );
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
        ConstructionAction.createConstruction(data, success, fail, finish),
      );
    }
  };
  const onBack = () => {
    setVisibleUser(false);
    setSelected(listNew);
  };
  const onUpdateUser = () => {
    setVisibleUser(false);
    setListNew(selected);
  };
  const checkDate = () => {
    if (visible === 1) {
      return new Date(maxDate) < new Date() ? maxDate : currentDate;
    }
    if (visible === 2) {
      return new Date(minDate) > new Date() ? minDate : currentDate;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ModalConfirm
        visible={isShowConfirm}
        setVisible={setIsShowConfirm}
        handleConfirm={titleConfirm == MESSAGE.CONSTRUCTION.MSG_CONFIRM_BACK_LISTCONSTRUCTION ?
          () => {
            dispatchLocal(createAction(dataCache.IS_LOAD_CONSTRUCTION, false));
            navigation.goBack()
          } :
          () => setWorkItems(workItems.slice().filter(item => item.id !== idWorkItem))}
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
        onClose={() => {
          setShowAlert(false);
          setShowAlertDate(false);
        }}
      />

      <TouchableWithoutFeedback disabled={true}>
        <View>
          <View style={styles.header}>
            <Text style={styles.textHeader}>
              {MESSAGE.CONSTRUCTION.MSG_CONSTRUCTION_TITLE_ADD}
            </Text>
            <View style={styles.buttonHeder}>
              <TouchableOpacity style={styles.headerLeft} onPress={popupAlert}>
                <Ionicons name="chevron-back" size={28} color="#000" />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.headerRight}
                onPress={handleCreateConstruction}>
                <Text style={[styles.textHeader, { color: '#fff' }]}>
                  {MESSAGE.CONSTRUCTION.MSG_CONSTRUCTION_ADD}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
          <FlatList
            ref={ref => {
              scrollRef = ref;
            }}
            // onContentSizeChange={() => scrollRef.scrollToEnd({ animated: true })}
            // onLayout={() => scrollRef.scrollToEnd({ animated: true })}
            data={workItems}
            renderItem={renderItem}
            keyExtractor={(item, index) => `itemList-${index}`}
            ListHeaderComponent={listHeader()}
            showsVerticalScrollIndicator={false}
            ListFooterComponent={
              <View style={{ paddingHorizontal: 16 }}>
                <TouchableOpacity
                  style={[
                    styles.buttonBox,
                    { marginBottom: Platform.OS === 'ios' ? width / 2 : 50 },
                  ]}
                  onPress={
                    showAlert == false
                      ? addItem
                      : () => console.log('doont show')
                  }>
                  <Text style={[globalStyles.text.text, { color: '#fff' }]}>
                    {MESSAGE.CONSTRUCTION.MSG_CONSTRUCTION_ADD_WORKITEM}
                  </Text>
                </TouchableOpacity>
              </View>
            }
          />
        </View>
      </TouchableWithoutFeedback>
      {visible !== 0 ? (
        <View style={styles.datePicker}>
          <DatePicker
            confirm={confirmDate}
            cancel={() => onCancel(i)}
            maxDate={maxDate}
            minDate={minDate}
            // defaultDate={currentDate}
            defaultDate={checkDate()}
            confirmText={MESSAGE.COMMON.BUTTON.CONFIRM_DATE}
            cancelText={MESSAGE.COMMON.BUTTON.CANCEL_002}
          />
        </View>
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
            setSelected={setSelected}
            myID={UserInfo.user_id}
          />
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
};
export default CreateConstruction;

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
    fontWeight: '900',
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
    marginBottom: 50,
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
  deleteBox: {
    position: 'absolute',
    top: -15,
    right: -15,
    height: 30,
    width: 30,
    alignItems: 'center',
    backgroundColor: '#E0E0E0',
    borderRadius: 30,
    justifyContent: 'center',
    // transform: [{ translateY: -15 }],
  },
});
