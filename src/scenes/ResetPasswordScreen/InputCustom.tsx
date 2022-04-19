import * as React from 'react';
import {TextInput, TextInputProps, StyleSheet} from 'react-native';

const InputCustom = (props: TextInputProps) => {
  return <TextInput {...props}  style={[styles.input, props.style]} />;
};
const styles = StyleSheet.create({
  input: {
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.5)',
    borderRadius:3,
    paddingHorizontal: 10,
    color: '#000',
    width: '100%',
    alignSelf: 'center',
  },
});
export default InputCustom;
