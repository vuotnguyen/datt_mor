import React, {memo, useState} from 'react';
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  ScrollView,
  Pressable,
  TouchableHighlight,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {ButtonIcon} from '../../buttons';
import {emojiCodesArr, emojiListTab} from './EmojiData';
import TwemojiText from 'react-native-twemojis';
import TwemojiIcon from '../../common/EmojiIconText';
interface Props {
  text: string;
  selectEmoji: (emoji: string) => void;
}
const Emoji: React.FC<Props> = ({text, selectEmoji}) => {
  const [emojiCurrent, setEmojiCurrent] = useState<{
    name: string;
    data: Array<number>;
  }>(emojiCodesArr[0]);
  return (
    <View>
      <View style={{position: 'relative', backgroundColor: '#fff'}}>
        <FlatList
          showsHorizontalScrollIndicator={false}
          showsVerticalScrollIndicator={false}
          data={emojiListTab}
          horizontal
          style={{
            marginHorizontal: 10,
            marginBottom: 4,
          }}
          keyExtractor={(item, index) => 'slider' + index}
          renderItem={({item}) => (
            <Pressable
              onPress={() => {
                let newData = emojiCodesArr.find(tab => tab.name == item.name);
                if (newData) {
                  setEmojiCurrent(newData);
                }
              }}>
              <View
                style={[
                  {
                    borderRadius: 5,
                    padding: 4,
                    margin: 2,
                    paddingHorizontal:6
                  },
                  emojiCurrent.name == item.name
                    ? {
                        backgroundColor: 'rgba(229,229,229,1)',
                        borderRadius: 5,
                      }
                    : {},
                ]}>
                <TwemojiIcon size={17}>
                  {String.fromCodePoint(item.code)}
                </TwemojiIcon>
              </View>
            </Pressable>
          )}
        />
      </View>
      <FlatList
        data={emojiCurrent.data}
        numColumns={7}
        overScrollMode={'never'}
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}
        ListFooterComponent={() => (
          <View style={{height: 50, width: 100}}></View>
        )}
        columnWrapperStyle={{
          width: '100%',
          flexDirection: 'row',
        }}
        renderItem={({item}) => (
          <ButtonIcon
            onPress={() => selectEmoji(text + String.fromCodePoint(item))}
            style={{
              marginBottom: 2,
              flex: 1 / 7,
            }}>
            <View
              style={{
                paddingVertical: 7,
                paddingHorizontal: 7,
                display: 'flex',
                flexDirection: 'row',
                justifyContent: 'center',
              }}>
              <TwemojiText style={{height: 35, fontSize: 30}}>
                {String.fromCodePoint(item)}
              </TwemojiText>
            </View>
          </ButtonIcon>
        )}
        keyExtractor={(item, index) => `emojiCurrent_${index}`}
      />
    </View>
  );
};
export default memo(Emoji);
const styles = StyleSheet.create({});
