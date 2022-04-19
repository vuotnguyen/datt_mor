import React, {useState} from 'react';
import {
  Alert,
  Modal,
  Picker,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {NavigationStackProp} from 'react-navigation-stack';
import {
  Header,
  TabHeader,
  ButtonDefault,
  UserBox,
  TextInput,
} from '../_components';
import {FlatList} from 'react-native-gesture-handler';
import SelectOption from './SelectOption';
import SelectUser from './SelectUser';
import {Entypo} from '../../../assets/icons';

type IProps = {
  navigation: NavigationStackProp<{}>;
};
type test = {
  setModalVisible: any;
};
export default function CreateAssignmentScreen({navigation}: IProps) {
  const [selectedValue, setSelectedValue] = useState('test1');
  const [modalVisible, setModalVisible] = useState(false);
  return (
    <SafeAreaView style={{backgroundColor: '#fff', flex: 1}}>
      <Header title={'指示作成'} goBack={navigation.goBack} />
      <View style={{flex: 1, padding: 10}}>
        {/* select work item */}
        <View
          style={
            {
              // flex: 1,
              // paddingTop: 40,
              // alignItems: 'center',
              // backgroundColor: 'pink',
            }
          }>
          {/* <Select option /> */}
          <TabHeader text={'工種を選択してください'} />
          <View style={{marginBottom: 50}}>
            {/* <Text>SelectBox</Text> */}
            <View style={{flex: 1}}>
              <SelectOption
                options={[
                  {
                    id: '1',
                    name: 'test1',
                  },
                  {
                    id: '2',
                    name: 'test2',
                  },
                  {
                    id: '3',
                    name: 'test3',
                  },
                ]}
                onChangeSelect={(id: any) => console.log(id)}
                text="Select option"
              />
            </View>
          </View>
        </View>

        {/* list users */}
        <View>
          <TabHeader
            text={'担当を選択してください'}
            buttonRight={
              <ButtonDefault
                label={'担当を追加'}
                style={styles.btnAddUser}
                onPress={() => {
                  // console.log('clickkkk');
                  setModalVisible(true);
                }}
              />
            }
          />
          {/*modal select user  */}
          <Modal
            animationType="slide"
            visible={modalVisible}
            onRequestClose={() => {
              setModalVisible(false);
            }}>
            {/* <SelectUser setModalVisible={setModalVisible}/> */}
            <SafeAreaView>
              <View>
                <TouchableOpacity
                  onPress={() => {
                    setModalVisible(false);
                  }}>
                  <Entypo
                    name="chevron-left"
                    size={25}
                    color={'#000'}
                    style={{marginRight: 10}}
                  />
                </TouchableOpacity>
                <Text>Select User in charge</Text>
              </View>
            </SafeAreaView>
          </Modal>

          <FlatList
            data={[{}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}]}
            contentContainerStyle={{marginHorizontal: -5}}
            horizontal
            renderItem={({index, item}) => <UserBox />}
            keyExtractor={(item, index) => 'userBox' + index.toString()}
          />
        </View>
        {/* note */}
        <View
          style={{
            marginTop: 20,
          }}>
          <TabHeader text={'指示内容を入力してください'} />
          <TextInput placeholder={'ＸＸＸＸＸＸ'} />
        </View>

        {/* buttons add file */}
        <View>
          {/* take a photos */}
          <View style={[styles.formControlFile, {marginTop: 18}]}>
            <View style={styles.formButton}>
              <ButtonDefault block label={'添付画像を撮影する'} />
            </View>
            {/* list photos here */}
            <View></View>
          </View>

          {/* select attach image from gallery */}
          <View style={styles.formControlFile}>
            <View style={styles.formButton}>
              <ButtonDefault block label={'添付画像を選択する'} />
            </View>
            {/* list images here */}
            <View></View>
          </View>

          {/* select an attachment */}
          <View style={styles.formControlFile}>
            <View style={styles.formButton}>
              <ButtonDefault block label={'添付ファイルを選択する'} />
            </View>
            {/* list attachment here */}
            <View></View>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  formControlFile: {
    marginBottom: 50,
  },
  formButton: {
    width: '50%',
  },
  btnAddUser: {height: 30, width: 123, marginVertical: 20},
});
