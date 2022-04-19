import React, {memo, useEffect, useRef, useState} from 'react';
import {
  StyleSheet,
  Text,
  View,
  Dimensions,
  FlatList,
  Animated,
  SafeAreaView,
} from 'react-native';
import SliderItem from '../SliderItem';
import {IImage} from '../../../models/image';
import SLiderLoading from '../SliderItem/LoadingSilderItem';
import {} from 'native-base';
import {nativeViewProps} from 'react-native-gesture-handler/lib/typescript/handlers/NativeViewGestureHandler';
const {width, height} = Dimensions.get('screen');

interface Props {
  sliders: Array<IImage>;
  loading: boolean;
}
const Slider: React.FC<Props> = ({sliders, loading}) => {
  const indicator = new Animated.Value(0);
  const [wholeWidth, setwholeWidth] = useState<number>(1);
  const [visibleWidth, setvisibleWidth] = useState<number>(0);
  // let visibleWidth = 0;
  const refSlider = useRef<FlatList<IImage>>(null);
  const indicatorSize =
    wholeWidth > visibleWidth
      ? (visibleWidth * visibleWidth) / wholeWidth
      : visibleWidth;

  const difference =
    visibleWidth > indicatorSize ? visibleWidth - indicatorSize : 1;
  const handleLoadMore = () => {
    // setTimeout(() => {
    //   refSlider.current?.scrollToOffset({animated: true, offset: 0,});
    // }, 1000);
  };
  if (sliders && sliders.length) {
    return (
      <SafeAreaView>
        {/* {loading ? (
          <SLiderLoading />
        ) : ( */}
        <FlatList
          ref={refSlider}
          data={sliders}
          keyExtractor={(item, index) => 'slider' + index}
          horizontal
          pagingEnabled
          snapToAlignment="center"
          // scrollEventThrottle={100}
          decelerationRate={'fast'}
          renderItem={({item}) => <SliderItem item={item} />}
          onEndReached={handleLoadMore}
          // onEndReachedThreshold={0.7}
          showsHorizontalScrollIndicator={false}
          zoomScale={1000}
          indicatorStyle={'black'}
          onContentSizeChange={width => {
            setwholeWidth(width);
          }}
          onLayout={({
            nativeEvent: {
              layout: {width},
            },
          }) => setvisibleWidth(width)}
          onScroll={Animated.event(
            [{nativeEvent: {contentOffset: {x: indicator}}}],
            {useNativeDriver: false},
          )}
        />
        {sliders.length > 1 ? (
          <View style={styles.indicatorWrapper}>
            <Animated.View
              style={[
                // styles.indicator,
                {
                  width: 40,
                  height: 3,
                  borderRadius: 5,
                  backgroundColor: 'rgba(0,0,0,0.6)',
                  transform: [
                    {
                      translateX: Animated.multiply(
                        indicator,
                        visibleWidth / wholeWidth,
                      ).interpolate({
                        inputRange: [0, difference],
                        outputRange: [1, difference],
                        extrapolate: 'extend',
                      }),
                    },
                  ],
                },
              ]}
            />
          </View>
        ) : null}
      </SafeAreaView>
    );
  }
  return null;
};

const styles = StyleSheet.create({
  indicatorWrapper: {
    marginHorizontal: 14,
  },
});

export default memo(Slider);
