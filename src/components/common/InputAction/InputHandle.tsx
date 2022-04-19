import React, {memo, useCallback, useEffect, useRef, useState} from 'react';
import {Dimensions, StyleSheet, TextInput, Platform} from 'react-native';
import MESSAGES_const from '../../../config/Messages';
import {KeyboardComponentType} from './KeyboardServices';
import {debounce} from 'lodash';
const {height} = Dimensions.get('screen');
const defaultText = 'Aa';
const InputHandle: React.FC<{
  messageText: string;
  setMessageText: (val: string) => void;
  setKeyBoardComponent: (type: KeyboardComponentType | null) => void;
  refScrollView: React.MutableRefObject<any>;
}> = memo(
  ({messageText, setMessageText, setKeyBoardComponent, refScrollView}) => {
    const refInput = useRef<TextInput>(null);
    const [text, setText] = useState<string>('');
    useEffect(() => {
      console.log('messageText', messageText);
      setText(messageText);
    }, [messageText]);
    const handler = useCallback(
      debounce((text: string) => setMessageText(text), 100),
      [],
    );
    const handleChangeText = useCallback((e: string) => {
      setText(e);
      handler(e);
    }, []);
    return (
      <TextInput
        onChangeText={handleChangeText}
        ref={refInput}
        placeholder={defaultText}
        value={text ? text : ''}
        onFocus={() => {
          if (refInput && refInput.current)
            refInput.current.setNativeProps({
              placeholder: MESSAGES_const.CHAT.MSG_CHAT_TEXT_003,
            });
          if (refScrollView && refScrollView.current)
            refScrollView.current.scrollToEnd();
          setKeyBoardComponent(null);
        }}
        onBlur={() => {
          if (refInput && refInput.current)
            refInput.current.setNativeProps({
              placeholder: defaultText,
            });
        }}
        multiline
        style={[
          styles.input,
          {
            width: '100%',
            marginLeft: 5,
            color: '#000',
            minHeight: 40,
            // height:40,
            maxHeight: 100,
            padding: 0,
            paddingHorizontal: 14,
            paddingRight: 30,
          },
          Platform.OS === 'ios'
            ? {
                paddingBottom: 10,
                paddingTop: 14,
              }
            : {
                paddingBottom: 3,
                paddingTop: 3,
              },
        ]}
      />
    );
  },
);

const styles = StyleSheet.create({
  container: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowOpacity: 0,

    elevation: 0,
  },
  groupActions: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'flex-end',
    // paddingVertical: 5,
    paddingTop: 0,
    backgroundColor: '#fff',
  },
  btnAttach: {
    // backgroundColor: 'blue',
    height: 35,
    width: 35,
    borderRadius: 35 / 2,
  },
  input: {
    backgroundColor: 'rgba(229,229,229,0.5)',
    paddingHorizontal: 10,
    borderRadius: 20,
    flex: 1,
    // flexWrap: 'wrap',
    fontSize: 13,
  },
  ImagePickerDiv: {
    position: 'relative',
    margin: 2,
    paddingVertical: 4,
  },
  deleteDot: {
    position: 'absolute',
    top: 4,
    right: 1,
    // height: 25,
    // width: 25,
    paddingVertical: 4,
    paddingHorizontal: 4,
    backgroundColor: 'rgba(0,0,0,1)',
    borderRadius: 20 / 2,
    transform: [{translateY: -5}],
    // borderColor: '#fff',
    // borderWidth: 1,
    flex: 1,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  btnSend: {
    backgroundColor: 'blue',
    height: 35,
    width: 35,
    borderRadius: 35 / 2,
  },
  centerAlign: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  wrapperKeyboardBottom: {
    position: 'relative',
    zIndex: 55,
    height: height / 3,
    paddingVertical: 4,
    backgroundColor: '#fff',
  },
});
export default InputHandle;
