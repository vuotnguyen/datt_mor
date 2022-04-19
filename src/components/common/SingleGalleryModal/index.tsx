import React, {memo, useEffect, useRef, useState} from 'react';
import {
  StyleSheet,
  Text,
  Modal,
  View,
  FlatList,
  Image,
  Animated,
  TouchableNativeFeedback,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import {PhotoIdentifier} from '@react-native-community/cameraroll';
import {useGallary} from '../../../hooks/gallery';
import {HStack} from 'native-base';
import {ButtonIcon} from '../../buttons';
import {Ionicons} from '../../../assets/icons';
import * as stylesGlobal from '../../../styles';
import {SafeAreaView} from 'react-native-safe-area-context';
import {PHOTOP_TYPE_ACCEPT} from '../../../constants';
import {get} from 'lodash';
type Props = {
  isShow: boolean;
  handleClose: () => void;
  getGallery: (img: PhotoIdentifier) => void;
};

const SingleGalleryModal: React.FC<Props> = ({
  isShow,
  handleClose,
  getGallery,
}) => {
  const [count, setCount] = React.useState<number>(100);
  const [photos, setPhotos] = React.useState<Array<PhotoIdentifier>>([]);
  const {getPhotos} = useGallary();
  
  const FetchListImages = React.useCallback(async () => {
    await getPhotos(count)
      .then(response => {
        if (response && response?.edges) {
          const result = response?.edges.filter((item: any, index) => {
            if(!item.node.image.filename) return false;

            return PHOTOP_TYPE_ACCEPT.find(type => item.node.image.filename.includes(type))
              ? true
              : false;
          });
          setPhotos(result);
        }
      })
      .catch(err => {
        //Error Loading Images
        console.log(err, 'error loading images??');
      })
      .finally(() => {});
  }, [count]);
  useEffect(() => {
    FetchListImages();
  }, [count]);

  return (
    <Modal
      animationType={'slide'}
      visible={isShow}
      onRequestClose={handleClose}>
      <SafeAreaView style={{flex: 1}}>
        <HStack
          alignItems={'center'}
          justifyContent={'space-between'}
          style={{marginBottom: 0, backgroundColor: '#fff'}}>
          <View>
            <ButtonIcon onPress={handleClose}>
              <View style={{paddingHorizontal: 5, paddingVertical: 5}}>
                <Ionicons size={25} name="ios-chevron-back" />
              </View>
            </ButtonIcon>
          </View>
          <View style={{justifyContent: 'center'}}>
            <Text style={stylesGlobal.text.subTitle}>写真を選択</Text>
          </View>
          <View style={{padding: 5, opacity: 0}}>
            <Ionicons size={25} name="ios-chevron-back" />
          </View>
        </HStack>
        <View style={{paddingHorizontal: 1.5, marginTop: 3}}>
          <FlatList
            data={photos}
            showsHorizontalScrollIndicator={false}
            showsVerticalScrollIndicator={false}
            numColumns={3}
            onEndReached={() => setCount(count + 20)}
            overScrollMode={'never'}
            ListFooterComponent={() => (
              <View style={{height: 50, width: 100}}></View>
            )}
            columnWrapperStyle={{
              width: '100%',
              flexDirection: 'row',
            }}
            keyExtractor={(item, index) => `galleryImage${index}`}
            renderItem={({item}) => (
              <View
                style={{flex: 1 / 3, marginBottom: 3, marginHorizontal: 1.5}}>
                <TouchableOpacity
                  onPress={() => {
                    console.log('get');

                    getGallery(item);
                    handleClose();
                  }}>
                  <ImageView uri={item.node.image.uri} />
                </TouchableOpacity>
              </View>
            )}
          />
        </View>
      </SafeAreaView>
    </Modal>
  );
};
const ImageView: React.FC<{uri: string}> = memo(({uri}) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const startLoading = () => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  };
  const closeLoading = () => {
    Animated.timing(fadeAnim, {
      toValue: 0,
      useNativeDriver: true,
    }).start();
  };
  return (
    <View
      style={{
        position: 'relative',
        backgroundColor: 'rgba(230,230,230,0.5)',
        flex: 1,
      }}>
      <Image
        resizeMode={'cover'}
        source={{uri: uri}}
        style={{width: '100%', height: 100}}
        onLoadStart={startLoading}
        onLoad={closeLoading}
      />
      <Animated.View
        style={[
          {
            position: 'absolute',
            top: 1,
            left: 1,
            right: 1,
            bottom: 1,
            zIndex: 10,
            opacity: fadeAnim,
            flex: 1,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
          },
        ]}>
        <ActivityIndicator size={'small'} color="rgba(0,0,0,0.6)" />
      </Animated.View>
    </View>
  );
});
export default memo(SingleGalleryModal);
const styles = StyleSheet.create({});