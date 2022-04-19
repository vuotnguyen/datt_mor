import React, {useState} from 'react';
import {
  Modal,
  Pressable,
  StyleSheet,
  View,
  TouchableWithoutFeedback,
  Dimensions,
} from 'react-native';
import {Button, Text} from 'native-base';
export enum TYPE_DIALOG {
  LOGOUT = 0,
}
interface Props {
  visible: boolean;
  setVisible: Function;
  handleConfirm: Function;
  handleClose?: Function;
  titleModal?: string;
  disableTitle?: boolean;
  message?: string;
  buttonConfirm: {
    color: string;
    text: string;
  };
  buttonClose: {
    color: string;
    text: string;
  };
  disableFeedback?: boolean;
}
const {width, height} = Dimensions.get('screen');
const ModalConfirm: React.FC<Props> = ({
  children,
  visible,
  setVisible,
  handleConfirm,
  handleClose,
  message,
  titleModal,
  buttonClose,
  buttonConfirm,
  disableTitle,
  disableFeedback,
}) => {
  return (
    <>
      <Modal
        animationType="fade"
        presentationStyle="overFullScreen"
        transparent
        visible={visible}>
        <TouchableWithoutFeedback
          onPress={() => (disableFeedback ? {} : setVisible(false))}>
          <View style={styles.centeredView}>
            <View style={styles.modalView}>
              {disableTitle ? null : (
                <View style={styles.header}>
                  <Text style={[styles.textStyle, styles.title]}>
                    {titleModal}
                  </Text>
                </View>
              )}
              <View
                style={[styles.content, !disableTitle ? {} : {padding: 20}]}>
                <Text
                  style={[
                    styles.textStyle,
                    styles.textContent,
                    !disableTitle ? {} : {fontSize: 15},
                  ]}>
                  {message}
                </Text>
              </View>
              <View style={styles.line}></View>
              <View style={styles.action}>
                <Button
                  style={styles.button}
                  size="sm"
                  onPress={() => {
                    typeof handleClose === 'function' && handleClose();
                    setVisible(false);
                  }}>
                  <Text
                    style={[
                      styles.textStyle,
                      {
                        color: buttonClose.color,
                      },
                    ]}>
                    {buttonClose.text}
                  </Text>
                </Button>
                <Button
                  style={styles.button}
                  size="sm"
                  onPress={() => {
                    handleConfirm();
                    setVisible(false);
                  }}>
                  <Text
                    style={[
                      styles.textStyle,
                      {
                        color: buttonConfirm.color,
                      },
                    ]}>
                    {buttonConfirm.text}
                  </Text>
                </Button>
              </View>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </>
  );
};
const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  modalView: {
    backgroundColor: 'rgba(255,255,255,0.91)',
    borderRadius: 10,
    alignItems: 'center',
    shadowColor: '#fff',
    width: width / 1.2,
    margin: 5,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.7,
    shadowRadius: 10,
    elevation: 10,
  },
  header: {
    paddingTop: 15,
  },
  title: {
    color: '#000',
    fontSize: 15,
    textAlign: 'center',
  },
  content: {
    marginTop: 10,
    marginBottom: 15,
  },
  textContent: {
    color: '#000',
    fontWeight: 'normal',
  },
  textStyle: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
    fontSize: 12,
  },
  textCancel: {
    color: '#E7515A',
  },
  textConfirm: {
    color: '#0ACF84',
  },
  line: {
    height: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  action: {
    width: '100%',
    display: 'flex',
    flexDirection: 'row',
  },
  button: {
    elevation: 0,
    height: 40,
    width: '50%',
    borderWidth: 1,
    borderRadius: 0,
    borderColor: 'rgba(0,0,0,0.1)',
    borderRightWidth: 0.5,
    borderLeftWidth: 0.5,
    backgroundColor: 'transparent',
  },
  btnConfirm: {
    backgroundColor: '#0ACF83',
  },
  btnClose: {
    backgroundColor: '#FF5E5E',
  },
});
export default ModalConfirm;
