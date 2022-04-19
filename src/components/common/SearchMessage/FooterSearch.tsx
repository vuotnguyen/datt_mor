import React, {memo, useCallback, useMemo, useState} from 'react';
import {Dimensions, StyleSheet, View, Text} from 'react-native';
import {AntDesign} from '../../../assets/icons';
import {IChatResutlMessageSearch} from '../../../models/chat';
import {ButtonIcon} from '../../buttons';

type Props = {
  idmessage: string;
  keywork: string;
  indexItemSelected: number;
  dataMessageSearch: Array<IChatResutlMessageSearch>;
  handleArrowUpDownSearchMessage: (
    idmessage: string,
    create_at: string,
    index: number,
  ) => void;
};
const FooterSearch: React.FC<Props> = ({
  idmessage,
  keywork,
  handleArrowUpDownSearchMessage,
  indexItemSelected,
  dataMessageSearch,
}) => {
  const handleArrowUp = useCallback(() => {
    if (indexItemSelected < dataMessageSearch.length) {
      const indexArrow = indexItemSelected + 1;
      const dataSearch = dataMessageSearch.findIndex(
        (m: IChatResutlMessageSearch, index: number) =>
          index === indexArrow - 1,
      );
      const id_messageUp = dataMessageSearch[dataSearch].id_message;
      const createAt_messageUp = dataMessageSearch[dataSearch].create_at;
      handleArrowUpDownSearchMessage(
        id_messageUp,
        createAt_messageUp,
        dataSearch + 1,
      );
    }
  }, [idmessage, indexItemSelected, dataMessageSearch]);

  const handleArrowDown = useCallback(() => {
    if (indexItemSelected > 1) {
      const indexArrow = indexItemSelected - 1;
      const dataSearch = dataMessageSearch.findIndex(
        (m: IChatResutlMessageSearch, index: number) =>
          index === indexArrow - 1,
      );
      const id_messageDown = dataMessageSearch[dataSearch].id_message;
      const createAt_messageDown = dataMessageSearch[dataSearch].create_at;
      handleArrowUpDownSearchMessage(
        id_messageDown,
        createAt_messageDown,
        dataSearch + 1,
      );
    }
  }, [idmessage, indexItemSelected, dataMessageSearch]);

  return (
    <View style={[styles.container]}>
      <View style={[styles.groupActions]}>
        <ButtonIcon onPress={() => handleArrowUp()}>
          <View style={[styles.viewArrowUp, styles.centerAlign]}>
            <AntDesign
              name="up"
              size={20}
              style={{
                color:
                  indexItemSelected === dataMessageSearch.length ||
                  indexItemSelected === 0 ||
                  dataMessageSearch.length === 0 ||
                  keywork === ''
                    ? '#CCCCCC'
                    : '#000',
              }}
            />
          </View>
        </ButtonIcon>
        <ButtonIcon onPress={() => handleArrowDown()}>
          <View style={[styles.viewArrowDown, styles.centerAlign]}>
            <AntDesign
              name="down"
              size={20}
              style={{
                color:
                  indexItemSelected === 1 ||
                  indexItemSelected === 0 ||
                  dataMessageSearch.length === 0 ||
                  keywork === ''
                    ? '#CCCCCC'
                    : '#000',
              }}
            />
          </View>
        </ButtonIcon>
        <View style={[styles.viewArrowDown, styles.centerAlign]}>
          <Text>
            {indexItemSelected !== 0 && dataMessageSearch.length !== 0 && keywork !== ''
              ? `${indexItemSelected}/${dataMessageSearch.length}`
              : null}
          </Text>
        </View>
      </View>
    </View>
  );
};
export default FooterSearch;

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
  viewContainer: {
    position: 'relative',
  },
  groupActions: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'flex-end',
    // paddingVertical: 5,
    paddingTop: 0,
    backgroundColor: '#fff',
  },
  centerAlign: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  viewArrowUp: {
    paddingHorizontal: 9,
    paddingVertical: 9.5,
  },
  viewArrowDown: {
    paddingHorizontal: 9.5,
    paddingVertical: 9,
  },
});
