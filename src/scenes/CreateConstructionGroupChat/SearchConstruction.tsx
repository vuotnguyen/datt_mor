import React, {memo, useCallback, useEffect, useRef, useState} from 'react';
import {
  Keyboard,
  ScrollView,
  StyleSheet,
  Text,
  View,
  RefreshControl,
  TextInput,
  FlatList,
  Pressable,
  Dimensions,
  TouchableNativeFeedback,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import MESSAGES from '../../config/Messages';
import {ButtonIcon} from '../../components/buttons';
import AvatarRes from '../../components/common/Avatar';
import {Entypo, Feather, AntDesign} from '../../assets/icons';
import {IChat, User} from '../../models/chat';
import ChatBoxLoading from '../../components/organisms/ChatBoxItem/ChatBoxLoading';
import * as globalStyles from '../../styles';
import UserBoxItem from '../../components/organisms/UserBoxItem';
import * as apiUser from '../../services/user';
import {debounce} from 'lodash';
import {CONTAINER_SIZE, IItemConstruction} from '.';
import {TouchableWithoutFeedback} from 'react-native-gesture-handler';
const screen = Dimensions.get('screen');

// type Props = {
//   selected: Array<string>;
//   setSelected: (listItem: Array<User>) => void;
//   listUserOld?: Array<User>;
// };
type Props = {
  selected: IItemConstruction;
  onSelect: (item: IItemConstruction) => void;
};
// const SearchConstruction: React.FC<Props> = ({
const SearchConstruction: React.FC<Props> = ({selected, onSelect}) => {
  const [keyword, setKeyword] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [list, setList] = useState<Array<IItemConstruction>>([
    {name: 'XXXXXXXXXX工事1'},
    {name: 'XXXXXXXXXX工事2'},
    {name: 'XXXXXXXXXX工事3'},
    {name: 'XXXXXXXXXX工事4'},
    {name: 'XXXXXXXXXX工事5'},
    {name: 'XXXXXXXXXX工事6'},
    {name: 'XXXXXXXXXX工事7'},
    {name: 'XXXXXXXXXX工事8'},
    {name: 'XXXXXXXXXX工事9'},
    {name: 'XXXXXXXXXX工事10'},
  ]);

  const scrollRef = useRef<ScrollView | any>();
  const refInputSearch = useRef<TextInput>(null);
  /**
   *  fetch get list data
   */
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      let res = await apiUser.getAllUsers();
    } catch (error) {
      console.log('error getlist chat', error);
    }
    setLoading(false);
  }, []);
  /**
   *  search user
   *
   */
  const _handleSearch = useCallback((str: string) => {}, []);

  /**
   *  handleOnChangeText
   */
  const handler = useCallback(debounce(_handleSearch, 1000), []);
  const handleOnChangeText = useCallback(
    (e: string) => {
      setKeyword(e);
      if (!loading) setLoading(true);
      handler(e);
    },
    [loading],
  );

  /**
   *  clear text search user
   *
   */
  const _handleClear = useCallback(() => {
    setKeyword('');
    fetchData();
  }, []);
  const handleSelected = (itemSelected: IItemConstruction) => () => {
    onSelect(itemSelected);
  };

  const renderList = () => {
    return list.map((item, index) => (
      <View key={index.toString()} style={{flexDirection: 'column'}}>
        <View style={{paddingHorizontal: CONTAINER_SIZE}}>
          <BoxConstruction
            item={item}
            key={index.toString()}
            checked={selected.name == item.name}
            onPress={handleSelected(item)}
          />
        </View>

        {index !== list.length - 1 ? (
          <View
            style={{
              backgroundColor: 'rgba(0,0,0,0.2)',
              height: 0.7,
              width: '100%',
            }}
          />
        ) : null}
      </View>
    ));
  };

  return (
    <View style={{position: 'relative', zIndex: 1}}>
      <View
        style={{
          backgroundColor: '#fff',
          paddingVertical: 10,
          paddingHorizontal: CONTAINER_SIZE,
        }}>
        <View style={[styles.inpWrapper, {height: 35}]}>
          <TextInput
            ref={refInputSearch}
            placeholder={MESSAGES.CHAT.MSG_CHAT_TEXT_007}
            style={styles.input}
            value={keyword ? keyword : ''}
            numberOfLines={1}
            // editable={!loading}
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
      <ScrollView
        nestedScrollEnabled={false}
        removeClippedSubviews={true}
        overScrollMode={'never'}
        scrollToOverflowEnabled={false}
        onResponderStart={Keyboard.dismiss}
        ref={scrollRef}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
        showsHorizontalScrollIndicator={false}>
        {/* search user */}

        <View
          style={{
            // paddingTop: 5,
            paddingBottom: 5,
            backgroundColor: '#fff',
          }}>
          {/* list */}
          <View>{renderList()}</View>
        </View>
        <View
          style={{height: screen.height * 0.25, width: screen.width}}></View>
      </ScrollView>
    </View>
  );
};
const BoxConstruction = ({
  item,
  checked,
  onPress,
}: {
  item: IItemConstruction;
  checked: boolean;
  onPress: () => void;
}) => {
  return (
    <TouchableOpacity onPress={onPress}>
      <View style={boxStyles.container}>
        <Text>{item.name}</Text>
        <View>
          <Feather
            size={20}
            color={checked ? 'green' : 'rgba(0,0,0,0.7)'}
            name={checked ? 'check-circle' : 'circle'}
          />
        </View>
      </View>
    </TouchableOpacity>
  );
};
const boxStyles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    // paddingBottom: 25,
    paddingVertical: 20,
    // minHeight:25,
    // marginBottom:10,
    paddingHorizontal: 10,
  },
});
export default memo(SearchConstruction);
const styles = StyleSheet.create({
  container1: {
    flex: 1,
    marginTop: StatusBar.currentHeight || 0,
  },
  item: {
    padding: 20,
    marginVertical: 8,
    marginHorizontal: 16,
  },
  title: {
    fontSize: 14,
  },

  container: {
    flex: 1,
  },
  avatarGroup: {},
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
  iconBack: {
    position: 'absolute',
    left: 2,
    top: 0,
    bottom: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  iconNewGroup: {
    position: 'absolute',
    right: 2,
    top: 0,
    bottom: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  deleteDot: {
    position: 'absolute',
    top: 0,
    right: 1,
    // height: 25,
    // width: 25,
    paddingVertical: 4,
    paddingHorizontal: 4.5,
    backgroundColor: 'rgba(0,0,0,1)',
    borderRadius: 20 / 2,
    transform: [{translateY: -1}, {translateX: 8}],
    // borderColor: '#fff',
    // borderWidth: 1,
    flex: 1,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  inpWrapper: {
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
  borderIcon: {
    borderWidth: 0.5,
    borderColor: 'rgba(0,0,0,0.5)',
    backgroundColor: 'rgba(255,255,255,0.8)',
    borderRadius: 50,
  },
});
