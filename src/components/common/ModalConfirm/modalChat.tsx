import {get} from 'lodash';
import React from 'react';
import {
  View,
  Text,
  Modal,
  TouchableWithoutFeedback,
  TouchableOpacity,
} from 'react-native';
import Messages from '../../../config/Messages';
import {colors} from '../../../styles';
export type IModalChatConfirm = {
  content?: any;
  onConfirm?: () => void;
  onCancel?: () => void;
};
const ModalChatConfirm = ({
  modalConfirm,
  setModalConfirm = () => undefined,
}: {
  modalConfirm?: IModalChatConfirm | null | undefined;
  setModalConfirm?: (val: IModalChatConfirm | null) => void;
}) => {
  return (
    <>
      <Modal animationType={'none'} transparent visible={Boolean(modalConfirm)}>
        <View
          style={{
            flex: 1,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
            zIndex: 99,
          }}>
          <TouchableWithoutFeedback onPress={() => setModalConfirm(null)}>
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
              padding: 20,
              paddingBottom: 0,
              zIndex: 99,
            }}>
            {/* text */}
            <Text
              style={{
                color: 'rgba(0,0,0,0.5)',
                fontSize: 16,
                marginBottom: 15,
                flex: 1,
                width: '100%',
                minWidth: '100%',
              }}>
              {get(modalConfirm, ['content'], '')}
            </Text>
            {/* button actions*/}
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-around',
              }}>
              <TouchableOpacity
                style={{
                  padding: 15,
                  width: '40%',
                  borderRadius: 4,
                }}
                onPress={() => {
                  get(modalConfirm, 'onCancel', () => undefined)();
                  setModalConfirm(null);
                }}>
                <Text
                  style={{
                    textAlign: 'center',
                    fontSize: 15,
                    color: 'rgba(0,0,0,0.5)',
                  }}>
                  {Messages.COMMON.BUTTON.CANCEL}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={{
                  padding: 15,
                  width: '40%',
                  borderRadius: 4,
                }}
                onPress={() => {
                  get(modalConfirm, 'onConfirm', () => undefined)();
                  setModalConfirm(null);
                }}>
                <Text
                  style={{
                    textAlign: 'center',
                    fontSize: 15,
                    color: colors.SUCCESS,
                  }}>
                  {Messages.COMMON.BUTTON.CONFIRM}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
};
export default ModalChatConfirm;
