import React, {useState, memo, useCallback, useMemo} from 'react';
import {
  Dimensions,
  Image,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Pressable,
  Animated,
} from 'react-native';
import {ISliderItem} from '../../../models/sliderItem';
import {IImage} from '../../../models/image';
import {useAppDispatch} from '../../../stories';
import {createAction} from '../../../stories/actions';
import {modal} from '../../../stories/types';
import * as globalStyles from '../../../styles';
import ImageResView from '../ImageResView/ImageSlider';
const {height, width} = Dimensions.get('screen');
import {iconUser} from '../../../assets/images/users';
import {useS3} from '../../../hooks/aws';
import AvatarRes from '../../common/Avatar';
import {get} from 'lodash';

interface Props {
  item: IImage;
}
const SliderItem: React.FC<Props> = ({item}) => {
  const dispatch = useAppDispatch();
  const imageAnimated = useMemo(() => new Animated.Value(0), []);
  const {getSignedUrl} = useS3();
  const handleImageLoad = useCallback(() => {
    Animated.timing(imageAnimated, {
      toValue: 1,
      useNativeDriver: false,
    }).start();
  }, [imageAnimated]);

  return (
    <View style={styles.cardView}>
      <Pressable
        onPress={() => {
          dispatch(createAction(modal.SET_MODAL, {isShow: true, value: item}));
        }}>
        <View style={[{position: 'relative'}]}>
          <View style={[styles.image]}>
            <ImageResView
              thumbnail={item.path_file_thumb}
              imageUri={item.path_file_thumb}
              height={height / 3}
            />
          </View>
        </View>
      </Pressable>

      <Pressable onPress={() => undefined}>
        <View
          style={{
            marginVertical: 15,
            display: 'flex',
            alignItems: 'flex-start',
            flexDirection: 'row',
          }}>
          <View style={{marginRight: 10}}>
            <AvatarRes
              size={40}
              uri={get(item, 'user.avatar.path_file_thumb', null)}
            />
          </View>
          <View>
            <Text style={[globalStyles.text.subTitle]}>
              {get(item, 'user.fullname', '')}
            </Text>
            <Text style={[{fontSize: 12, color: '#585858'}]}>
              {get(item, 'user.username', '')}
            </Text>
          </View>
        </View>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  cardView: {
    width: width,
    backgroundColor: 'transparent',
    paddingHorizontal: 14,
    borderRadius: 10,
  },
  textView: {
    position: 'absolute',
    bottom: 10,
    margin: 10,
    left: 5,
  },
  image: {
    width: '100%',
    height: height / 3,
    borderRadius: 5,
    overflow: 'hidden',
    marginHorizontal: 'auto',
  },
  itemTitle: {
    color: '#fff',
    fontSize: 22,
    shadowColor: '#000',
    shadowOffset: {
      width: 0.8,
      height: 0.8,
    },
    shadowOpacity: 1,
    shadowRadius: 3,
    marginBottom: 5,
    fontWeight: 'bold',
    elevation: 5,
  },
  itemDescription: {
    color: '#fff',
    fontSize: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0.8,
      height: 0.8,
    },
    shadowOpacity: 1,
    shadowRadius: 3,
    elevation: 5,
  },
});

export default memo(SliderItem);
