import React, {memo} from 'react';
import {
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import Messages from '../../../config/Messages';
import {colors} from '../../../styles';
type Props = {
  isShow: boolean;
  handleClose: () => void;
  messages: string;
  handleConfirm: () => void;
};
const ModalConfirmV2: React.FC<Props> = ({
  handleClose,
  isShow,
  messages,
  handleConfirm,
}) => {
  return (
    <Modal
      animationType={'none'}
      transparent={true}
      visible={isShow}
      onRequestClose={handleClose}>
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
          <View
            style={{
              //   borderBottomWidth: 0.5,
              borderColor: '#ccc',
              paddingVertical: 20,
              paddingHorizontal: 5,
            }}>
            {/* title Popup */}
            <Text style={{fontSize: 15,lineHeight:15*1.8}}>{messages}</Text>
          </View>
          {/* children */}
          {/* action */}
          <View style={styles.action}>
            <TouchableOpacity style={styles.button} onPress={handleClose}>
              <Text style={{color: '#000'}}>
                {Messages.COMMON.BUTTON.CANCEL}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.button} onPress={handleConfirm}>
              <Text style={{color: colors.DANGER}}>
                {Messages.COMMON.BUTTON.CONFIRM}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};
export default memo(ModalConfirmV2);
const styles = StyleSheet.create({
  action: {
    width: '100%',
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  button: {
    elevation: 0,
    height: 40,
    paddingHorizontal: 15,
    borderRadius: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnConfirm: {
    backgroundColor: '#0ACF83',
  },
  btnClose: {
    backgroundColor: '#FF5E5E',
  },
  textStyle: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
    fontSize: 12,
  },
});
