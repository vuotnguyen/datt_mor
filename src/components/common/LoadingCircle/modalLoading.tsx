import React from 'react';
import {StyleSheet, Text, View, ActivityIndicator, Modal} from 'react-native';

export type IModalData = {
  open: () => void;
  close: () => void;
};

const ModalLoading = ({setRef}: {setRef: (val: IModalData) => void}) => {
  const [visable, setVisable] = React.useState<boolean>(false);
  const open = () => {
    setVisable(true);
  };
  const close = () => {
    setVisable(false);
  };
  React.useEffect(() => {
    setRef({open, close});
  }, []);
  return (
    <Modal
      animationType="fade"
      presentationStyle="overFullScreen"
      transparent
      visible={visable}>
      <View style={styles.centeredView}>
        <View style={styles.modalView}>
          <ActivityIndicator size="small" color="#999999" />
        </View>
      </View>
    </Modal>
  );
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

export default ModalLoading;
