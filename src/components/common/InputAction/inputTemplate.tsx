import React, {memo, useCallback, useEffect, useRef, useState} from 'react';
import {
  Dimensions,
  FlatList,
  Image,
  Keyboard,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import {ScrollView} from 'react-native-gesture-handler';
import MESSAGES_const from '../../../config/Messages';
import {ButtonIcon} from '../../buttons';
import {
  AntDesign,
  Entypo,
  FontAwesome,
  MaterialIcons,
} from '../../../assets/icons';
import {debounce} from 'lodash';
import {PhotoIdentifier} from '@react-native-community/cameraroll';
import EmojiBoard from '../../organisms/EmojiBoard';
import GalleryModal from '../../../components/organisms/Gallery';
import {useGallary} from '../../../hooks/gallery';
import {useMedia} from '../../../hooks/camera';
import {IToast, TypeToash} from '../../../models/common';
import {modal} from '../../../stories/types';
import {createAction} from '../../../stories/actions';
import Messages from '../../../config/Messages';
import {useAppDispatch} from '../../../stories';
const {width, height} = Dimensions.get('screen');
const defaultText = 'Aa';
const limitedCount = 50;
enum KeyboardComponentType {
  GallaryKB = 'GallaryKB',
  EmojiKB = 'EmojiKB',
}
type Props = {};
const InputTemplate: React.FC<Props> = () => {
  let refInput = useRef<TextInput | null>(null);
  let refFlatList = useRef<FlatList | null>(null);
  let refScrollView = useRef<ScrollView | null>(null);
  const dispatch = useAppDispatch();
  let textPlaceHolder = defaultText;
  const [
    keyBoardComponent,
    setKeyBoardComponent,
  ] = useState<KeyboardComponentType | null>(null);
  const [refreshGallery, setRefreshGallery] = useState<boolean>(false);
  const [text, setText] = useState<string>('');
  const [files, setfiles] = useState<
    Array<{
      img: PhotoIdentifier;
      active: boolean;
      count: number | null;
      disabled: boolean;
    }>
  >([]);
  useEffect(() => {
    Keyboard.addListener('keyboardDidShow', () => {});
  }, []);
  /**
   *
   * @param type enum KeyboardComponentType
   */
  const handleOpenKeyboard = useCallback(
    (type: KeyboardComponentType) => () => {},
    [keyBoardComponent],
  );

  const handleOnFocus = useCallback(() => {
    setKeyBoardComponent(null);
    if (refInput && refInput.current)
      refInput.current.setNativeProps({
        placeholder: MESSAGES_const.CHAT.MSG_CHAT_TEXT_003,
      });
  }, [refInput]);

  const handleOnBlur = useCallback(() => {
    if (refInput && refInput.current)
      refInput.current.setNativeProps({
        placeholder: defaultText,
      });
  }, [refInput]);

  const handleSend = useCallback(
    (val: string) => () => {
      console.log('text', val);
    },
    [],
  );

  /**
   *
   * @returns Component group input actions
   */
  const renderInputAction = useCallback(() => {
    // const {text, refInput, files} = this.state;
    return (
      <>
        <>
          <ButtonIcon onPress={() => undefined}>
            <View
              style={[
                {
                  paddingHorizontal: 9,
                  paddingVertical: 9.5,
                },
                styles.centerAlign,
              ]}>
              <Entypo size={20} name="squared-plus" />
            </View>
          </ButtonIcon>
          {/* capture image button */}
          <ButtonIcon onPress={() => {}}>
            <View
              style={[
                {
                  paddingHorizontal: 9.5,
                  paddingVertical: 9,
                  // paddingBottom: 9,
                },
                styles.centerAlign,
              ]}>
              <Entypo name="camera" size={20} style={{color: '#000'}} />
            </View>
          </ButtonIcon>
          {/* gallary button */}
          <ButtonIcon onPress={() => {}}>
            <View
              style={[
                {
                  paddingHorizontal: 9,
                  paddingVertical: 9.5,
                  // paddingBottom: 9,
                },
                styles.centerAlign,
              ]}>
              <FontAwesome size={20} name="image" />
            </View>
          </ButtonIcon>
        </>
        {/* input text */}
        <View
          style={{
            display: 'flex',
            alignItems: 'center',
            flexDirection: 'row',
            position: 'relative',
            flex: 1,
          }}>
          <TextInput
            onChangeText={setText}
            ref={refInput}
            value={text}
            placeholder={textPlaceHolder}
            onFocus={handleOnFocus}
            onBlur={handleOnBlur}
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
          {/* emoji button */}
          {/* <View style={{position: 'absolute', right: 0, bottom: 0}}>
            <ButtonIcon onPress={() => {}}>
              <View
                style={[
                  {
                    paddingHorizontal: 9,
                    paddingVertical: 9,
                    paddingBottom: 9,
                  },
                  styles.centerAlign,
                ]}>
                <Entypo size={20} name="emoji-happy" />
              </View>
            </ButtonIcon>
          </View> */}
        </View>
        {/* send button */}
        <ButtonIcon
          onPress={handleSend(text)}
          disabled={!(text.trim() || files.length > 0)}
          style={{marginHorizontal: 6}}>
          <View
            style={[
              {
                paddingHorizontal: 10,
                paddingVertical: 10,
              },
              styles.centerAlign,
            ]}>
            <MaterialIcons
              size={18}
              name="send"
              // style={{marginBottom: 5}}
              color={
                text.trim() || files.length > 0
                  ? '#000'
                  : 'rgba(230,230,230,0.7)'
              }
            />
          </View>
        </ButtonIcon>
      </>
    );
  }, [text, files, refInput]);

  return (
    <View>
      <View style={[styles.container]}>
        <View style={{position: 'relative'}}>
          <View style={[styles.groupActions]}>{renderInputAction()}</View>
        </View>
      </View>
    </View>
  );
};
export default memo(InputTemplate);
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
    backgroundColor: '#fff',
  },
});
