import { PhotoIdentifier } from '@react-native-community/cameraroll';
import { NetInfoStateType } from '@react-native-community/netinfo';
import { AxiosResponse } from 'axios';
import { get } from 'lodash';
import React, { memo, useCallback, useEffect, useRef, useState } from 'react';
import {
  Alert,
  Dimensions,
  Keyboard,
  Platform,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import { DocumentPickerResponse } from 'react-native-document-picker';
import { Entypo, FontAwesome, MaterialIcons } from '../../../assets/icons';
import MESSAGES_const from '../../../config/Messages';
import { ChatDBHelperInstance } from '../../../database/DatabaseHelper';
import { useS3 } from '../../../hooks/aws';
import {
  FileUpload,
  IChat,
  ImessageChat,
  IMessageReceiver,
  StatusImage,
} from '../../../models/chat';
import {
  apiUploadFile,
  apiUploadMultipleFile,
  OBJECT_TYPE,
} from '../../../services/file';
import { useAppSelector } from '../../../stories';
import { ButtonIcon } from '../../buttons';
import CaptureButton from './CaptureButton';
import { InputContext } from './hooks';
import KeyboardServices, { KeyboardComponentType } from './KeyboardServices';
const { width, height } = Dimensions.get('screen');

const defaultText = 'Aa';
const limitedCount = 50;
interface Props {
  // sendMessage: Function;
  // captureImage: Function;
  navigation?: any;
  // itemResend: IMessageReceiver | null;
  ws: WebSocket;
  setMessageCurrent: (
    listCurrent: IMessageReceiver[],
    listUnsend: IMessageReceiver[],
  ) => void;
  listMessageCurrent: Array<IMessageReceiver>;
  listMessageUnsend: Array<IMessageReceiver>;
  cacheDataMessage?: IMessageReceiver | null;
  infoRoom: IChat | null;
  refScrollView: React.MutableRefObject<any>;
  connection: {
    type: NetInfoStateType;
    isConnected: boolean | null;
  };
}
// let arrMessagesLocal:Array<IMessageReceiver> = [];
// let stt: number = 0;

// const InputIndividualContext = React.createContext<IInputContext | null>(null);
// export const useInputIndividualContext = () =>
//   React.useContext(InputIndividualContext);
const InputAction: React.FC<Props> = ({
  navigation,
  ws,
  setMessageCurrent,
  listMessageCurrent,
  listMessageUnsend,
  cacheDataMessage,
  infoRoom,
  refScrollView,
  connection,
}) => {
  if (!infoRoom) return null;
  const { getSignedUrl } = useS3();
  const refInput = useRef<TextInput>(null);
  const [text, onChageText] = useState<string>('');

  const [files, setFiles] = useState<
    Array<{
      img: PhotoIdentifier;
      active: boolean;
      count: number | null;
      disabled: boolean;
    }>
  >([]);
  // DocumentPickerResponse
  const [attachFiles, setAttachFiles] = React.useState<
    DocumentPickerResponse[]
  >([]);

  const [refreshGallery, setRefreshGallery] = useState<boolean>(false);
  const [
    keyBoardComponent,
    setKeyBoardComponent,
  ] = useState<KeyboardComponentType | null>(null);

  const connectionNetwork = useAppSelector(
    state => state.dataCache.networkStatusConnect,
  );

  const textRef = useRef('');
  const filesRef = useRef<
    Array<{
      img: PhotoIdentifier;
      active: boolean;
      count: number | null;
      disabled: boolean;
    }>
  >([]);

  const handleUploadFile = async ({
    room_id = '',
    arrFiles = [],
    callBack = () => undefined,
    errorCallBack = () => undefined,
    isMultiple = false,
  }: {
    room_id: string;
    arrFiles: Array<{ uri: string; name: string; type: string }>;
    callBack: (res: AxiosResponse<any>) => void;
    errorCallBack?: () => void;
    isMultiple?: Boolean;
  }) => {
    let data = new FormData();
    if (arrFiles.length > 0) {
      data.append('object_type', OBJECT_TYPE.ROOM_CHAT);
      data.append('object_id', room_id);
    }
    if (!isMultiple) {
      arrFiles.map((file, index) => {
        data.append('file', file);
      });
      await apiUploadFile(data)
        .then(callBack)
        .catch(error => {
          console.log('error', error);
          errorCallBack();
        })
        .finally(() => { });
    } else {
      arrFiles.map((file, index) => {
        data.append('files', file);
      });
      await apiUploadMultipleFile(data)
        .then(callBack)
        .catch(error => {
          console.log('error', error);
          errorCallBack();
        })
        .finally(() => { });
    }
  };

  const handleSend = (message: string) => {
    let key = new Date().getTime();
    onChageText('');
    setKeyBoardComponent(null);
    if ((message || files.length) && ws) {
      let dataLocal: IMessageReceiver = {
        user_sender: infoRoom.user_login,
        files: [],
        create_at: '', // update
        status: 1,
        is_delete: false,
        message: message,
        room_id: infoRoom.room_id,
        id_message: 'local', //update
        user_receiver: infoRoom.user_friend,
        filesLocal:
          files.length > 0
            ? files.map(item => ({
              file_name: item.img.node.image.filename ?? '',
              status: StatusImage.sending,
              height: item.img.node.image.height,
              type: item.img.node.type,
              width: item.img.node.image.width,
              uri: item.img.node.image.uri,
              isImage: true,
              size: get(item, 'img.node.image.fileSize', 0),
            }))
            : [],
        id_local: 'local_' + key,
      };

      // arrMessagesLocal.push(dataLocal)
      _handleViewMessage(dataLocal, StatusImage.sending);

      if (ws) {
        if (files.length > 0) {
          let arr = files.map(item => {
            const uri = get(item, 'img.node.image.uri', '');
            return {
              uri: Platform.OS === 'android' ? uri : uri.replace('file://', ''),
              name: get(item, 'img.node.image.filename', ''),
              // name: undefined,
              type: get(item, 'img.node.type', ''),
            };
          });
          setFiles([]);
          const successCallback = (res: AxiosResponse<any>) => {
            const data: Array<FileUpload> = JSON.parse(
              JSON.stringify(res.data),
            );
            const files = data.map(item => {
              const fileName = item.path_file.replace('images/', '');
              return {
                file_name: fileName,
                link_url: item.link_url_file,
                path: item.path_file,
                payload: null,
              };
            });
            let dataSend: ImessageChat = {
              chat_room_id: infoRoom.room_id,
              message: message,
              user_sender: infoRoom.user_login,
              user_receiver: infoRoom.user_friend,
              files,
              id_local: 'local_' + key,
            };

            console.log('dataSend', dataSend);

            if (ws.readyState === 1) {
              ws.send(JSON.stringify(dataSend));
            }
            // sendWB(dataSend);
          };
          const failCallback = () => {
            _handleViewMessage(dataLocal, StatusImage.fail, dataLocal.id_local);
          };
          handleUploadFile({
            room_id: infoRoom.room_id,
            arrFiles: arr,
            callBack: successCallback,
            errorCallBack: failCallback,
            isMultiple: true,
          });
        } else {
          let dataSend: ImessageChat = {
            chat_room_id: infoRoom.room_id,
            message: message,
            user_sender: infoRoom.user_login,
            user_receiver: infoRoom.user_friend,
            files: [],
            id_local: 'local_' + key,
          };
          if (ws.readyState === 1) {
            ws.send(JSON.stringify(dataSend));
          }

          // sendWB(dataSend);
        }
      }
    }
    // stt++;
  };

  // const addMessageUnsendLocal = async (message: IMessageReceiver) => {
  //   let dataLocal = {
  //     message: message.message,
  //     room_id: message.room_id,
  //     userSender: infoRoom.user_login,
  //     id_message: message.id_message,
  //     filesLocal: message.filesLocal,
  //     is_group: false,
  //     isCache: false,
  //     isLocal: false,
  //     isUnsend: true,
  //   };

  //   const newMessageRecord = ChatDBHelperInstance.prepareCreateMessageGroupChat(
  //     dataLocal,
  //   );
  //   ChatDBHelperInstance.batchAction([newMessageRecord]).then(record =>
  //     console.log('add message to message unsend', record),
  //   );
  // }

  const _handleViewMessage = async (
    item: IMessageReceiver,
    status: StatusImage,
    idFileError?: string,
  ) => {
    let dataCurrent: Array<IMessageReceiver> = listMessageCurrent;
    let dataUnSend: Array<IMessageReceiver> = listMessageUnsend;

    if (item) {
      let idx = listMessageCurrent.findIndex(m => m.id_local == item.id_local);

      if (idx == -1) dataCurrent.push(item);
      else {
        dataCurrent[idx] = JSON.parse(JSON.stringify(item));
        dataCurrent[idx].status =
          status === StatusImage.fail ? -1 : item.status;
        if (status === StatusImage.fail) {
          let ind = listMessageUnsend.findIndex(
            m => m.id_local == item.id_local,
          );
          if (ind == -1) {
            dataUnSend.push(item);
          }
          dataCurrent.splice(idx, 1);
        }
      }

      if (ws.readyState === 3 || !connectionNetwork) {
        dataCurrent.map(m => {
          if (m.create_at == '' && m.id_message == 'local') {
            let idx = listMessageUnsend.findIndex(
              mus => mus.id_local == m.id_local,
            );
            if (idx == -1) {
              dataUnSend.push(m);
              //addMessageUnsendLocal(m);
            }
          }
        });
        dataCurrent = dataCurrent.filter(
          m => !(m.create_at == '' && m.id_message == 'local'),
        );
      }

      setMessageCurrent(dataCurrent, dataUnSend);
      setTimeout(() => {
        if (refScrollView && refScrollView.current) {
          refScrollView.current.scrollToEnd();
        }
      }, 500);
    }
  };

  useEffect(() => {
    if (cacheDataMessage) {
      if (cacheDataMessage.message) onChageText(cacheDataMessage.message);
      if (cacheDataMessage.filesLocal?.length) {
        const cacheFiles: {
          img: PhotoIdentifier;
          active: boolean;
          count: number | null;
          disabled: boolean;
        }[] = [];
        (cacheDataMessage.filesLocal as {
          file_name: string;
          uri: string;
          width: number;
          height: number;
          type: string;
        }[]).map(file => {
          let ImageCapture: {
            img: PhotoIdentifier;
            active: boolean;
            count: number | null;
            disabled: boolean;
          } = {
            img: {
              node: {
                image: {
                  fileSize: null,
                  filename: file.file_name,
                  height: file.height,
                  uri: file.uri,
                  playableDuration: null,
                  width: file.width,
                },
                group_name: '',
                location: null,
                timestamp: 0,
                type: file.type,
              },
            },
            active: true,
            count: -1,
            disabled: false,
          };
          cacheFiles.push(ImageCapture);
        });
        setFiles(cacheFiles);
      }
    }
  }, [cacheDataMessage]);

  useEffect(() => {
    textRef.current = text;
    filesRef.current = files;
  }, [text, files]);

  useEffect(() => {
    return () => {
      saveMessageCache(textRef.current, filesRef.current);
    };
  }, []);

  const saveMessageCache = async (
    message: string,
    fileDrag: Array<{
      img: PhotoIdentifier;
      active: boolean;
      count: number | null;
      disabled: boolean;
    }>,
  ) => {
    if (infoRoom) {
      let dataLocal = {
        message: message ?? '',
        room_id: infoRoom.room_id,
        id_message: 'local',
        filesLocal:
          fileDrag.length > 0
            ? fileDrag.map(item => ({
              file_name: item.img.node.image.filename ?? '',
              status: StatusImage.sending,
              height: item.img.node.image.height,
              type: item.img.node.type,
              width: item.img.node.image.width,
              uri: item.img.node.image.uri,
            }))
            : [],
        is_group: false,
        isCache: true,
        isLocal: false,
        isUnsend: false,
      };
      try {
        const messageCache = await ChatDBHelperInstance.getMessageCacheIndividual(
          infoRoom.room_id,
        );

        if (messageCache && messageCache.length > 0) {
          const updateMessgaeCache = await ChatDBHelperInstance.prepareUpdateMessageChatGroup(
            messageCache,
            dataLocal,
            messageCache[0]._raw.id,
          );
        } else {
          const newMessageRecord = ChatDBHelperInstance.prepareCreateMessageGroupChat(
            dataLocal,
          );
          ChatDBHelperInstance.batchAction([newMessageRecord]).then(record =>
            console.log('record', record),
          );
        }
      } catch (error) {
        console.log('error', error);
      }
    }
  };

  const handleOpenKeyboard = useCallback(
    (type: KeyboardComponentType) => () => {
      Keyboard.dismiss();
      setKeyBoardComponent(tya => {
        return tya === type ? null : type;
      });
      // setTimeout(() => {
      //   // refInput.current?.blur();
      //   if (refScrollView ) {
      //     console.log("handleOpenKeyboard")
      //     refScrollView.current.scrollToEnd({ animated: false });
      //   }
      // }, 100);
    },
    [keyBoardComponent],
  );
  const handleAttachFile = (file: DocumentPickerResponse) => {
    Alert.alert('', `「${file.name}」を送信しますか？`, [
      {
        text: MESSAGES_const.COMMON.BUTTON.CANCEL,
      },
      {
        text: MESSAGES_const.COMMON.BUTTON.CONFIRM,
        onPress: async () => {
          const { name, fileCopyUri, size, type, uri } = file;
          let key = new Date().getTime();
          let dataLocal: IMessageReceiver = {
            user_sender: infoRoom.user_login,
            files: [],
            create_at: '', // update
            status: 1,
            is_delete: false,
            message: '',
            room_id: infoRoom.room_id,
            id_message: 'local', //update
            user_receiver: infoRoom.user_friend,
            filesLocal: [
              {
                file_name: name,
                status: StatusImage.sending,
                height: size,
                type: type,
                width: size,
                uri: uri,
                isImage: false,
                size,
              },
            ],
            id_local: 'local_' + key,
          };

          _handleViewMessage(dataLocal, StatusImage.sending);
          const arr = [{ uri: file.uri, type: file.type, name: file.name }];

          await handleUploadFile({
            room_id: infoRoom.room_id,
            arrFiles: arr,
            callBack: res => {
              const data = JSON.parse(JSON.stringify(res.data));

              let dataSend: ImessageChat = {
                chat_room_id: infoRoom.room_id,
                message: '',
                user_sender: infoRoom.user_login,
                user_receiver: infoRoom.user_friend,
                files: [
                  {
                    file_name: file.name,
                    link_url: data.link_url_file,
                    path: data.path_file,
                    payload: {
                      size: file.size,
                    },
                  },
                ],
                id_local: 'local_' + key,
              };
              if (ws.readyState === 1) {
                ws.send(JSON.stringify(dataSend));
              }
            },
          });
        },
      },
    ]);
  };

  return (
    <InputContext.Provider
      value={{
        attachFiles,
        setAttachFiles,
        text,
        onChangeText: onChageText,
        services: { handleAttachFile },
      }}>
      <View style={[styles.container]}>
        <View style={[styles.groupActions]}>
          <ButtonIcon
            onPress={handleOpenKeyboard(KeyboardComponentType.MORE_KB)}>
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
          <CaptureButton
            files={files}
            setFiles={setFiles}
            refreshGallery={refreshGallery}
            setKeyBoardComponent={setKeyBoardComponent}
            setRefreshGallery={setRefreshGallery}
            navigation={navigation}
          />
          <ButtonIcon
            onPress={handleOpenKeyboard(KeyboardComponentType.GallaryKB)}>
            <View
              style={[
                {
                  paddingHorizontal: 9,
                  paddingVertical: 9.5,
                },
                styles.centerAlign,
              ]}>
              <FontAwesome size={20} name="image" />
            </View>
          </ButtonIcon>
          <View
            style={{
              display: 'flex',
              alignItems: 'center',
              flexDirection: 'row',
              position: 'relative',
              flex: 1,
            }}>
            <TextInput
              onChangeText={onChageText}
              ref={refInput}
              placeholder={defaultText}
              value={text ? text : ''}
              onFocus={() => {
                if (refInput && refInput.current)
                  refInput.current.setNativeProps({
                    placeholder: MESSAGES_const.CHAT.MSG_CHAT_TEXT_003,
                  });
                // if (refScrollView && refScrollView.current){
                //   console.log("onFocus")
                //   refScrollView.current.scrollToEnd();
                // }
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
            <View style={{ position: 'absolute', right: 0, bottom: 0 }}>
              <ButtonIcon
                onPress={handleOpenKeyboard(KeyboardComponentType.EmojiKB)}>
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
            </View>
          </View>

          <ButtonIcon
            onPress={() => {
              handleSend(text);
            }}
            disabled={!(text.trim() || files.length > 0)}
            style={{ marginHorizontal: 6 }}>
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
                color={
                  text.trim() || files.length > 0
                    ? '#000'
                    : 'rgba(230,230,230,0.7)'
                }
              />
            </View>
          </ButtonIcon>
        </View>
        {/* View image */}
        <KeyboardServices
          refreshGallery={refreshGallery}
          files={files}
          setFiles={setFiles}
          keyBoardComponent={keyBoardComponent}
          onChageText={onChageText}
          text={text}
          typeInput={'individual'}
        />
      </View>
    </InputContext.Provider>
  );
};

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
    transform: [{ translateY: -5 }],
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
export default memo(InputAction);
