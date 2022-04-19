import React, {memo, useState} from 'react';
import {
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {NavigationStackProp} from 'react-navigation-stack';
//header
import HeaderConstructonCreate from './HeaderConstructionCreate';
import AvatarConstructionHandle from './AvatarConstructionHandle';
import {PhotoIdentifier} from '@react-native-community/cameraroll';
import SearchConstruction from './SearchConstruction';

export const CONTAINER_SIZE = 10;
const {height, width} = Dimensions.get('screen');

type Props = {
  navigation: NavigationStackProp<{}>;
};

// type test = {
//   data: string[];
//   checked: number;
// };
export interface IItemConstruction {
  name: string;
}
const CreateConstructionScreen: React.FC<Props> = ({navigation}) => {
  const [groupName, setGroupName] = useState<string>('');
  // const [selected, setselected] = useState<Array<User>>([]);
  const [selected, setselected] = useState<IItemConstruction>({name: ''});
  const [fileImage, setFileImage] = useState<PhotoIdentifier>();

  const handleGoback = () => navigation.goBack();

  return (
    <SafeAreaView style={[styles.container, {backgroundColor: '#fff'}]}>
      <TouchableWithoutFeedback>
        <KeyboardAvoidingView
          style={{flex: 1}}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 2 : 0}
          enabled>
          {/* Header Create */}
          <HeaderConstructonCreate
            // disabledButtonCreate={disabledButtonCreate}
            // handleCreateGroupChat={handleCreateGroupChat}
            // handleGoback={handleGoback}
            // loading={AdminId ? false : true}
            disabledButtonCreate={true}
            handleCreateGroupChat={() => {}}
            handleGoback={handleGoback}
            loading={false}
          />
          {/* Avatar Group */}
          <View style={{paddingHorizontal: CONTAINER_SIZE}}>
            <View
              style={{
                display: 'flex',
                justifyContent: 'flex-start',
                alignItems: 'flex-start',
                // marginTop: height * 0.02,
              }}>
              <View style={{flexDirection: 'row', alignItems: 'center'}}>
                {/* Avatar Group */}
                <AvatarConstructionHandle
                  fileImage={fileImage}
                  setFileImage={setFileImage}
                />
                <View style={{flex:1,}}><Text style={{fontSize:18}}>{selected.name}</Text></View>
                
              </View>
            </View>
          </View>

          {/* handle list user */}
          <View
            style={{
              position: 'relative',
              zIndex: 1,
              flex: 1,
              // paddingHorizontal:CONTAINER_SIZE,
            }}>
            {/* <SearchConstruction selected={selected} setSelected={setselected} /> */}
            <SearchConstruction selected={selected} onSelect={setselected} />
          </View>
        </KeyboardAvoidingView>
      </TouchableWithoutFeedback>
    </SafeAreaView>
  );
};

export default memo(CreateConstructionScreen);

const screen = Dimensions.get('screen');

const styles = StyleSheet.create({
  wrapperAvatar: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    paddingLeft: 5,
    flex: 0.5,
  },
  wrapperInput: {
    flex: 1.5,
    paddingLeft: 10,
    overflow: 'hidden',
    height: 101,
    paddingRight: 5,
    paddingTop: 10,
    flexDirection: 'row',
    position: 'relative',
    alignItems: 'center',
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
  borderIcon: {
    borderWidth: 0.5,
    borderColor: 'rgba(0,0,0,0.5)',
    backgroundColor: 'rgba(255,255,255,0.8)',
    borderRadius: 50,
  },
});
