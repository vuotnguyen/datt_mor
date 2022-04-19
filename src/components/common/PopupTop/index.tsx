import React, {memo} from 'react';
import {
  StyleSheet,
  Text,
  View,
  Modal,
  Dimensions,
  TouchableWithoutFeedback,
  Platform,
  UIManager,
  FlatList,
  TouchableOpacity,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {COLOR_CONSTANT} from '../../../styles/colors';
const {height, width} = Dimensions.get('screen');
type TabType = {
  title: string;
  onTabPress: () => void;
  icon?: Element;
};
const PopupTop: React.FC<{
  isShow: boolean;
  title: string;
  tabs: Array<TabType>;
  horizontal?: boolean;
  tabAlign?: 'center' | 'left' | 'right' | undefined;
  handleClose: () => void;
}> = ({isShow, title, handleClose, tabs, tabAlign, horizontal}) => {
  if (Platform.OS === 'android') {
    UIManager.setLayoutAnimationEnabledExperimental(true);
  }
  return (
    <Modal
      animationType={'none'}
      transparent={true}
      visible={isShow}
      onRequestClose={handleClose}>
      <TouchableWithoutFeedback onPress={handleClose}>
        <View
          style={{
            flex: 1,
            backgroundColor: 'rgba(0,0,0,0.6)',
          }}
        />
      </TouchableWithoutFeedback>

      <SafeAreaView
        style={{
          backgroundColor: '#fff',
          position: 'absolute',
          width: '100%',
        }}>
        {/* <View>
          <Text style={{fontWeight: '700', fontSize: 15}}>{title}</Text>
        </View> */}
        {/* list tabs */}
        <FlatList
          data={tabs}
          horizontal={horizontal ?? false}
          keyExtractor={(item, index) => `Tab_popup_${index}`}
          contentContainerStyle={{
            flex: 1,
            justifyContent: 'space-around',
            // backgroundColor: 'red',
          }}
          renderItem={({item}) => (
            <TouchableOpacity activeOpacity={0.8} onPress={item.onTabPress}>
              <View style={styles.buttonContainer}>
                <View style={styles.button}>
                  <Text style={styles.buttonText}>{item.title}</Text>
                </View>
              </View>
            </TouchableOpacity>
          )}
        />
      </SafeAreaView>
    </Modal>
  );
};
export default memo(PopupTop);
const styles = StyleSheet.create({
  buttonContainer: {
    // flex: 1,
    height: 60,
    width: 100,
    backgroundColor: COLOR_CONSTANT.PRIMARY_COLOR,
    marginVertical: 10,
    borderRadius:3,
  },
  button: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
    textAlign: 'center',
  },
});
