import React, { memo, useCallback, useState } from 'react';
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
const { height } = Dimensions.get('screen');
type TabType = {
  title: string;
  onTabPress: () => void;
  disableAutoClosed?: boolean
};
type Props = {
  isShow: boolean;
  title: string;
  tabs: Array<TabType>;
  tabAlign?: 'center' | 'left' | 'right' | undefined;
  handleClose: () => void;
}
const PopupCenter = ({ isShow, title, handleClose, tabs, tabAlign }: Props) => {
  return (
    <Modal
      animationType={'none'}
      transparent={true}
      visible={isShow}
      onRequestClose={handleClose}
    >
      <View
        style={{
          flex: 1,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
        <TouchableWithoutFeedback onPress={handleClose}>
          <View
            style={{
              flex: 1,
              backgroundColor: 'rgba(0,0,0,0.6)',
              justifyContent: 'flex-end',
              width: '100%',
              height: '100%',
            }}
          />
        </TouchableWithoutFeedback>
        <View
          style={{
            backgroundColor: '#fff',
            position: 'absolute',
            width: '80%',
            paddingHorizontal: 20,
          }}>
          {/* list tabs */}
          <FlatList
            data={tabs}
            keyExtractor={(item, index) => `Tab_popup_${index}`}
            renderItem={({ item }) => (
              <TouchableOpacity
                onPress={() => {
                  handleClose();
                  if (item.disableAutoClosed) {
                    setTimeout(() => item.onTabPress(), 1000);
                  } else { item.onTabPress() };

                }}
              >
                <View
                  style={{
                    paddingVertical: 15,
                  }}>
                  <Text style={{ textAlign: tabAlign ? tabAlign : 'left' }}>
                    {item.title}
                  </Text>
                </View>
              </TouchableOpacity>
            )}
          />
        </View>
      </View>
    </Modal>
  );
};
export default (PopupCenter);
const styles = StyleSheet.create({});
