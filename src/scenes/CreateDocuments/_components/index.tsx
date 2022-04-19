import React from 'react';
import {
  StyleSheet,
  Image,
  Text,
  TouchableOpacity,
  View,
  Pressable,
  TextInput as TextInputRN,
  TextInputProps,
  ButtonProps,
  StyleProp,
  ViewStyle,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {ButtonIcon} from '../../../components/buttons';
import {AntDesign, Entypo, Ionicons} from '../../../assets/icons';
import * as stylesGlobal from '../../../styles';
import {COLOR_CONSTANT} from '../../../styles/colors';
import {iconUser} from '../../../assets/images/users';
import {set} from 'lodash';
function index() {
  return (
    <View>
      <Text></Text>
    </View>
  );
}
type IHeader = {
  title?: string;
  disabledBtnRight?: boolean;
  onPressBtnRight?: () => void;
  goBack?: () => void;
  loading?: boolean;
};
export const Header = React.memo(
  ({
    title = '',
    onPressBtnRight = () => undefined,
    disabledBtnRight = false,
    loading = false,
    goBack = () => undefined,
  }: IHeader) => (
    <>
      <View
        style={{
          marginBottom: 0,
          backgroundColor: '#fff',
          flexWrap: 'nowrap',
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
        <View
          style={{
            width: '20%',
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'flex-start',
          }}>
          <ButtonIcon onPress={goBack} style={{marginVertical: 3.5}}>
            <View
              style={{
                paddingHorizontal: 6,
                paddingVertical: 5,
              }}>
              <Ionicons size={25} name="ios-chevron-back" />
            </View>
          </ButtonIcon>
        </View>
        <View style={{justifyContent: 'center', flex: 1}}>
          <Text
            style={[
              stylesGlobal.text.subTitle,
              {fontSize: 14, textAlign: 'center'},
            ]}>
            {title}
          </Text>
        </View>

        <View
          style={{
            width: '20%',
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'flex-end',
          }}>
          <View>
            <TouchableOpacity
              activeOpacity={0.8}
              style={[
                styles.buttonContainer,
                {
                  backgroundColor: disabledBtnRight
                    ? 'rgba(0,0,0,0.3)'
                    : COLOR_CONSTANT.PRIMARY_COLOR,
                  width: 65,
                  height: 24,
                },
              ]}
              onPress={onPressBtnRight}
              disabled={disabledBtnRight || loading}>
              <View style={styles.button}>
                <Text
                  style={[styles.buttonText, {color: '#ffffff', fontSize: 12}]}>
                  作成
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </>
  ),
);
export const Label = ({text}: {text: string}) => {
  return <Text style={[stylesGlobal.text.subTitle, styles.label]}>{text}</Text>;
};

export const TabHeader = ({
  text,
  buttonRight,
}: {
  text: string;
  buttonRight?: JSX.Element;
}) => {
  return (
    <View
      style={{
        display: 'flex',
        alignItems: 'center',
        flexWrap: 'nowrap',
        flexDirection: 'row',
        justifyContent: 'space-between',
      }}>
      <Label text={text} />
      {buttonRight}
    </View>
  );
};

interface IButtonDefault {
  label?: string;
  disabled?: boolean;
  onPress?: () => void;
  color?: 'default' | 'primary';
  block?: boolean;
  style?: StyleProp<ViewStyle>;
  size?: 'medium' | 'large' | 'small';
}
export const ButtonDefault = ({
  label = '',
  disabled = false,
  onPress = () => undefined,
  color = 'default',
  block = false,
  style = {},
  size = 'medium',
}: IButtonDefault) => {
  const getColor = (type: string) => {
    switch (type) {
      case 'primary':
        return COLOR_CONSTANT.PRIMARY_COLOR;
      default: {
        return '#BDBDBD';
      }
    }
  };
  const getStyles = () => {
    let style = {};
    set(style, 'paddingHorizontal', 10);
    if (block) {
      set(style, 'width', '100%');
    }
    switch (size) {
      case 'large': {
        set(style, 'paddingVertical', 10);
        break;
      }
      case 'medium': {
        set(style, 'paddingVertical', 7);
        break;
      }
      case 'small': {
        set(style, 'paddingVertical', 5);
        break;
      }
    }
    return style;
  };
  return (
    <View style={{display: 'flex', flexDirection: 'row', alignItems: 'center'}}>
      <TouchableOpacity
        activeOpacity={0.8}
        style={[
          styles.buttonDefault,
          {
            backgroundColor: getColor(color),
          },
          getStyles(),
          style,
        ]}
        onPress={onPress}
        disabled={disabled}>
        <Text style={styles.buttonText}>{label}</Text>
      </TouchableOpacity>
    </View>
  );
};

const AvatarUser = ({uri = ''}: {uri?: string}) => {
  return (
    <Image
      source={uri ? {uri: uri} : iconUser}
      style={{height: 50, width: 50, borderRadius: 999}}
    />
  );
};

export const UserBox = ({
  uri = '',
  onDelete = () => undefined,
}: {
  uri?: string;
  onDelete?: () => void;
}) => {
  return (
    <View
      style={{
        position: 'relative',
        padding: 1,
        marginHorizontal: 5,
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
      }}>
      <AvatarUser uri={uri} />
      <Pressable style={styles.deleteDot} onPress={onDelete}>
        <AntDesign name={'close'} size={12} color={'#fff'} />
      </Pressable>
    </View>
  );
};
interface TextInput extends TextInputProps {}
export const TextInput = ({...rest}: TextInput) => {
  return <TextInputRN {...rest} style={[styles.textInput, rest.style]} />;
};

const styles = StyleSheet.create({
  // button style
  buttonContainer: {
    height: 24,
    width: 75,
    backgroundColor: COLOR_CONSTANT.PRIMARY_COLOR,
    borderRadius: 3,
    marginRight: 8,
  },
  buttonDefault: {
    borderRadius: 3,
    marginRight: 8,
  },
  button: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
  },
  buttonText: {
    color: '#000000',
    textAlign: 'center',
  },
  //   label style
  label: {
    fontSize: 16,
  },

  //   user box style

  deleteDot: {
    position: 'absolute',
    top: 4,
    right: 1,
    // height: 25,
    // width: 25,
    paddingVertical: 4,
    paddingHorizontal: 4,
    backgroundColor: 'rgba(0,0,0,1)',
    borderRadius: 20 / 2,
    transform: [{translateY: -5}],
    // borderColor: '#fff',
    // borderWidth: 1,
    flex: 1,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  // text input
  textInput: {
    borderWidth: 0.5,
    borderRadius: 4,
    borderColor: 'rgba(0,0,0,0.5)',
  },
});
