import { sanitizedRaw } from '@nozbe/watermelondb/RawRecord';
import { database } from './watermelonDB';
import _ from 'lodash';
import { Q } from '@nozbe/watermelondb'
import { writer } from '@nozbe/watermelondb/decorators'

class ChatDBHelper {
  get chatDB() {
    return database;
  }
  getCollection = name => {
    return this.chatDB.collections.get(name);
  };

  batchAction = async (batchData = []) => {
    return await this.chatDB.write(async () => {
      if (Array.isArray(batchData)) {
        await this.chatDB.batch(...batchData);
      }
      return true;
    });
  };


  //create 1 message
  prepareCreateMessageGroupChat = (message = {}) => {
    if (_.isEmpty(message)) {
      return null;
    }

    try {
      const roomCollection = this.getCollection('messages');
      return roomCollection.prepareCreate(s => {
        s._raw = sanitizedRaw({ id: message._id }, roomCollection.schema);
        Object.assign(s, message);
      });
    } catch (e) {
      console.log('prepareCreateMessage', e);
      return null;
    }
  };


  //create many message
  prepareCreateArrayMessageGroupChat = (rawRecord = []) => {
    try {
      if (!_.isArray(rawRecord)) {
        return [];
      }

      return rawRecord.map(raw => this.prepareCreateMessageGroupChat(raw));
    } catch (error) {
      console.log('prepareCreateArrayMessageGroupChat', error);
      return [];
    }
  }

  //get all message
  getAllRecordBySchema = async () => {
    try {
      const message = database.get('messages').query(
        Q.where('is_group', true),
        Q.and(Q.where('isCache', false)),
        Q.experimentalSortBy('create_at', Q.asc)
      ).fetch();
      return message;
    } catch (e) {
      console.log('getAllRecordBySchema', e);
      return null;
    }
  };

  //update 1 message
  prepareUpdateMessageChatGroup = async (record = {}, newData = {}, id = '') => {
    try {
      if (
        !(
          record &&
          !_.isEmpty(record) &&
          !record._hasPendingUpdate &&
          newData &&
          !_.isEmpty(newData)
        )
      ) {
        return null;
      }
      await database.write(async () => {
        const messageCache = await database.get('messages').find(id)
        await messageCache.update(() => {
          messageCache.message = newData.message;
          messageCache.filesLocal = newData.filesLocal;
          messageCache.participants = newData.participants;
        })
      })
    } catch (e) {
      console.log('prepareUpdateRecord', e, { record, newData });
      return null;
    }
  };


  //get message cache
  getMessageCache = async (roomID = '') => {
    try {
      const cache = await database.get('messages').query(
        Q.where('isCache', true),
        Q.and(
          Q.where('is_group', true)
        ),
        Q.and(
          Q.where('room_id', roomID)
        )
      ).fetch();
      return cache;
    } catch (e) {
      console.log('getMessageCache', e);
      return null;
    }
  };

  //get message unsend by id message
  getMessageUnSendByID = async (id_message = '') => {
    try {
      const cache = await database.get('messages').query(
        Q.where('id_message', id_message),
        Q.and(
          Q.where('is_group', true)
        )
      ).fetch();
      return cache;
    } catch (e) {
      console.log('getMessageCache', e);
      return null;
    }
  };

  //get message cache
  getMessageUnSend = async () => {
    try {
      const cache = await database.get('messages').query(
        Q.where('isUnsend', true),
        Q.and(
          Q.where('is_group', true)
        )
      ).fetch();
      return cache;
    } catch (e) {
      console.log('getMessageCache', e);
      return null;
    }
  };

  //get message local
  getMessageLocal = async () => {
    try {
      const cache = await database.get('messages').query(
        Q.where('isLocal', true),
        Q.and(
          Q.where('is_group', true)
        )
      ).fetch();
      return cache;
    } catch (e) {
      console.log('getMessageCache', e);
      return null;
    }
  };

  //get message local
  getMessageLocalByIdMessage = async (idMessage = '') => {
    try {
      const cache = await database.get('messages').query(
        Q.where('isLocal', true),
        Q.and(
          Q.where('id_message', idMessage)
        )
      ).fetch();
      return cache;
    } catch (e) {
      console.log('getMessageCache', e);
      return null;
    }
  };

