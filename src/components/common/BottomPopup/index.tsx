import React, {memo, useCallback, useState} from 'react';
import {
  StyleSheet,
  Text,
  View,
  Modal,
  Dimensions,
  TouchableWithoutFeedback,
  ModalProps,
  Pressable,
  Platform,
  UIManager,
  FlatList,
  TouchableOpacity,
} from 'react-native';
const {height} = Dimensions.get('screen');
type TabType = {
  title: string;
  onTabPress: () => void;
};
const BottomPopup: React.FC<{
  isShow: boolean;
  title: string;
  tabs: Array<TabType>;
  tabAlign?: 'center' | 'left' | 'right' | undefined;
  handleClose: () => void;
}> = ({isShow, title, handleClose, tabs, tabAlign}) => {
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
            justifyContent: 'flex-end',
          }}
        />
      </TouchableWithoutFeedback>
      <View
        style={{
          backgroundColor: '#fff',
          overflow: 'scroll',
          borderTopEndRadius: 10,
          borderTopStartRadius: 10,
          position: 'absolute',
          bottom: 0,
          width: '100%',
          paddingTop: 10,
          paddingHorizontal: 5,
        }}>
        {/* title popup */}
        <View
          style={{
            borderBottomWidth: 0.5,
            borderColor: '#ccc',
            paddingBottom: 15,
          }}>
          {/* title Popup */}
          <Text style={{color: '#000', fontWeight: '600', fontSize: 18}}>
            {title}
          </Text>
        </View>

        {/* list tabs */}
        <FlatList
          data={tabs}
          keyExtractor={(item, index) => `Tab_popup_${index}`}
          style={{}}
          renderItem={({item}) => (
            <TouchableOpacity
              onPress={() => {
                item.onTabPress();
                handleClose();
              }}>
              <View
                style={{
                  paddingVertical: 15,
                  marginBottom: 5,
                }}>
                <Text style={{textAlign: tabAlign ? tabAlign : 'left'}}>
                  {item.title}
                </Text>
              </View>
            </TouchableOpacity>
          )}
          ListFooterComponent={() => (
            <TouchableOpacity onPress={handleClose}>
              <View style={{paddingVertical: 15, marginBottom: 5}}>
                <Text style={{textAlign: tabAlign ? tabAlign : 'left'}}>
                  Close
                </Text>
              </View>
            </TouchableOpacity>
          )}
        />
      </View>
    </Modal>
  );
};
export default memo(BottomPopup);
const styles = StyleSheet.create({});
