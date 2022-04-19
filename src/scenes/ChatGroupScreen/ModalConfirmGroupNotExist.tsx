import React, {memo} from 'react';
import {Modal, TouchableOpacity, View, StyleSheet, Text} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
// custom styles
import {useAppSelector} from '../../stories';
import {StackActions} from '@react-navigation/native';
import {useDispatch} from 'react-redux';
import {createAction} from '../../stories/actions';
import {groupchat} from '../../stories/types';

const ModalConfirmGroupNotExist = memo(
  ({
    room_id,
    navigation,
    isGroup = 1,
  }: {
    room_id: string;
    navigation: any;
    isGroup?: number;
  }) => {
    const dispatch = useDispatch();
    const isRemovedRoom = useAppSelector(state => {
      let idx = state.dataChat.chat_rooms.findIndex(
        room =>
          room.room_id === `${isGroup == 1 ? 'CR#GROUP#' : 'CS#'}${room_id}`,
      );
      if (idx !== -1) {
        return false;
      } else {
        return true;
      }
    });

    const handleConfirm = () => {
      navigation.dispatch(StackActions.pop(1));
      dispatch(createAction(groupchat.CLOSE_SOCKET, {room_id}));
    };
    return (
      <Modal transparent visible={isRemovedRoom} animationType={'none'}>
        <SafeAreaView style={styles.safeAreaView}>
          <View style={styles.ViewNotifiOutGroup}>
            <View style={styles.paddingTitleNotifiOutGroup}>
              <Text style={styles.notifiOutGroup}>
                このグループに参加していません。
              </Text>
            </View>
            <View style={styles.viewNotifiOutGroup}>
              <TouchableOpacity
                style={styles.paddingViewNotifiOutGroup}
                onPress={handleConfirm}>
                <Text style={styles.notifiOutGroup}>OK</Text>
              </TouchableOpacity>
            </View>
          </View>
        </SafeAreaView>
      </Modal>
    );
  },
);

const styles = StyleSheet.create({
  safeAreaView: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  notifiOutGroup: {
    textAlign: 'center',
  },
  viewNotifiOutGroup: {
    borderTopColor: '#ccc',
    borderTopWidth: 0.5,
  },
  paddingViewNotifiOutGroup: {
    paddingVertical: 10,
  },
  paddingTitleNotifiOutGroup: {
    paddingVertical: 20,
  },
  ViewNotifiOutGroup: {
    backgroundColor: '#fff',
    width: '80%',
  },
});

export default memo(ModalConfirmGroupNotExist);