  //delete all message
  deleteMessageLocal = async () => {
    try {
      await database.write(async () => {
        await this.getCollection('messages').query(
          Q.where('isLocal', true),
        ).destroyAllPermanently();
      })
      return true;
    } catch (e) {
      console.log('deleteRecordBySchema', e);
      return null;
    }
  };

  searchMessageLocal = async (keywork = '') => {
    try {
      const message = database.get('messages').query(
        Q.where('message', Q.like(`%${keywork}%`)),
        Q.and(
          Q.where('message', Q.notLike(`%SpecialMessage%`))
        ),
        Q.and(
          Q.where('is_group', true)
        )
      ).fetch();
      return message;
    } catch (e) {
      console.log('searchMessageLocal', e);
      return null;
    }
  };



  //chat 1-1
  //get message cache
  getMessageCacheIndividual = async (roomID = '') => {
    try {
      const cache = await database.get('messages').query(
        Q.where('isCache', true),
        Q.and(
          Q.where('is_group', false)
        ),
        Q.and(
          Q.where('room_id', roomID)
        )
      ).fetch();
      return cache;
    } catch (e) {
      console.log('getMessageCache', e);
      return null;
    }
  };

  //get message unsend
  getMessageUnsendIndividual = async (roomID = '') => {
    try {
      const cache = await database.get('messages').query(
        Q.where('isUnsend', true),
        Q.and(
          Q.where('is_group', false)
        ),
        Q.and(
          Q.where('room_id', roomID)
        )
      ).fetch();
      return cache;
    } catch (e) {
      console.log('getMessageCache', e);
      return null;
    }
  };

  //get message local
  getMessageLocalByIdMessageIndividual = async (idMessage = '') => {
    try {
      const cache = await database.get('messages').query(
        Q.where('isLocal', true),
        Q.and(
          Q.where('id_message', idMessage)
        ),
        Q.and(
          Q.where('is_group', false)
        )
      ).fetch();
      return cache;
    } catch (e) {
      console.log('getMessageCache', e);
      return null;
    }
  };

  //get message local
  getMessageLocalByIdMessageIndividual = async (idMessage = '') => {
    try {
      const cache = await database.get('messages').query(
        Q.where('isLocal', true),
        Q.and(
          Q.where('id_message', idMessage)
        ),
        Q.and(
          Q.where('is_group', false)
        )
      ).fetch();
      return cache;
    } catch (e) {
      console.log('getMessageCache', e);
      return null;
    }
  };

  //update 1 message Individual
  prepareUpdateStatusMessageChatGroupIndividual = async (record = {}, id = '') => {
    try {
      if (
        !(
          record &&
          !_.isEmpty(record) &&
          !record._hasPendingUpdate
        )
      ) {
        return null;
      }
      await database.write(async () => {
        const messageCache =
          await database.get('messages').find(id)
        await messageCache.update(() => {
          messageCache.status = 2;
        })
      })
    } catch (e) {
      console.log('prepareUpdateRecord', e, { record });
      return null;
    }
  };

  //update status array message 1-1


  //get all message
  getAllRecordIndividual = async () => {
    try {
      const message = database.get('messages').query(
        Q.where('is_group', false),
        Q.and(Q.where('isCache', false)),
        Q.and(Q.where('isUnsend', false)),
        Q.experimentalSortBy('create_at', Q.asc)
      ).fetch();
      return message;
    } catch (e) {
      console.log('getAllRecordIndividual', e);
      return null;
    }
  };

  //get message cache
  deleteMessage = async (roomID = '', idMessage = '') => {
    try {
      await database.write(async () => {
        await this.getCollection('messages').query(
          Q.where('room_id', roomID),
          Q.and(
            Q.where('id_message', idMessage)
          )
        ).markAllAsDeleted();
      })
      
      return true;
    } catch (e) {
      console.log('deleteMessage', e);
      return null;
    }
  };
}

const ChatDBHelperInstance = new ChatDBHelper();
export { ChatDBHelperInstance };
