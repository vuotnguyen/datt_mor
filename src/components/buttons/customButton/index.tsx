import React from 'react';
import {StyleSheet, Text, TouchableNativeFeedback} from 'react-native';
import {set} from 'lodash';
import {IButton} from '../index';
import {Button} from 'native-base';
const CustomButton: React.FC<IButton> = ({
  title,
  onPress,
  colorButton,
  outlined,
  textColor,
  borderColor,
  disabled,
  style,
  colorDisabled,
}) => {
  const getProps = () => {
    const item = {};
    if (outlined) {
      set(item, 'variant', 'outline');
    }
    if (disabled) {
      set(item, 'disabled', disabled);
    }
    return item;
  };
  return (
    <Button
      {...getProps()}
      onPress={() => onPress()}
      style={[
        {
          width: '100%',
          borderRadius: 5,
          height: 55,
          backgroundColor: disabled ? colorDisabled : colorButton,
          borderColor: outlined
            ? borderColor
            : disabled
            ? colorDisabled
            : borderColor,
          shadowOffset: {height: 0, width: 0},
          elevation: 0,
          borderWidth: 1,
        },
        style,
      ]}>
      <Text style={[styles.text, {color: textColor}]}>{title}</Text>
    </Button>
  );
};

const styles = StyleSheet.create({
  button: {
    borderWidth: 2,
    borderRadius: 6,
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    fontSize: 15,
    letterSpacing: 0.04,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

export default CustomButton;
