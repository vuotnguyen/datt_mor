import React, {memo, useCallback, useState} from 'react';
import {
  Dimensions,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import {AntDesign} from '../../assets/icons';
import {debounce} from 'lodash';

const InputGroupNameHandle: React.FC<{
  setGroupName: (text: string) => void;
}> = memo(({setGroupName}) => {
  const [text, settext] = useState<string>('');
  const handler = useCallback(
    debounce((text: string) => {
      // console.log(text, 'text ????');
      return setGroupName(text);
    }, 500),
    [],
  );
  const handleChangeText = useCallback((e: string) => {
    settext(e);
    handler(e);
  }, []);
  const handleClear = useCallback(() => {
    settext('');
    setGroupName('');
  }, []);
  return (
    <View style={styles.wrapperInput}>
      {/* text Input group  */}
      <TextInput
        maxLength={50}
        onChangeText={handleChangeText}
        // onChangeText={settext}
        value={text}
        numberOfLines={5}
        placeholder={'グループ名'}
        multiline
        scrollEnabled={true}
        autoFocus={false}
        blurOnSubmit={true}
        style={[
          {
            fontSize: 18,
            color: '#000',
            marginRight: 40,
            flex: 1,
            maxHeight: 100,
            width: '100%',
          },
          Platform.OS === 'ios'
            ? {
                paddingBottom: 10,
              }
            : {
                paddingBottom: 3,
                paddingTop: 3,
              },
        ]}
      />

      <View
        style={{
          position: 'absolute',
          right: 10,
          top: 2,
        }}>
        <Text
          style={{
            marginBottom: 5,
            fontSize: 14,
            color: 'rgba(0,0,0,0.3)',
          }}>
          {text.length}/50
        </Text>
      </View>
      <View
        style={{
          position: 'absolute',
          right: 10,
          height: '100%',
          alignItems: 'center',
          flexDirection: 'row',
        }}>
        <TouchableOpacity
          style={[
            {
              backgroundColor: 'rgba(0,0,0,0.3)',
              paddingVertical: 4,
              paddingHorizontal: 4.5,
              borderRadius: 20 / 2,
              display: text.length > 0 ? 'flex' : 'none',
            },
          ]}
          onPress={handleClear}>
          <AntDesign name={'close'} size={10} color={'#fff'} />
        </TouchableOpacity>
      </View>
    </View>
  );
});

export default InputGroupNameHandle;

const styles = StyleSheet.create({
  wrapperInput: {
    flex: 1.5,
    paddingLeft: 10,
    overflow: 'hidden',
    height: 101,
    paddingRight: 5,
    paddingTop: 10,
    flexDirection: 'row',
    position: 'relative',
    alignItems: 'center',
  },
});
