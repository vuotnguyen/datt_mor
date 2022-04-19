import React, {memo} from 'react';
import {ActivityIndicator, Modal, StyleSheet, Text, View} from 'react-native';

const LoadingModal: React.FC<{loading: boolean}> = memo(({loading}) => (
  <Modal
    animationType="none"
    presentationStyle="overFullScreen"
    transparent
    visible={loading}>
    <View style={styles.centeredView}>
      <View style={styles.modalView}>
        <ActivityIndicator size="small" color="#999999" />
      </View>
    </View>
  </Modal>
));
export default LoadingModal;
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centerHorizontalView: {
    justifyContent: 'center',
    flexDirection: 'row',
  },
  borderIcon: {
    borderWidth: 0.5,
    borderColor: 'rgba(0,0,0,0.5)',
    backgroundColor: 'rgba(255,255,255,0.8)',
    borderRadius: 50,
  },
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
