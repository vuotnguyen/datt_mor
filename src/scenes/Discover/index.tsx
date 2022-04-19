import React, {
  memo,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {Text, View, Dimensions, RefreshControl, ScrollView} from 'react-native';
import * as globalStyles from '../../styles';
import {SafeAreaView} from 'react-native-safe-area-context';
import Slider from '../../components/organisms/Slider';
import MasonryList from '../../components/organisms/MasonryList';
import {createAction, ImageAction} from '../../stories/actions';
import {useAppDispatch, useAppSelector} from '../../stories';
import {
  withNavigationFocus,
  NavigationFocusInjectedProps,
} from 'react-navigation';
import {useDispatch} from 'react-redux';
import {chat, common, dataCache, image} from '../../stories/types';
const {width, height} = Dimensions.get('screen');
import MESSAGE from '../../config/Messages';
import SLiderLoading from '../../components/organisms/SliderItem/LoadingSilderItem';
import MasonryListLoading from '../../components/organisms/MasonryList/LoadingMasonry';
import {DOMAIN_SOCKET} from '../../config/Constants';
interface Props {
  isFocused: boolean;
  navigation: any;
}
const DiscoverScreen: React.FC<Props> = ({isFocused, navigation}) => {
  const dispatchThunk = useDispatch();
  const dispatchLocal = useAppDispatch();

  const [count, setCount] = useState<number>(1);
  const [loadingSlider, setLoadingSlider] = useState<boolean>(false);
  const [loadingMansory, setLoadingMansory] = useState<boolean>(false);
  const [loadMore, setLoadMore] = useState<boolean>(false);
  const [refresh, setRefresh] = useState<boolean>(false);
  const [minHeightScroll, SetMinHeightScroll] = useState<number>();
  const scrollRef = useRef<ScrollView | any>();
  const {ImageCurrentDay, ImageDayBefore} = useAppSelector(
    state => state.dataImage,
  );
  const FetchData = () => {
    setCount(1);
    const success = () => {};
    const fail = () => {};
    setLoadingSlider(true);
    setLoadingMansory(true);
    dispatchThunk(
      ImageAction.GetListImageCurrentDate(success, fail, () => {
        setLoadingSlider(false);
      }),
    );
    dispatchThunk(
      ImageAction.GetListImageDayBefore(success, fail, () => {
        setLoadingMansory(false);
      }),
    );
    setRefresh(false);
  };

  const _scrollToTop = () => {
    scrollRef.current.scrollTo({x: 0, y: 0, animated: false});
    FetchData();
  };

  useEffect(() => {
    navigation.setParams({
      scrollToTop: _scrollToTop,
    });

    if (isFocused) {
      FetchData();
    }
  }, [isFocused]);
  const handleReadmore = useCallback(() => {
    if (!loadingMansory && !loadingSlider) {
      setCount(count + 1);
      if (count <= ImageDayBefore.totalPages) {
        dispatchLocal(
          createAction(image.GET_LIST_DAY_BEFORE_PAGINATION, count),
        );
      }
    }
  }, [count, loadingSlider, loadingMansory]);
  const onRefresh = () => {
    setRefresh(true);
    FetchData();
  };
  return (
    <SafeAreaView style={{backgroundColor: '#fff', minHeight: height}}>
      <ScrollView
        // pagingEnabled
        ref={scrollRef}
        removeClippedSubviews={true}
        // scrollEventThrottle={100}
        // overScrollMode={'never'}
        nestedScrollEnabled={false}
        refreshControl={
          <RefreshControl refreshing={refresh} onRefresh={onRefresh} />
        }
        style={{paddingBottom: 14}}
        onScrollEndDrag={() => {
          //   // setCount(count + 1);
          //   // setLoadMore(true);
          //   // setStateLoad({...stateLoad, loadMore: true});
          // handleReadmore();
        }}
        onScroll={e => {
          if (minHeightScroll) {
          }
          let paddingToBottom = e.nativeEvent.contentSize.height;
          let contentOffset =
            e.nativeEvent.contentOffset.y +
            e.nativeEvent.layoutMeasurement.height +
            50;
          // if (ImageCurrentDay.listAll.length === 0) {
          //   contentOffset += 350;
          // }
          if (contentOffset >= paddingToBottom) {
            // make something...
            handleReadmore();
          }
        }}>
        {/* title */}
        <View style={{padding: 14}}>
          <Text style={[globalStyles.text.title]}>共有画像一覧</Text>
        </View>

        {/* slider */}
        <View>
          <Text
            style={[
              globalStyles.text.subTitle,
              {paddingTop: 14, paddingHorizontal: 14, marginBottom: 24},
            ]}>
            今日の写真
          </Text>
          <View style={[{position: 'relative'}]}>
            {loadingSlider ? (
              <View
                style={{
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  zIndex: 5,
                  height: 350,
                }}>
                <SLiderLoading />
              </View>
            ) : null}
            {!loadingSlider && ImageCurrentDay.listAll.length > 0 ? (
              <Slider
                sliders={ImageCurrentDay.listAll}
                loading={loadingSlider}
              />
            ) : !loadingSlider ? (
              <Text
                style={[
                  globalStyles.text.subTitle,
                  {
                    textAlign: 'center',
                    fontWeight: 'normal',
                    marginBottom: 24,
                    textAlignVertical: 'center',
                  },
                ]}>
                {MESSAGE.HOME.MSG_HOME_TEXT_001}
              </Text>
            ) : null}
          </View>
        </View>

        <View style={{paddingHorizontal: 14, marginTop: 48, marginBottom: 24}}>
          <Text style={[globalStyles.text.subTitle]}>全て表示する</Text>
        </View>

        <View style={{paddingHorizontal: 14}}>
          <View style={{position: 'relative'}}>
            {loadingMansory ? (
              <View
                style={{
                  left: 0,
                  right: 0,
                  bottom: 0,
                  zIndex: 5,
                  marginBottom: height * 0.07,
                }}>
                <MasonryListLoading />
              </View>
            ) : null}
            {!loadingMansory && ImageDayBefore.listCurrent.length > 0 ? (
              <View style={{marginBottom: height * 0.07}}>
                <MasonryList
                  items={ImageDayBefore.listCurrent}
                  loadMore={loadMore}
                  SetMinHeightScroll={SetMinHeightScroll}
                />
              </View>
            ) : !loadingMansory ? (
              <Text
                style={[
                  globalStyles.text.subTitle,
                  {
                    textAlign: 'center',
                    fontWeight: 'normal',
                    marginBottom: 40,
                    textAlignVertical: 'center',
                  },
                ]}>
                {MESSAGE.HOME.MSG_HOME_TEXT_002}
              </Text>
            ) : null}
          </View>
        </View>
        <View style={{width: width, height: height * 0.1}}></View>
      </ScrollView>
    </SafeAreaView>
  );
};
export default withNavigationFocus(memo(DiscoverScreen));
