import React, {useRef, useState} from 'react';
import {StyleSheet, Text, View, ActivityIndicator, Modal} from 'react-native';
import {TouchableHighlight} from 'react-native-gesture-handler';
import {useAppSelector} from '../../../stories';

interface Props {}

const LoadingCircle: React.FC<Props> = ({}) => {
  const loading = useAppSelector(state => state.dataCache.loading.value);
  return loading ? (
    <Modal
      animationType="fade"
      presentationStyle="overFullScreen"
      transparent
      visible={loading}>
      <View style={styles.centeredView}>
        <View style={styles.modalView}>
          <ActivityIndicator size="small" color="#999999" />
        </View>
      </View>
    </Modal>
  ) : null;
};

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  modalView: {
    backgroundColor: 'white',
    borderRadius: 10,
    alignItems: 'center',
    shadowColor: '#000',
    padding: 10,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
});

export default LoadingCircle;
