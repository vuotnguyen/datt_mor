import React from 'react';
import {StyleSheet, Text, View} from 'react-native';
import * as stylesGlobal from '../../../styles';
const ChatBoxLoading = () => (
  <View
    style={{
      paddingVertical: 20,
      borderStyle: 'solid',
      borderBottomColor: 'rgba(0,0,0,0.1)',
      borderBottomWidth: 1,
      paddingHorizontal: 10,
    }}>
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
      }}>
      <View style={{flex: 0.7}}>
        <View
          style={{
            width: 50,
            height: 50,
            borderRadius: 50,
            backgroundColor: stylesGlobal.colors.LOADING,
          }}
        />
      </View>
      <View style={{flex: 3, marginBottom: 5}}>
        <View
          style={{
            width: 120,
            height: 15,
            borderRadius: 4,
            backgroundColor: stylesGlobal.colors.LOADING,
          }}
        />
        <View
          style={{
            marginTop: 6,
            width: 80,
            height: 15,
            borderRadius: 4,
            backgroundColor: stylesGlobal.colors.LOADING,
          }}
        />
      </View>
    </View>
  </View>
);
export default ChatBoxLoading;
const styles = StyleSheet.create({});
