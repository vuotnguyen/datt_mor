import {PhotoIdentifier} from '@react-native-community/cameraroll';
import {AxiosResponse} from 'axios';
import React, {memo, useCallback, useEffect, useRef, useState} from 'react';
import {
  Alert,
  Dimensions,
  Keyboard,
  Platform,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import {Entypo, FontAwesome, MaterialIcons} from '../../../assets/icons';
import MESSAGES_const from '../../../config/Messages';
import {connectDB} from '../../../database';
import {RoomChatIndOp} from '../../../database/modules/IndividualChatGroupScreen';
import {RoomChatSchemaType} from '../../../database/modules/IndividualChatGroupScreen/roomChatGroupSchema';
import {
  File,
  FileLocal,
  FileUpload,
  IChat,
  ImessageChatGroup,
  IMessageGroupChatReceiver,
  StatusImage,
} from '../../../models/chat';
import {IImage} from '../../../models/image';
import {apiUploadImage, CATEGORY_TYPE} from '../../../services/image';
import {ButtonIcon} from '../../buttons';
import CaptureButton from './CaptureButton';
import KeyboardServices, {KeyboardComponentType} from './KeyboardServices';
import {NetInfoStateType} from '@react-native-community/netinfo';
import {useAppDispatch, useAppSelector} from '../../../stories';
import {createAction} from '../../../stories/actions';
import {groupchat, message} from '../../../stories/types';
import {IInputContext, InputContext, useInputContext} from './hooks';
import {DocumentPickerResponse} from 'react-native-document-picker';
import {ChatDBHelperInstance} from '../../../database/DatabaseHelper';
import Query from '@nozbe/watermelondb/Query';
import Model from '@nozbe/watermelondb/Model';
const {width, height} = Dimensions.get('screen');
import {get} from 'lodash';
import {
  apiUploadFile,
  apiUploadMultipleFile,
  OBJECT_TYPE,
} from '../../../services/file';

const defaultText = 'Aa';
const limitedCount = 50;
const idMessageCache = 'messageCacheGroupChat';
const table_Message = 'messages';

interface Props {
  navigation?: any;
  // itemResend: IMessageGroupChatReceiver | null;
  infoRoom: IChat | null;
  ws: WebSocket;
  listMessageCurrent: Array<IMessageGroupChatReceiver>;
  listMessageUnsend: Array<IMessageGroupChatReceiver>;
  setMessageCurrent: (
    listCurrent: IMessageGroupChatReceiver[],
    listUnsend: IMessageGroupChatReceiver[],
  ) => void;
  connection: {
    type: NetInfoStateType;
    isConnected: boolean | null;
  };
  refScrollView: React.MutableRefObject<any>;
  cacheDataMessage?: IMessageGroupChatReceiver | null;
  isGroup: number;
}

// const InputChatGroupContext = React.createContext<IInputContext | null>(null);
// export const useInputChatGroupContext = () =>
//   React.useContext(InputChatGroupContext);
const InputAction: React.FC<Props> = ({
  navigation,
  ws,
  infoRoom,
  setMessageCurrent,
  listMessageCurrent,
  listMessageUnsend,
  connection,
  refScrollView,
  cacheDataMessage,
  isGroup
}) => {
  if (!infoRoom) return null;

  const refInput = useRef<TextInput>(null);
  const [text, onChageText] = useState<string>('');
  const textRef = useRef('');

  const [files, setFiles] = useState<
    Array<{
      img: PhotoIdentifier;
      active: boolean;
      count: number | null;
      disabled: boolean;
    }>
  >([]);
  const filesRef = useRef<
    Array<{
      img: PhotoIdentifier;
      active: boolean;
      count: number | null;
      disabled: boolean;
    }>
  >([]);

  const [attachFiles, setAttachFiles] = React.useState<
    DocumentPickerResponse[]
  >([]);

  const [refreshGallery, setRefreshGallery] = useState<boolean>(false);
  const [
    keyBoardComponent,
    setKeyBoardComponent,
  ] = useState<KeyboardComponentType | null>(null);

  const dispatch = useAppDispatch();

  const connectionNetwork = useAppSelector(
    state => state.dataCache.networkStatusConnect,
  );

  const roomID = isGroup === 1 ? `CR#GROUP#${infoRoom?.room_id}` : `CS#${infoRoom?.room_id}`;

  const handleUploadFile = async ({
    room_id = '',
    arrFiles = [],
    callBack = () => undefined,
    errorCallBack = () => undefined,
    isMultiple = false,
  }: {
    room_id: string;
    arrFiles: Array<{uri: string; name: string; type: string}>;
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
        .finally(() => {});
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
        .finally(() => {});
    }
  };

  function handleSend(val: string) {
    try {
      let key = new Date().getTime();
      onChageText('');
      setKeyBoardComponent(null);

      if (ws.readyState === 3 && connectionNetwork && infoRoom) {
        dispatch(
          createAction(groupchat.CLOSE_SOCKET, {
            room_id: infoRoom.room_id,
          }),
        );
      }

      if ((val || files.length) && infoRoom && ws) {
        let dataLocal: IMessageGroupChatReceiver = {
          user_sender: infoRoom.user_login,
          files: [],
          create_at: '', // update
          status: 1,
          SK: roomID,
          PK: infoRoom.room_id,
          message: val,
          room_id: roomID,
          id_message: 'local', //update
          user_receiver: '',
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
          participants: [],
          is_group: true,
        };
        _handleViewMessage(dataLocal, StatusImage.sending);

        if (ws) {
          if (files.length > 0) {
            let arr = files.map(item => {
              const uri = get(item, 'img.node.image.uri', '');
              return {
                uri:
                  Platform.OS === 'android' ? uri : uri.replace('file://', ''),
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
              let dataSend: ImessageChatGroup = {
                chat_room_id: roomID,
                message: val,
                user_sender: String(infoRoom.user_login),
                files: files,
                id_local: 'local_' + key,
              };
              if (ws.readyState === 1) {
                ws.send(JSON.stringify(dataSend));
              }
              //  sendWB(dataSend);
            };
            const failCallback = () => {
              _handleViewMessage(
                dataLocal,
                StatusImage.fail,
                dataLocal.id_local,
              );
            };
            handleUploadFile({
              room_id: roomID,
              arrFiles: arr,
              callBack: successCallback,
              errorCallBack: failCallback,
              isMultiple: true,
            });
          } else {
            let dataSend: ImessageChatGroup = {
              message: val,
              chat_room_id: String(roomID),
              files: [],
              user_sender: String(infoRoom.user_login),
              id_local: 'local_' + key,
            };
            if (ws.readyState === 1) {
              ws.send(JSON.stringify(dataSend));
            }
          }
        }
      }
    } catch (error) {
      console.log(error);
    }
  }

  const _handleViewMessage = async (
    item: IMessageGroupChatReceiver,
    status: StatusImage,
    idFileError?: string,
  ) => {
    let dataCurrent: Array<IMessageGroupChatReceiver> = listMessageCurrent;
    let dataUnSend: Array<IMessageGroupChatReceiver> = listMessageUnsend;
    if (item && infoRoom) {
      if (status === StatusImage.fail) {
        if (idFileError) {
          let filesLocal: Array<FileLocal> = [];
        }
      }

      let idx = listMessageCurrent.findIndex(m => m.id_local == item.id_local);

      if (idx == -1) dataCurrent.push(item);
      else {
        dataCurrent[idx].create_at = item.create_at;
        dataCurrent[idx].files = item.files ?? [];
        dataCurrent[idx].filesLocal = item.filesLocal ?? [];
        dataCurrent[idx].SK = item.SK;
        dataCurrent[idx].PK = item.PK;

        dataCurrent[idx].message = item.message;
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

      if (ws.readyState !== 1 || !connectionNetwork) {
        console.log('ws.readyState', ws.readyState);
        // dispatch(
        //   createAction(groupchat.CLOSE_SOCKET, { room_id: infoRoom.room_id }),
        // );
        dataCurrent.map(m => {
          if (m.create_at == '' && m.id_message == 'local') {
            let idx = listMessageUnsend.findIndex(
              mus => mus.id_local == m.id_local,
            );
            if (idx == -1) dataUnSend.push(m);
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
    textRef.current = text;
    filesRef.current = files;
  }, [text, files]);

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
        room_id: roomID,
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
        is_group: true,
        isCache: true,
        isLocal: false,
        isUnsend: false,
      };
      try {
        const messageCache = await ChatDBHelperInstance.getMessageCache(roomID);

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
      setTimeout(() => {
        // refInput.current?.blur();
        if (refScrollView) refScrollView.current.scrollToEnd({animated: false});
      }, 100);
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
          const {name, fileCopyUri, size, type, uri} = file;
          let key = new Date().getTime();
          let dataLocal: IMessageGroupChatReceiver = {
            user_sender: infoRoom.user_login,
            files: [],
            create_at: '', // update
            status: 1,
            SK: roomID,
            PK: infoRoom.room_id,
            message: '',
            room_id: roomID,
            id_message: 'local', //update
            user_receiver: '',
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
            participants: [],
            is_group: true,
          };

          // arrMessagesLocal.push(dataLocal)
          _handleViewMessage(dataLocal, StatusImage.sending);
          const arr = [{uri: file.uri, type: file.type, name: file.name}];
          await handleUploadFile({
            room_id: roomID,
            arrFiles: arr,
            callBack: res => {
              const data = JSON.parse(JSON.stringify(res.data));
              let dataSend: ImessageChatGroup = {
                chat_room_id: roomID,
                message: '',
                user_sender: String(infoRoom.user_login),
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
        onChangeText: onChageText,
        text,
        setAttachFiles,
        services: {handleAttachFile},
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
            <View style={{position: 'absolute', right: 0, bottom: 0}}>
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
          typeInput={'group'}
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
export default memo(InputAction);
