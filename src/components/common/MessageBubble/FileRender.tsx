import React, {memo, useCallback} from 'react';
import {
  ActivityIndicator,
  Dimensions,
  Image,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {moderateScale} from 'react-native-size-matters';
import {
  FileLocal,
  IFileObject,
  IMessageReceiver,
  STATUS_MESSAGE,
} from '../../../models/chat';
import {useDate} from '../../../hooks/date';
import MESSAGES from '../../../config/Messages';
import {TouchableWithoutFeedback} from 'react-native-gesture-handler';
import {useAppDispatch} from '../../../stories';
import {ButtonIcon} from '../../buttons';
import {Ionicons} from '../../../assets/icons';
import ImageItem from './ImageItem';
import {useS3} from '../../../hooks/aws';
import {InfoUser} from '../../../models/user';
import {FileChatComponent} from '../ChatHelperComponents';
import {get} from 'lodash';
import {IImage} from '../../../models/image';
import {createAction} from '../../../stories/actions';
import {modal} from '../../../stories/types';
import {PopoverMessage} from '../ChatHelperComponents';
const screen = Dimensions.get('screen');

const FileRender: React.FC<{
  messageItem: IMessageReceiver;
  mine: boolean;
  isFailLocal: boolean;
  userMessage: InfoUser | null;
  onRefeshSend: (mess: IMessageReceiver) => void;
}> = memo(({messageItem, mine, isFailLocal, onRefeshSend, userMessage}) => {
  const dispatch = useAppDispatch();
  const {getSignedUrl} = useS3();
  const {getTime} = useDate();
  const responsiveHeader = (length: number) => {
    let maxWidthMessage = screen.width * 0.7 - 4;
    if (length === 1) {
      return maxWidthMessage;
    }
    if (length > 1) {
      return maxWidthMessage / 2;
    }
    return maxWidthMessage;
  };

  const renderFileLocal = () => {
    if (messageItem.filesLocal && messageItem.filesLocal.length > 0) {
      return messageItem.filesLocal.map((item: FileLocal, idx: number) => {
        if (!messageItem.filesLocal) return null;
        if (item.isImage)
          return (
            <TouchableWithoutFeedback
              key={idx}
              style={styles.ImageFileLocalWrapper}>
              <View
                style={[
                  styles.overLoadImageLocal,
                  !isFailLocal && messageItem.id_message === 'local'
                    ? {backgroundColor: 'rgba(230,230,230,0.5)'}
                    : {backgroundColor: 'rgba(230,230,230,0.6)'},
                ]}>
                {!isFailLocal ? (
                  <ActivityIndicator size={'small'} color="rgba(0,0,0,0.6)" />
                ) : null}
              </View>
              <Image
                style={{
                  alignSelf: mine ? 'flex-start' : 'flex-end',
                  width:
                    messageItem.filesLocal.length % 2 !== 0 &&
                    idx === messageItem.filesLocal.length - 1
                      ? responsiveHeader(1)
                      : responsiveHeader(messageItem.filesLocal.length),
                  height: responsiveHeader(messageItem.filesLocal.length) - 5,
                  margin: 1,
                  zIndex: 5,
                  position: 'relative',
                  borderRadius: 10,
                }}
                resizeMethod={'auto'}
                resizeMode={'cover'}
                borderRadius={10}
                source={{
                  uri: item.uri,
                }}
              />
            </TouchableWithoutFeedback>
          );
        return (
          <FileChatComponent
            file={item}
            mine={mine}
            width={
              messageItem.filesLocal.length % 2 !== 0 &&
              idx === messageItem.filesLocal.length - 1
                ? responsiveHeader(1)
                : responsiveHeader(messageItem.filesLocal.length)
            }
            isLocal
            key={idx.toString()}
            messageItem={messageItem}
          />
        );
      });
    }
    return null;
  };

  const renderFiles = () => {
    if (messageItem.files && messageItem.files.length > 0 && userMessage) {
      return messageItem.files.map((img: IFileObject, idx: number) => {
        if (!messageItem.files) return null;
        let path: string = get(img, 'link_url', '');
        let createAt = get(messageItem, 'create_at', '');
         let payload = get(img, 'payload');
        if (!path.includes('uploads') && !payload) {
          let thumbnailImage = `${path.replace('/images/', '/thumbnails/')}`;
          const uri = getSignedUrl(thumbnailImage);
          return (
            <PopoverMessage
              key={idx.toString()}
              mine={mine}
              messageItem={messageItem}
              onPress={() => {
                let itemImage: IImage = {
                  // ...img,
                  create_at: createAt,
                  file_name: img.file_name,
                  id: '',
                  path_file: getSignedUrl(path),
                  path_file_thumb: getSignedUrl(thumbnailImage),
                  user: userMessage,
                };
                dispatch(
                  createAction(modal.SET_MODAL, {
                    isShow: true,
                    value: itemImage,
                  }),
                );
              }}>
              <View style={styles.ImageFileWrapper}>
                <ImageItem
                  style={{
                    alignSelf: mine ? 'flex-start' : 'flex-end',
                    width:
                      messageItem.files.length % 2 !== 0 &&
                      idx === messageItem.files.length - 1
                        ? responsiveHeader(1)
                        : responsiveHeader(messageItem.files.length),
                    height: responsiveHeader(messageItem.files.length) - 5,
                    borderRadius: 10,
                  }}
                  uri={uri}
                />
              </View>
            </PopoverMessage>
          );
        }
        let size: number = get(img, 'payload.size', 0);
        return (
          <FileChatComponent
            mine={mine}
            file={{file_name: img.file_name, uri: img.link_url, size}}
            width={
              messageItem.files.length % 2 !== 0 &&
              idx === messageItem.files.length - 1
                ? responsiveHeader(1)
                : responsiveHeader(messageItem.files.length)
            }
            key={idx.toString()}
            messageItem={messageItem}
          />
        );
      });
    }
    return null;
  };

  return (
    <>
      <View
        style={[
          mine ? styles.view_mine_message : styles.view_not_mine_message,
          {paddingHorizontal: 10},
        ]}>
        <View>
          <View
             style={{
              display: 'flex',
              flexDirection: mine?'row-reverse':'row',
              flexWrap: 'wrap',
              justifyContent:'flex-end',
              alignItems: 'flex-end',
            }}>
            {messageItem.files && messageItem.files?.length > 0 ? (
              <View style={{marginBottom: 8}}>
                <Text
                  style={[
                    styles.createAt,
                    {textAlign: 'right', paddingHorizontal: 2},
                  ]}>
                  {!mine
                    ? STATUS_MESSAGE.SEEN === messageItem.status
                      ? MESSAGES.COMMON.MSG_COMMON_TEXT_001
                      : ''
                    : null}
                </Text>
                <Text
                  style={[
                    styles.createAt,
                    {paddingVertical: 0, paddingHorizontal: 2},
                    !mine ? {textAlign: 'right'} : {},
                  ]}>
                  {messageItem.create_at ? getTime(messageItem.create_at) : ''}
                </Text>
              </View>
            ) : null}
            {isFailLocal &&
            messageItem.filesLocal &&
            messageItem.filesLocal?.length > 0 ? (
              <View style={{marginHorizontal: 5, marginBottom: 8}}>
                <ButtonIcon
                  onPress={() => onRefeshSend(messageItem)}
                  style={{marginBottom: 5, marginRight: 2}}>
                  <View
                    style={{
                      paddingHorizontal: 3.5,
                      borderColor: 'rgba(0,0,0,0.6)',
                      borderWidth: 1,
                      borderRadius: 50,
                      paddingVertical: 3,
                    }}>
                    <Ionicons
                      name="refresh"
                      size={12}
                      style={{color: 'rgba(0,0,0,0.6)', fontWeight: 'bold'}}
                    />
                  </View>
                </ButtonIcon>
              </View>
            ) : null}

            <View
              style={{
                display: 'flex',
                flexDirection:'row',
                maxWidth: screen.width * 0.7,
                flexWrap: 'wrap',
                justifyContent: mine?'flex-start':'flex-end',
                marginBottom: 10,
              }}>
              {messageItem.files
                ? messageItem.files.length > 0
                  ? renderFiles()
                  : renderFileLocal()
                : null}
            </View>
          </View>
        </View>
      </View>
    </>
  );
});

export default FileRender;
const styles = StyleSheet.create({
  message: {
    flexDirection: 'row',
    marginVertical: moderateScale(1, 2),
  },
  mine: {},
  not_mine: {
    alignSelf: 'flex-end',
    flexDirection: 'row-reverse',
  },
  cloud: {
    maxWidth: moderateScale(250, 2),
    paddingHorizontal: moderateScale(10, 2),
    paddingTop: moderateScale(5, 2),
    paddingBottom: moderateScale(7, 2),
    borderRadius: 5,
  },
  text: {
    // paddingTop: 3,
    // borderColor: 'red',
    // borderWidth: 1,
    fontSize: 17,
    lineHeight: 22,
  },
  arrow_container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: -1,
    flex: 1,
  },
  arrow_left_container: {
    justifyContent: 'flex-end',
    alignItems: 'flex-start',
  },
  arrow_right_container: {
    justifyContent: 'flex-end',
    alignItems: 'flex-end',
  },
  arrow_left: {
    left: 0,
  },
  arrow_right: {
    right: 0,
  },
  view_mine_message: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  view_not_mine_message: {
    flexDirection: 'row-reverse',
    alignItems: 'flex-end',
  },
  createAt: {
    color: '#A29F9F',
    fontSize: 10,
  },
  ImageFileWrapper: {
    position: 'relative',
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: 'rgba(230,230,230,0.5)',
    margin: 1,
  },
  ImageFileLocalWrapper: {
    position: 'relative',
    borderRadius: 10,
    marginVertical: 2,
    overflow: 'hidden',
  },
  overLoadImageLocal: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 10,
    display: 'flex',
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
