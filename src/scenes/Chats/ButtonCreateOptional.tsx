import React, {useState} from 'react';
import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import {ButtonIcon} from '../../components/buttons';
import {
  AntDesign,
  FontAwesome5,
  MaterialCommunityIcons,
  Octicons,
} from '../../assets/icons';
import PopupTop from '../../components/common/PopupTop';
import {useNavigation} from '@react-navigation/native';
import {RootStackNavigationProp} from '../../navigations/RootStack';
import {COLOR_CONSTANT} from '../../styles/colors';

const ButtonOptionCreate = (): JSX.Element => {
  const navigation = useNavigation<RootStackNavigationProp>();
  // const [showPopupCreate, setShowPopupCreate] = useState<boolean>(false);
  return (
    <>
      {/* <ButtonIcon
        onPress={() => {
          setShowPopupCreate(true);
        }}
        style={{marginRight: 5}}> */}
      <View style={{paddingHorizontal: 7, paddingVertical: 7}}>
        {/* <MaterialCommunityIcons name={'chat-plus-outline'} size={21} /> */}
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => {
            // setShowPopupCreate(true);
            navigation.navigate('CreateGroupChat');
          }}>
          <View style={styles.buttonContainer}>
            <View style={styles.button}>
              <Text style={styles.buttonText}>グループ追加</Text>
            </View>
          </View>
        </TouchableOpacity>
      </View>
      {/* </ButtonIcon> */}
      {/* <PopupTop
        isShow={showPopupCreate}
        horizontal
        tabs={[
          // {
          //   title: '案件から作成',
          //   onTabPress: () => {},
          //   icon: <Octicons name={'project'} size={30} />,
          // },
          {
            title: '工事から作成',
            onTabPress: () => {
              setShowPopupCreate(false);
              navigation.navigate('CreateConstructionGroupChat');
            },
            icon: <FontAwesome5 name={'tasks'} size={29} />,
          },
          {
            title: '会話相手を選択',
            onTabPress: () => {
              setShowPopupCreate(false);
              navigation.navigate('CreateGroupChat');
            },
            icon: <AntDesign name={'addusergroup'} size={30} />,
          },
        ]}
        handleClose={() => setShowPopupCreate(false)}
        // title={'グループを作成'}
        title={''}
      /> */}
    </>
  );
};

const styles = StyleSheet.create({
  buttonContainer: {
    height: 24,
    width: 95,
    backgroundColor: COLOR_CONSTANT.PRIMARY_COLOR,
    borderRadius: 3,
  },
  button: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
  },
  buttonText: {color: '#FFFFFF', fontSize: 12, textAlign: 'center'},
});

export default ButtonOptionCreate;
