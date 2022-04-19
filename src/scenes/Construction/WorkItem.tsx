import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  Dimensions,
  Image,
  ScrollView,
  Animated,
} from 'react-native';
import FastImage from 'react-native-fast-image';
import { FlatList } from 'react-native-gesture-handler';
import LinearGradient from 'react-native-linear-gradient';
import { Ionicons } from '../../assets/icons';
import { getWorkItems } from '../../services/construction';
import * as stylesGlobal from '../../styles';
import SkeletonPlaceholder from "./AnimationShimer";
import ImageConstruction from './ImageConstruction';

const { width } = Dimensions.get('screen');
const IMAGE_SIZE = (width - 10) / 4;
const image = [0, 1, 2, 3]
const AnimationFastImage = Animated.createAnimatedComponent(FastImage)

export default props => {

  const [showItem, setShowItem] = useState(true);
  const [workItemData, setWorkItemData] = useState(null);
  const [showShimmer, setShowShimmer] = useState(true)

  const fadeAnim = useRef(new Animated.Value(0)).current

  const show = () => {
    Animated.timing(
      fadeAnim,
      {
        toValue: 1,
        duration: 2000,
        useNativeDriver: true
      }
    ).start();
  }

  const toggleItem = () => {
    setShowItem(!showItem);
  };
  useEffect(() => {
    fetchWorkItemImage();
  }, []);
  const fetchWorkItemImage = async () => {
    setShowShimmer(true)
    await getWorkItems(props.constructionId, true, props.work_item_id)
      .then(res => {
        setWorkItemData(res?.data);
      })
      .catch(error => console.log(error));
    setShowShimmer(false)
  };

  const listData = workItemData?.data ?? [];
  const numColumns = Math.ceil(listData.length / 2);
  const check = listData.length % 2 == 0;
  // console.log('=======>>>}}', listData);

  const showImage = () => {

    if (listData.length == 0 && showShimmer == true) {
      return (
        <SkeletonPlaceholder>

          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 4 }}>
            {image.map((index) =>

              <LinearGradient
                key={index}
                colors={['#ffffff', '#a49f9f', '#989494']}
                locations={[0, 1, 1]}
                style={{
                  width: IMAGE_SIZE,
                  height: IMAGE_SIZE,
                  marginHorizontal: 2,
                  borderRadius: 6,
                  marginBottom: 4
                }} />
            )}
          </View>
        </SkeletonPlaceholder>
      )
    }

    else if (listData.length && showShimmer == false) {
      return (
        <ScrollView
          style={{ marginBottom: 2 }}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{
            justifyContent: 'center',
          }}>
          <View>
            <View
              style={{ flexDirection: 'row', flexWrap: 'wrap', marginTop: 2 }}>
              {/* {listData.map(({ d, index }: any) => { */}
              {listData.map(({ d, index }: any) => {
                if (
                  check
                    ? index < listData.length / 2
                    : index <= listData.length / 2
                ) {
                  return (
                    <ImageConstruction key = {index} show={show} fadeAnim={fadeAnim} item={d} />
                  );
                } else return null;
              })}
            </View>
            <View
              style={{ flexDirection: 'row', flexWrap: 'wrap', marginTop: 2 }}>
              {listData.map((d: any, i: any) => {
                if (
                  check ? i >= listData.length / 2 : i > listData.length / 2
                ) {
                  return (
                    <ImageConstruction key = {i} show={show} fadeAnim={fadeAnim} item={d} />
                  );
                }
              })}
            </View>
          </View>
        </ScrollView>
      )
    } else if (listData.length == 0 && showShimmer == false) {
      return (
        <Text style={styles.noImageText}>アップロードされていない</Text>
      )
    }
  }
  return (
    <>
      <Pressable onPress={toggleItem} style={[styles.workItem, { marginBottom: showItem == true ? 0 : 4 }]}>
        <Ionicons
          name={showItem ? 'chevron-down' : 'chevron-forward'}
          size={18}
          color="#000"
        />
        <Text style={styles.workItemLabel}>{props.work_item_name}</Text>
      </Pressable>
      {showItem ?
        showImage()
        :
        null
      }
    </>
  );
};
const styles = StyleSheet.create({
  workItem: {
    flexDirection: 'row',
    backgroundColor: '#E0E7EC',
    height: 32,
    alignItems: 'center',

    paddingHorizontal: 6,
  },
  workItemLabel: {
    color: '#000000',
    marginLeft: 4,
    fontSize: 16,
    fontWeight: '300',
  },
  images: {
    width: IMAGE_SIZE,
    height: IMAGE_SIZE,
    marginHorizontal: 2,
    borderRadius: 6,
    marginBottom: 2
  },
  noImageText: { textAlign: 'center', marginTop: 20, marginBottom: 16 },
});

