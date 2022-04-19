import * as React from 'react';

//Components
import { Image, ImageBackground, Text, Platform, View } from 'react-native';

//Utils
import reactStringReplace from 'react-string-replace';
import { emojiUnicode } from './util';

//Styles
import { StyleSheet } from 'react-native';

//Types
import { TextProps, ImageStyle } from 'react-native';
import regexifyString from 'regexify-string';

type TwemojiTextProps = {
  isMessage?: Boolean;
  twemojiStyle?: ImageStyle;
  children: string;
  size?: number;
  styleEmoji?: ImageStyle;
  keywordSearch?: string;
  keyworkFullwidth?: string;
  keyworkHalfwidth?: string;
  idmessageSearch?: string;
  idmessage?: string;
};

var EMOJI_REGEX = /([^\u3000-\u303F]\[^\u3040-\u309F]\[^\u30A0-\u30FF]\[^\uFF00-\uFFEF]\[^\u4E00-\u9FAF]\[^\u2605-\u2606]\[^\u2190-\u2195]\[^\u203B]|\ud83e[\ud000-\udfff]|\ud83d[\ud000-\udfff]|\ud83c[\ud000-\udfff])/g

const TwemojiText: React.VFC<TextProps & TwemojiTextProps> = ({
  isMessage,
  twemojiStyle,
  children,
  size,
  styleEmoji,
  keywordSearch,
  keyworkFullwidth,
  keyworkHalfwidth,
  idmessageSearch,
  idmessage,
  ...props
}) => {
  const highlightMessage: any[] = [];
  const parts = reactStringReplace(children, EMOJI_REGEX, (emoji, i) => (
    <View
      key={`emoji-view-${i}`}
      style={{
        paddingTop:
          Platform.OS === 'ios' ? (isMessage ? 4 : 6) : isMessage ? 8 : 0,
        // paddingTop: isMessage ? 8 : Platform.OS === 'ios' ? 6 : 0,
        alignItems: 'center',
        height: 20,
        justifyContent: 'center',
      }}>
      <ImageBackground
        testID={emoji}
        style={[
          twemojiStyle ??
          {
            //backgroundColor: 'blue',
          },
          {
            width: size ? size : 14,
            height: size ? size : 14,
            alignItems: 'center',
          },
        ]}
        resizeMethod={'auto'}
        resizeMode={'center'}
        source={{
          uri: `https://twemoji.maxcdn.com/2/72x72/${emojiUnicode(emoji)}.png`,
        }}
      //source={emojiSource[emojiUnicode(emoji)]} 
      />
    </View>
  ));

  //highlight if exit keyword search message
  if (keywordSearch && keyworkHalfwidth && keyworkFullwidth && idmessage === idmessageSearch) {
    parts.map(async part => {
      if (typeof part === 'string') {
        const regexKeywork = part.includes(keyworkFullwidth) ? keyworkFullwidth : keyworkHalfwidth
        const regex = new RegExp(`${regexKeywork}`, `gim`);
        const result = regexifyString({
          pattern: regex,//new RegExp(`/${keywordSearch}/gim`),
          decorator: (match, index) => {
            return <Text key={index} style={{ color: 'black', backgroundColor: 'yellow' }}>{match}</Text>
          },
          input: part,
        });
        highlightMessage.push(result, '');
      }
      else {
        highlightMessage.push(part, '');
      }
    })
  }

  return (
    <Text
      testID={'text'}
      {...props}
      style={[
        {
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'row',
        },
        props.style,
      ]}>
      {(keywordSearch && idmessage === idmessageSearch) ? highlightMessage : parts}
    </Text>
  );
};

export default TwemojiText;
