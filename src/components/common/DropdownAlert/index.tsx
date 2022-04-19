import React, {useEffect, useState} from 'react';
import {StyleSheet, Text, View} from 'react-native';
import DropdownAlertComponent from 'react-native-dropdownalert';
import {useAppDispatch, useAppSelector} from '../../../stories';
import {createAction} from '../../../stories/actions';
import {modal} from '../../../stories/types';
const DropdownAlert = () => {
  const dispatch = useAppDispatch();
  const {isShow, message, title, type} = useAppSelector(
    state => state.dataModal.alertToast,
  );
  const [
    dropDownAlert,
    setDropDownAlert,
  ] = useState<DropdownAlertComponent | null>(); 

  useEffect(() => {
    if (isShow) {
      dropDownAlert?.alertWithType(type, title, message);
      dispatch(
        createAction(modal.SET_TOASH, {
          isShow: false,
          type: 'custom',
          title: '',
          message: '',
        }),
      );
    }
  }, [isShow]);
  return (
    <DropdownAlertComponent
      updateStatusBar={false}
      ref={ref => setDropDownAlert(ref)}
      activeStatusBarBackgroundColor={'#ffffff'}
      zIndex={99}
    />
  );
};

const styles = StyleSheet.create({});

export default DropdownAlert;
