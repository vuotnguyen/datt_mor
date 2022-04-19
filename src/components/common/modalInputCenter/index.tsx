import React, {
  memo,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
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
  TextInput,
  KeyboardAvoidingView,
} from 'react-native';
import AntDesign from 'react-native-vector-icons/AntDesign';
import MESSAGES from '../../../config/Messages';
import * as stylesGlobal from '../../../styles';
const {height} = Dimensions.get('screen');
type TabType = {
  title: string;
  onTabPress: () => void;
};
const modalInputCenter: React.FC<{
  isShow: boolean;
  title: string;
  handleClose: () => void;
  initialText: string;
  handleConfirm: (value: string) => void;
}> = ({isShow, title, handleClose, children, initialText, handleConfirm}) => {
  let refTextInput = useRef<TextInput>(null);
  const [text, setText] = useState<string>(initialText);
  let isDisabled = useMemo(() => initialText === text.trim() || !text.trim(), [
    text,
  ]);
  useEffect(() => {
    setText(initialText);
  }, [isShow]);

  const handleClear = useCallback(() => {
    setText('');
  }, []);

  return (
    <Modal
      animationType={'fade'}
      transparent={true}
      visible={isShow}
      onShow={() => {
        refTextInput.current?.blur();
        refTextInput.current?.focus();
      }}
      onRequestClose={handleClose}>
      <KeyboardAvoidingView
        style={{flex: 1}}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 2 : 0}
        enabled>
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
                borderBottomWidth: 0.5,
                borderColor: '#ccc',
                paddingVertical: 20,
                paddingHorizontal: 5,
              }}>
              {/* title Popup */}
              <Text>{title}</Text>
            </View>
            {/* children */}
            <View style={{paddingVertical: 10}}>
              <TextInput
                ref={refTextInput}
                onChangeText={setText}
                value={text}
                autoFocus={true}
                maxLength={50}
                placeholder={'グループ名'}
                numberOfLines={2}
                multiline
                style={{marginRight: 40, marginTop: 5}}
              />
              <View
                style={{
                  position: 'absolute',
                  right: 0,
                  top: 0,
                }}>
                <Text
                  style={{
                    marginBottom: 5,
                    fontSize: 14,
                    color: 'rgba(0,0,0,0.3)',
                  }}>
                  {text.length}/50
                </Text>
              </View>
              <View
                style={{
                  position: 'absolute',
                  right: 0,
                  height: '100%',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexDirection: 'row',
                  transform: [{translateY: 18}],
                  // paddingTop: 20,
                }}>
                <TouchableOpacity
                  style={[
                    {
                      backgroundColor: 'rgba(0,0,0,0.3)',
                      paddingVertical: 4,
                      paddingHorizontal: 4.5,
                      borderRadius: 20 / 2,
                      display: text.length > 0 ? 'flex' : 'none',
                    },
                  ]}
                  onPress={handleClear}>
                  <AntDesign name={'close'} size={10} color={'#fff'} />
                </TouchableOpacity>
              </View>
            </View>

            {/* action */}
            <View style={styles.action}>
              <TouchableOpacity style={styles.button} onPress={handleClose}>
                <Text style={{color: '#000'}}>キャンセル</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.button}
                disabled={isDisabled}
                onPress={() => {
                  handleConfirm(text);
                }}>
                <Text
                  style={{
                    color: isDisabled ? '#ccc' : stylesGlobal.colors.SUCCESS,
                  }}>
                  変更
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};
export default memo(modalInputCenter);
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
