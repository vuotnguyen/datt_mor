import {
  RouteProp,
  useFocusEffect,
  useNavigation,
  useRoute,
} from '@react-navigation/native';
import React, { useCallback, useState, useEffect } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  UIManager,
  View,
} from 'react-native';
import DropdownAlert from 'react-native-dropdownalert';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '../../../assets/icons';
import MESSAGE from '../../../config/Messages';
import { User } from '../../../models/chat';
import { Construction1 } from '../../../models/construction';
import { MAIN_TAB } from '../../../navigations/MainTab';
import { RootStackParamsList } from '../../../navigations/RootStack';
import { useAppDispatch } from '../../../stories';
import { ConstructionAction, createAction } from '../../../stories/actions';
import { dataCache } from '../../../stories/types';
import * as globalStyles from '../../../styles';
import ListUser from '../CreateConstruction/listUser';
import { useDispatch } from 'react-redux';

type TRoute = RouteProp<RootStackParamsList, 'EditConstruction'>;

export type EditConstructionScreenParams = {
  item: any;
};
let data = '';
const { width } = Dimensions.get('screen');

const DetailConstruction = (): JSX.Element => {
  const route = useRoute<TRoute>();
  const dispatch = useAppDispatch();
  const {
    params: { item },
  } = route;
  const id = route.params.item.item.construction_id;
  const navigation = useNavigation();
  const [name, setName] = useState(item?.construction_name?.S);

  const [address, setAddress] = useState(item?.construction_address?.S);
  const [selected, setSelected] = useState<Array<User>>([]);
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
  const [loading, setLoading] = useState(false);
  const dispatchThunk = useDispatch();
  const [dropDownAlert, setDropDownAlert] = useState<DropdownAlert | null>();

  const fetchData = () => {
    setLoading(true);
    const success = (res: any) => {
      let name = res.data.data.construction_name;
      let address = res.data.data.construction_address;
      let arrWorkItem = res.data.data.work_items;
      let arrUser = res.data.data.users;

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
      data = JSON.stringify(dataAPI);
      setAddress(address);
      setName(name);
      setWorkItems(arr);
      setSelected(selected);
    };
    const fail = (error: any) => {
      dropDownAlert?.alertWithType(
        'error',
        MESSAGE.COMMON.MSG_COMMON_TEXT_ERROR,
        'SERVER ERROR ' + error,
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
  }, []);

  useFocusEffect(
    useCallback(() => {
      dispatch(
        createAction(dataCache.SET_SCREEN_NAVIGATION, MAIN_TAB.Construction),
      );
    }, []),
  );
  if (Platform.OS === 'android') {
    UIManager.setLayoutAnimationEnabledExperimental &&
      UIManager.setLayoutAnimationEnabledExperimental(true);
  }

  const renderItem = ({ item, index }: any) => {
    let sDate = item.startDate;
    let eDate = item.endDate;
    const nameItem = item.name;
    return (
      <View style={styles.itemBox}>
        <Text style={[globalStyles.text.text, styles.textInputWorkItem]}>
          {nameItem}
        </Text>
        <View style={styles.underLine} />
        <View style={styles.calendarBox}>
          <View style={{ flex: 1 }}>
            <TouchableOpacity style={styles.date}>
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
            <TouchableOpacity style={styles.date}>
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
          <Text style={[globalStyles.text.text, styles.textInput]}>{name}</Text>
          <View style={[styles.underLine, { backgroundColor: '#9FA5AA' }]} />
          <Text style={[globalStyles.text.text, styles.textInput]}>
            {address}
          </Text>
          <View style={[styles.underLine, { backgroundColor: '#9FA5AA' }]} />
        </View>
        <ListUser
          selected={selected}
          setSelected={setSelected}
          setListNew={setSelected}
          openModal={false}
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
      <DropdownAlert
        updateStatusBar={false}
        ref={ref => setDropDownAlert(ref)}
        activeStatusBarBackgroundColor={'#ffffff'}
        zIndex={99}
        closeInterval={2000}
      />
      <TouchableWithoutFeedback disabled={true}>
        <View>
          <View style={styles.header}>
            <Text style={styles.textHeader}>
              {MESSAGE.CONSTRUCTION.MSG_CONSTRUCTION_TITLE_UPDATE}
            </Text>
            <View style={styles.buttonHeder}>
              <TouchableOpacity
                style={styles.headerLeft}
                onPress={navigation.goBack}>
                <Ionicons name="chevron-back" size={28} color="#000" />
              </TouchableOpacity>
            </View>
          </View>
          <FlatList
            style={{ marginBottom: 20 }}
            data={workItems}
            renderItem={renderItem}
            keyExtractor={(item, index) => `itemList-${index}`}
            ListHeaderComponent={listHeader}
            showsVerticalScrollIndicator={false}
          />
        </View>
      </TouchableWithoutFeedback>
    </SafeAreaView>
  );
};
export default DetailConstruction;

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
