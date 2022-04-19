import React, {memo, useCallback, useState} from 'react';
import {StyleSheet, Text, View, TouchableOpacity} from 'react-native';
import {Ionicons} from '../../assets/icons';
import ModalInputCenter from '../../components/common/modalInputCenter';
import {IGroupChatInfo} from '../../models/chat';
import {Avatar} from '../../models/image';
import LoadingModal from './LoadingModal';
import {useChatContext} from '../../hooks/chat';
const InputNameHandle: React.FC<{
  isAdmin: boolean;
  loading: boolean;
  infoRoom: IGroupChatInfo | undefined;
  textGroupName: string;
  handleApiUpdateInfoGroupChat: (
    infoRoomParam: IGroupChatInfo,
    dataUpdating: {
      textName: string;
      // avatarGroup?: Avatar | {};
      avatarGroup?: string | undefined;
    },
    CancelLoading: () => void,
  ) => void;
}> = memo(
  ({
    isAdmin,
    loading,
    textGroupName,
    infoRoom,
    handleApiUpdateInfoGroupChat,
  }) => {
    const [modalName, setModalName] = useState<boolean>(false);
    const [loadingApi, setloadingApi] = useState<boolean>(false);
    const chatContext = useChatContext();
    if (!chatContext) return null;
    const {typeChat} = chatContext;
    /**
     *  ------------------------- handle group name here---------------------------
     */
    //-------------update groupchat`s name------------------
    const handleUpdateGroupName = useCallback(
      async (newText: string) => {
        setModalName(false);
        if (infoRoom) {
          setloadingApi(true);
          handleApiUpdateInfoGroupChat(
            infoRoom,
            {
              textName: newText,
              avatarGroup: infoRoom.avatar_group,
            },
            () => setloadingApi(false),
          );
        }
      },
      [infoRoom],
    );
    return (
      <>
        <View style={{flexDirection: 'row', justifyContent: 'center'}}>
          <TouchableOpacity
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              marginTop: 10,
              position: 'relative',
              width: 'auto',
            }}
            // disabled={!isAdmin}
            disabled={
              typeChat == 'groupConstruction' ? true : !isAdmin ? true : false
            }
            onPress={() => setModalName(true)}>
            <View
              style={{
                position: 'relative',
                flexDirection: 'row',
                justifyContent: 'center',
                alignItems: 'center',
                maxWidth: '90%',
                width: '90%',
              }}>
              {loading ? (
                <View
                  style={{
                    backgroundColor: '#f2f2f2',
                    width: 80,
                    height: 16,
                    borderRadius: 10,
                  }}
                />
              ) : (
                <View
                  style={{
                    position: 'relative',
                    flexDirection: 'row',
                    alignItems: 'center',
                  }}>
                  <Text
                    style={{
                      marginRight: 5,
                      fontSize: 16,
                      textAlign: 'center',
                    }}>
                    {textGroupName}
                  </Text>
                  {isAdmin && !loading ? (
                    <View
                      style={[
                        {
                          position: 'absolute',
                          right: 0,
                          transform: [{translateX: 15}],
                          paddingVertical: 2.5,
                          paddingHorizontal: 3,
                        },
                        styles.borderIcon,
                        {
                          borderWidth:
                            typeChat == 'groupConstruction'
                              ? 0
                              : !isAdmin
                              ? 0
                              : 0.5,
                        },
                      ]}>
                      <Ionicons
                        name={'md-pencil-outline'}
                        size={10}
                        style={{
                          display:
                            typeChat == 'groupConstruction'
                              ? 'none'
                              : !isAdmin
                              ? 'none'
                              : 'flex',
                        }}
                      />
                    </View>
                  ) : null}
                </View>
              )}
            </View>
          </TouchableOpacity>
        </View>

        <ModalInputCenter
          isShow={modalName}
          title={'グループ名'}
          initialText={textGroupName}
          handleClose={() => setModalName(false)}
          handleConfirm={handleUpdateGroupName}
        />
        <LoadingModal loading={loadingApi} />
      </>
    );
  },
);

export default memo(InputNameHandle);
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centerHorizontalView: {
    justifyContent: 'center',
    flexDirection: 'row',
  },
  borderIcon: {
    borderWidth: 0.5,
    borderColor: 'rgba(0,0,0,0.5)',
    backgroundColor: 'rgba(255,255,255,0.8)',
    borderRadius: 50,
  },
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  modalView: {
    backgroundColor: 'white',
    borderRadius: 10,
    alignItems: 'center',
    shadowColor: '#000',
    padding: 10,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
});
