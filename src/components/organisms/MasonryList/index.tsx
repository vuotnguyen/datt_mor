import React, {memo, useEffect, useMemo, useRef, useState} from 'react';
import {
  Dimensions,
  Image,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
  Pressable,
  TouchableWithoutFeedback,
  ActivityIndicator,
  FlatList,
} from 'react-native';
import {IImage} from '../../../models/Image';
import ImageResView from '../ImageResView';
import {useAppDispatch} from '../../../stories';
import {createAction} from '../../../stories/actions';
import {modal} from '../../../stories/types';
import ProgessiveImage from '../../common/ProgessiveImage';
import SkeletonPlaceholder from 'react-native-skeleton-placeholder';
import {colors} from '../../../styles';
import {ScrollView} from 'react-native-gesture-handler';
interface Props {
  items: Array<IImage>;
  loadMore: boolean;
  SetMinHeightScroll: Function;
}
const {height, width} = Dimensions.get('window');

const MasonryList: React.FC<Props> = ({
  items,
  loadMore,
  SetMinHeightScroll,
}) => {
  const [leftHeight, SetLeftHeight] = useState<number>(0);
  const [rightHeight, SetRightHeight] = useState<number>(0);
  const dispatch = useAppDispatch();
  useEffect(() => {
    SetMinHeightScroll(rightHeight > leftHeight ? leftHeight : rightHeight);
  }, [rightHeight, leftHeight]);
  return (
    <SafeAreaView>
      {/* list images */}
      <View
        style={{
          display: 'flex',
          flexDirection: 'row',
          flexWrap: 'wrap',
          justifyContent: 'space-between',
        }}>
        <View style={{display: 'flex', width: width / 2 - 18}}>
          <View
          // onLayout={({nativeEvent}) => {
          //   SetLeftHeight(nativeEvent.layout.height);
          // }}
          >
            {items.map((item, index) =>
              index % 2 === 0 ? (
                <View key={index} style={{marginBottom: 8}}>
                  <Pressable
                    onPress={() => {
                      dispatch(
                        createAction(modal.SET_MODAL, {
                          isShow: true,
                          value: item,
                        }),
                      );
                    }}>
                    <ImageResView
                      imageUri={item.path_file_thumb}
                      thumbnail={item.path_file_thumb}
                    />
                  </Pressable>
                </View>
              ) : null,
            )}
          </View>
        </View>
        <View style={{display: 'flex', width: width / 2 - 18}}>
          <View
          // onLayout={({nativeEvent}) => {
          //   SetRightHeight(nativeEvent.layout.height);
          // }}
          >
            {items.map((item, index) =>
              index % 2 !== 0 ? (
                <View key={index} style={{marginBottom: 8}}>
                  <Pressable
                    onPress={() => {
                      dispatch(
                        createAction(modal.SET_MODAL, {
                          isShow: true,
                          value: item,
                        }),
                      );
                    }}>
                    <ImageResView
                      imageUri={item.path_file_thumb}
                      thumbnail={item.path_file_thumb}
                    />
                  </Pressable>
                </View>
              ) : null,
            )}
          </View>
        </View>
      </View>
      {loadMore ? <ActivityIndicator size="small" color={'#999999'} /> : null}
    </SafeAreaView>
  
    
  );
};

const styles = StyleSheet.create({
  box: {
    padding: 4,
    width: '50%',

    flexBasis: 'auto',
  },
  image: {
    width: 50,
    height: 50,
  },
});
export default memo(MasonryList);
