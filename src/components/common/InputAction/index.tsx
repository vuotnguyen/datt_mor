import React, {
  Dispatch,
  memo,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  Dimensions,
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  Keyboard,
  View,
  FlatList,
  Pressable,
  Platform,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import {
  AntDesign,
  Entypo,
  FontAwesome,
  MaterialIcons,
} from '../../../assets/icons';
import {useAppDispatch, useAppSelector} from '../../../stories';
import {ButtonIcon} from '../../buttons';
import {SafeAreaView} from 'react-native-safe-area-context';
import MESSAGES_const from '../../../config/Messages';
import {ContextChatRoom} from '../../../scenes/IndividualChat';
import {useMedia} from '../../../hooks/camera';
import {createAction} from '../../../stories/actions';
import {message, modal} from '../../../stories/types';
import {IToast, TypeToash} from '../../../models/common';
import {
  File,
  FileLocal,
  IChat,
  ImessageChat,
  IMessageReceiver,
  StatusImage,
} from '../../../models/chat';
import GalleryModal from '../../organisms/Gallery';
import {Transition, Transitioning} from 'react-native-reanimated';
import {PhotoIdentifier} from '@react-native-community/cameraroll';
import {apiUploadImage, CATEGORY_TYPE} from '../../../services/image';
import * as Modals from '../../../stories/types/modal';
import {IImage} from '../../../models/image';
import {AxiosResponse} from 'axios';
import {ImagePickerResponse} from 'react-native-image-picker';
import EmojiSelector, {Categories} from 'react-native-emoji-selector';
import EmojiBoard from '../../organisms/EmojiBoard';
import {useGallary} from '../../../hooks/gallery';
import Messages from '../../../config/Messages';
import {connectDB} from '../../../database';
import {
  MessageSchemaOp,
  RoomChatIndOp,
} from '../../../database/modules/IndividualChatScreen';
import {RoomChatSchemaType} from '../../../database/modules/IndividualChatScreen/roomChatSchema';
import {NetInfoStateType} from '@react-native-community/netinfo';
const {width, height} = Dimensions.get('screen');
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
  messageCurrent: Array<IMessageReceiver>;
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
const InputAction: React.FC<Props> = ({
  navigation,
  ws,
  setMessageCurrent,
  messageCurrent,
  cacheDataMessage,
  infoRoom,
  refScrollView,
  connection,
}) => {
  // const ipTextRef = useRef<TextInput | null>(null);
  const refInput = useRef<TextInput>(null);
  const refFlatList = useRef<FlatList>(null);
  const [text, onChageText] = useState<string>('');
  const [cursorText, setCursorText] = useState<number>(0);

  const [files, setFiles] = useState<
    Array<{
      img: PhotoIdentifier;
      active: boolean;
      count: number | null;
      disabled: boolean;
    }>
  >([]);
  const [textPlaceHolder, setTextPlaceHolder] = useState<string>(defaultText);
  const [isGallery, setGallery] = useState<boolean>(false);
  const [isEmoji, setEmoji] = useState<boolean>(false);
  const [fileNameCapture, setFileNameCapture] = useState<string>('');
  const dispatch = useAppDispatch();
  // const {infoRoom, messageCurrentState, refScrollView} = useContext(
  //   ContextChatRoom,
  // );
  const [isAllowCapture, setIsAllowCapture] = useState<boolean>(false);
  const {captureImage} = useMedia();
  const {getPhotos, saveImage} = useGallary();
  const [refreshGallery, setRefreshGallery] = useState<boolean>(false);
  const _captureImage = useCallback(async () => {
    let key = new Date().getTime();
    try {
      await captureImage('photo', async response => {
        let payload: IToast;
        if (response.didCancel) {
          navigation?.goBack('IndividualChat');

          return;
        } else if (response.errorCode == 'camera_unavailable') {
          payload = {
            isShow: true,
            type: TypeToash.INFO,
            message: MESSAGES_const.CAMERA.MSG_CAMERA_TEXT_002,
            title: MESSAGES_const.COMMON.MSG_COMMON_TEXT_WARN,
          };
          dispatch(createAction(modal.SET_TOASH, payload));
          return;
        } else if (response.errorCode == 'permission') {
          payload = {
            isShow: true,
            type: TypeToash.INFO,
            message: MESSAGES_const.CAMERA.MSG_CAMERA_TEXT_003,
            title: MESSAGES_const.COMMON.MSG_COMMON_TEXT_WARN,
          };
          dispatch(createAction(modal.SET_TOASH, payload));
          return;
        } else if (response.errorCode == 'other') {
          payload = {
            isShow: true,
            type: TypeToash.ERROR,
            message: 'Permission not satisfied',
            title: MESSAGES_const.COMMON.MSG_COMMON_TEXT_ERROR,
          };
          dispatch(createAction(modal.SET_TOASH, payload));

          return;
        }

        let file = response;

        if (
          file.uri &&
          file.type &&
          file.fileName &&
          file.height &&
          file.width
        ) {
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
                  filename: file.fileName,
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
          saveImage(file.uri)
            .then(res => {
              if (Platform.OS == 'ios' && res) {
                ImageCapture.img.node.image.uri = res;
              }
              if (files.length < limitedCount) {
                let data = [...files, ImageCapture];
                setFiles(data);
              } else {
                let payload: IToast = {
                  isShow: true,
                  title: Messages.COMMON.MSG_COMMON_TEXT_WARN,
                  type: TypeToash.WARN,
                  message: `${limitedCount}枚までしか送信できません`,
                };
                dispatch(createAction(modal.SET_TOASH, payload));
              }

              setEmoji(false);
              setGallery(true);
              setRefreshGallery(!refreshGallery);
              // setTimeout(() => {
              //   setFileNameCapture(ImageCapture.img.node.image.filename ?? '');
              // }, 100);
            })
            .finally(() => {});
        }
      });
    } catch (error) {
      console.log('error _captureImage', error);
    }
  }, [messageCurrent, files, refreshGallery]);

  // const handleSetGallery = () => {};
  const handleUploadImage = async (
    arrfiles: Array<PhotoIdentifier>,
    callBack: (res: AxiosResponse<any>) => void,
    errorCallBack: () => void,
  ) => {
    let data = new FormData();
    if (arrfiles.length > 0) {
      arrfiles.map((file, index) => {
        let image = {
          uri:
            Platform.OS === 'android'
              ? file.node.image.uri
              : file.node.image.uri.replace('file://', ''),
          name: file.node.image.filename,
          // name: undefined,
          type: file.node.type,
        };
        data.append('files', image);
      });
    }
    await apiUploadImage(CATEGORY_TYPE.ALBUM, data)
      .then(callBack)
      .catch(error => {
        console.log('error', error);
        errorCallBack();
      })
      .finally(() => {});
  };

  const handleSend = (message: string) => {
    let key = new Date().getTime();
    onChageText('');
    if (isGallery) {
      setGallery(false);
    }
    if ((message || files.length) && infoRoom && ws) {
      let dataLocal: IMessageReceiver = {
        user_sender: infoRoom.user_login,
        files: [],
        create_at: '', // update
        status: 1,
        is_delete: false,
        message: message,
        room_id: infoRoom.room_id,
        // id_message: 'local_' + stt, //update
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
              }))
            : [],
        id_local: 'local_' + key,
      };

      // arrMessagesLocal.push(dataLocal)
      _handleViewMessage(dataLocal, StatusImage.sending);

      if (ws) {
        if (files.length > 0) {
          let arr = files.map(item => item.img);
          setFiles([]);
          const successCallback = (res: AxiosResponse<any>) => {
            let arr: Array<File> = [];
            let resData = res.data;
            if (res.data.length) {
              arr = resData.map((item: IImage) => ({
                ...JSON.parse(JSON.stringify(item)),
              }));
            }
            let dataSend: ImessageChat = {
              chat_room_id: infoRoom.room_id,
              message: message,
              obj_receiver: {
                id: String(infoRoom.user_friend?.id),
                avatar: infoRoom.user_friend.avatar,
                fullname: infoRoom.user_friend.fullname
                  ? infoRoom.user_friend.fullname
                  : ' ',
                username: infoRoom.user_friend?.username
                  ? infoRoom.user_friend?.username
                  : ' ',
              },
              obj_sender: {
                id: String(infoRoom.user_login?.id),
                avatar: infoRoom.user_login.avatar,
                fullname: infoRoom.user_login.fullname
                  ? infoRoom.user_login.fullname
                  : ' ',
                username: infoRoom.user_login?.username
                  ? infoRoom.user_login?.username
                  : ' ',
              },
              files: arr,
              id_local: 'local_' + key,
            };
            if (ws.readyState === 1) {
              ws.send(JSON.stringify(dataSend));
            }
            // sendWB(dataSend);
          };
          const failCallback = () => {
            _handleViewMessage(dataLocal, StatusImage.fail, dataLocal.id_local);
          };
          handleUploadImage(arr, successCallback, failCallback);
        } else {
          let dataSend: ImessageChat = {
            chat_room_id: infoRoom.room_id,
            message: message,
            obj_receiver: {
              id: String(infoRoom.user_friend?.id),
              avatar: infoRoom.user_friend.avatar,
              fullname: infoRoom.user_friend.fullname
                ? infoRoom.user_friend.fullname
                : ' ',
              username: infoRoom.user_friend?.username
                ? infoRoom.user_friend?.username
                : ' ',
            },
            obj_sender: {
              id: String(infoRoom.user_login?.id),
              avatar: infoRoom.user_login.avatar,
              fullname: infoRoom.user_login.fullname
                ? infoRoom.user_login.fullname
                : ' ',
              username: infoRoom.user_login?.username
                ? infoRoom.user_login?.username
                : ' ',
            },
            files: [],
            id_local: 'local_' + key,
          };
          if (ws.readyState === 1) {
            ws.send(JSON.stringify(dataSend));
          }

          // sendWB(dataSend);
        }
      }
      //
    }
    // stt++;
  };

  const _handleViewMessage = useCallback(
    async (
      item: IMessageReceiver,
      status: StatusImage,
      idFileError?: string,
    ) => {
      let data: Array<IMessageReceiver> | null = [];
      if (item && infoRoom) {
        console.log(
          '_handleViewMessage work-----------------here---- ',
          item.files?.length,
          item.message,
        );

        if (status === StatusImage.fail) {
          if (idFileError) {
            let filesLocal: Array<FileLocal> = [];
          }
        }
        const realmOpen = await connectDB();
        realmOpen.write(() => {
          const roomLocal = realmOpen.objectForPrimaryKey<RoomChatSchemaType>(
            RoomChatIndOp.NAME_SCHEMA,
            infoRoom.room_id,
          );
          if (roomLocal) {
            let idx = roomLocal.messages_currentChat.findIndex(
              m => m.id_local == item.id_local,
            );

            if (idx == -1) roomLocal.messages_currentChat.push(item);
            else {
              roomLocal.messages_currentChat[idx].create_at = item.create_at;
              roomLocal.messages_currentChat[idx].files = item.files ?? [];
              roomLocal.messages_currentChat[idx].filesLocal =
                item.filesLocal ?? [];
              roomLocal.messages_currentChat[idx].is_delete = item.is_delete;
              roomLocal.messages_currentChat[idx].is_first_message_in_date =
                item.is_first_message_in_date;
              roomLocal.messages_currentChat[idx].message = item.message;
              roomLocal.messages_currentChat[idx].status =
                status === StatusImage.fail ? -1 : item.status;
              if (status === StatusImage.fail) {
                let ind = roomLocal.messages_Unsend.findIndex(
                  m => m.id_local == item.id_local,
                );
                if (ind == -1) {
                  roomLocal.messages_Unsend.push(item);
                }
                roomLocal.messages_currentChat.splice(idx, 1);
              }
            }
            if (!connection.isConnected) {
              roomLocal.messages_currentChat.map(m => {
                if (m.create_at == '' && m.id_message == 'local') {
                  let idx = roomLocal.messages_Unsend.findIndex(
                    mus => mus.id_local == m.id_local,
                  );
                  if (idx == -1) roomLocal.messages_Unsend.push(m);
                }
              });
              roomLocal.messages_currentChat = roomLocal.messages_currentChat.filter(
                m => !(m.create_at == '' && m.id_message == 'local'),
              );
            }

            // let ind = roomLocal.messages.findIndex(
            //   m => m.id_local == item.id_local,
            // );
            // if (ind == -1) {
            //   roomLocal.messages.push(item);
            // }
            setMessageCurrent(
              roomLocal.messages_currentChat,
              roomLocal.messages_Unsend,
            );
          }
        });
        // data = await RoomChatIndOp.insertMessagesLocal(infoRoom.room_id, item);
      }
      // if (data) setMessageCurrent(data);
    },
    [connection.isConnected],
  );
  const _removeImage = useCallback(
    (uri: string) => {
      let index = files.findIndex(item => item.img.node.image.uri === uri);
      if (index !== -1) {
        let lst = [...files];
        lst.splice(index, 1);
        setFiles(lst);
      }
    },
    [files],
  );

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
      if (infoRoom) {
        // if (cacheDataMessage && !text && !(files.length > 0)) {
        //   RoomChatIndOp.insertMessageCache(infoRoom.room_id, null);
        // }
        // if (text || files.length > 0) {
        let key = new Date().getTime();
        let dataLocal: IMessageReceiver = {
          user_sender: infoRoom.user_login,
          files: [],
          create_at: '', // update
          status: 1,
          is_delete: false,
          message: text ?? '',
          room_id: infoRoom.room_id,
          // id_message: 'local_' + stt, //update
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
                }))
              : [],
          id_local: 'local_' + key,
        };

        // RoomChatIndOp.insertMessageCache(infoRoom.room_id, dataLocal);
        connectDB()
          .then(realm => {
            realm.write(() => {
              const roomLocal = realm.objectForPrimaryKey<RoomChatSchemaType>(
                RoomChatIndOp.NAME_SCHEMA,
                infoRoom.room_id,
              );
              if (roomLocal) roomLocal.message_cache = dataLocal;
            });
          })
          .catch(error => console.log(error));
        // }
      }
    };
  }, [text, files, cacheDataMessage]);

  const handleImage = useCallback(() => {}, []);
  return (
    <View>
      <View style={[styles.container]}>
        <View style={[styles.groupActions]}>
          {true ? (
            <>
              <ButtonIcon
                onPress={() => {
                  if (Platform.OS === 'android') {
                    console.log(`${Platform.OS}` + ' alo');
                    refInput.current?.blur();
                    setGallery(!isGallery);
                    setTimeout(() => {
                      setGallery(!isGallery);
                      setEmoji(false);
                      Keyboard.dismiss();
                      // refScrollView?.scrollToEnd({animation: false});
                      if (refScrollView)
                        refScrollView.current.scrollToEnd({animated: false});
                    }, 500);
                  } else {
                    setGallery(!isGallery);
                    setTimeout(() => {
                      setEmoji(false);
                      Keyboard.dismiss();
                      // refScrollView?.current.scrollToEnd({animation: false});
                      if (refScrollView)
                        refScrollView.current.scrollToEnd({animated: false});
                    }, 100);
                  }
                }}>
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
              <ButtonIcon
                onPress={() => {
                  _captureImage();
                }}
                disabled={isAllowCapture}>
                <View
                  style={[
                    {
                      paddingHorizontal: 9.5,
                      paddingVertical: 9,
                      // paddingBottom: 9,
                    },
                    styles.centerAlign,
                  ]}>
                  {isAllowCapture ? (
                    <ActivityIndicator size={18} color={'#000'} />
                  ) : (
                    <Entypo name="camera" size={20} style={{color: '#000'}} />
                  )}
                </View>
              </ButtonIcon>
            </>
          ) : (
            <>
              <ButtonIcon onPress={() => {}}>
                <View
                  style={[
                    {
                      paddingHorizontal: 9,
                      paddingVertical: 9,
                      // paddingBottom: 9,
                    },
                    styles.centerAlign,
                  ]}>
                  <MaterialIcons size={20} name="navigate-next" />
                </View>
              </ButtonIcon>
            </>
          )}
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
              placeholder={textPlaceHolder}
              value={text ? text : ''}
              onFocus={() => {
                setTextPlaceHolder(MESSAGES_const.CHAT.MSG_CHAT_TEXT_003);
                setGallery(false);
                setEmoji(false);
              }}
              onBlur={() => {
                setTextPlaceHolder(defaultText);
              }}
              multiline
              autoFocus={false}
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
              <Pressable
                onPress={() => {
                  if (Platform.OS === 'android') {
                    refInput.current?.blur();
                    setTimeout(() => {
                      setEmoji(!isEmoji);
                      setGallery(false);
                      Keyboard.dismiss();
                      if (refScrollView)
                        refScrollView.current.scrollToEnd({animated: false});
                    }, 500);
                  } else {
                    setEmoji(!isEmoji);
                    setTimeout(() => {
                      setGallery(false);
                      Keyboard.dismiss();
                      if (refScrollView)
                        refScrollView.current.scrollToEnd({animated: false});
                    }, 100);
                  }
                }}>
                <View
                  style={[
                    {
                      paddingHorizontal: 9,
                      paddingVertical: 4,
                      paddingBottom: 9,
                    },
                    styles.centerAlign,
                  ]}>
                  <Entypo size={20} name="emoji-happy" />
                </View>
              </Pressable>
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
                // style={{marginBottom: 5}}
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
        <View style={{paddingVertical: 1}}>
          <FlatList
            ref={refFlatList}
            data={files}
            keyExtractor={(item, index) => 'image_selected_' + index}
            horizontal
            onContentSizeChange={() => {
              if (refFlatList) {
                refFlatList.current?.scrollToEnd();
              }
            }}
            renderItem={({item}) => (
              <View
                style={[
                  styles.ImagePickerDiv,
                  {
                    height: 70,
                    flex: 1,
                    alignItems: 'center',
                    flexDirection: 'row',
                    justifyContent: 'center',
                  },
                ]}>
                <Image
                  style={{
                    width: 70,
                    height: 60,
                    marginHorizontal: 5,
                  }}
                  borderRadius={5}
                  source={{uri: String(item.img.node.image.uri)}}
                />
                <Pressable
                  style={styles.deleteDot}
                  onPress={() => {
                    _removeImage(String(item.img.node.image.uri));
                  }}>
                  <AntDesign name={'close'} size={10} color={'#fff'} />
                </Pressable>
              </View>
            )}
          />
        </View>

        {isGallery ? (
          <View style={styles.wrapperKeyboardBottom}>
            <GalleryModal
              getListGallery={setFiles}
              listFiles={files}
              limitedCount={limitedCount}
              // fileNameCapture={fileNameCapture}
              refreshPhotos={refreshGallery}
            />
          </View>
        ) : null}
        {isEmoji ? (
          <View style={styles.wrapperKeyboardBottom}>
            <EmojiBoard text={text} selectEmoji={onChageText} />
          </View>
        ) : null}
      </View>
    </View>
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
