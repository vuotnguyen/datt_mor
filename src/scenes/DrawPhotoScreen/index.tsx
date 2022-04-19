import React, {useRef, useState} from 'react';
import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import MESSAGES_const from '../../config/Messages';
import {
  FontAwesome5,
  Ionicons,
  FontAwesome,
  Fontisto,
  MaterialCommunityIcons,
} from '../../assets/icons';
import {RouteProp, useNavigation, useRoute} from '@react-navigation/native';
import {MediaStackNavigationParams} from '../../navigations/Stacks/MediaStack';
import {
  deviceWidth,
  FIX_IPHONE_X_BOTTOM_SPACE,
  STATUS_BAR_HEIGHT,
} from '../../constants';
import * as Animatable from 'react-native-animatable';
import {TakePictureResponse} from 'react-native-camera';
import DrawCore from '../../components/common/DrawCore';
import {
  DrawCoreProps,
  DrawItemType,
  DrawLayerMode,
} from '../../models/drawTypes';
import LinearGradient from 'react-native-linear-gradient';
import { COLOR_CONSTANT } from "../../styles/colors";

export type DrawPhotoScreenParams = {
  imageData: TakePictureResponse;
};

type TRoute = RouteProp<MediaStackNavigationParams, 'DrawPhotoScreen'>;

const DrawPhotoScreen = (): JSX.Element => {
  const route = useRoute<TRoute>();
  const {
    params: {imageData},
  } = route;
  const navigation = useNavigation();
  const topPreviewRef = useRef<Animatable.View & View>(null);
  const footerPrevRef = useRef<Animatable.View & View>(null);
  const [showDrawTool, setShowDrawTool] = useState<DrawLayerMode>('show');
  const drawRef = useRef<DrawCoreProps>(null);
  const [drawingMode, setDrawingMode] = useState<DrawItemType>('pen');
  const [selectedItem, setSelectedItem] = useState(false);
  const imagePath = imageData.uri;

  console.log('imagePath', imagePath);

  if (!imagePath) {
    return <View />;
  }
  const onCancel = () => {
    navigation.goBack();
  };
  const onSubmit = () => {
    console.log('onSubmit');
  };
  const startDrawPress = () => {
    console.log('startDrawPress');
    topPreviewRef.current?.fadeOutRight?.(300);
    footerPrevRef.current
      ?.fadeOutDown?.(300)
      ?.then(() => setShowDrawTool('draw'));
  };
  const layerPress = () => {
    if (showDrawTool === 'hide') {
      return setShowDrawTool('show');
    }
    setShowDrawTool('hide');
  };
  const onDrawSubmit = () => {
    setShowDrawTool('show');
    topPreviewRef.current?.fadeInRight?.(300);
    footerPrevRef.current?.fadeInUp?.(300);
    setDrawingMode('pen');
  };

  return (
    <View style={styles.container}>
      <DrawCore
        ref={drawRef}
        showDrawTool={showDrawTool}
        drawingMode={drawingMode}
        image={{uri: imagePath}}
        linearGradient={LinearGradient}
        // onSelectionChange={setSelectedItem}
      />
      <Animatable.View style={styles.topRight} ref={topPreviewRef}>
        <TouchableOpacity onPress={startDrawPress}>
          <View style={styles.rightCircleButton}>
            <FontAwesome5 name={'pen'} size={17} style={{color: 'black'}} />
          </View>
        </TouchableOpacity>
        <View style={{height: 8}} />
        <TouchableOpacity onPress={layerPress}>
          <View style={styles.rightCircleButton}>
            <FontAwesome5
              name={'images'}
              size={17}
              style={{
                color:
                  showDrawTool === 'hide'
                    ? 'black'
                    : COLOR_CONSTANT.PRIMARY_COLOR,
              }}
            />
          </View>
        </TouchableOpacity>
      </Animatable.View>
      <Animatable.View style={styles.footerPrevContainer} ref={footerPrevRef}>
        <TouchableOpacity onPress={onCancel} style={styles.leftFooter}>
          <Text style={styles.text}>{MESSAGES_const.COMMON.BUTTON.CANCEL_002}</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={onSubmit} style={styles.rightFooter}>
          <Text style={styles.text}>OK</Text>
        </TouchableOpacity>
      </Animatable.View>
      {showDrawTool === 'draw' && (
        <Animatable.View style={styles.footerDrawContainer}>
          <TouchableOpacity
            onPress={() => {
              drawRef.current?.deleteSelectedItem();
            }}
            style={styles.drawOption}>
            <Ionicons
              name={'trash-outline'}
              size={25}
              style={{color: 'black'}}
            />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setDrawingMode('pen')}
            style={styles.drawOption}>
            <Ionicons
              name={'md-pencil-sharp'}
              size={25}
              style={{
                color:
                  drawingMode === 'pen'
                    ? COLOR_CONSTANT.PRIMARY_COLOR
                    : 'black',
              }}
            />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setDrawingMode('ellipse')}
            style={styles.drawOption}>
            <MaterialCommunityIcons
              name={'circle-outline'}
              size={25}
              style={{
                color:
                  drawingMode === 'ellipse'
                    ? COLOR_CONSTANT.PRIMARY_COLOR
                    : 'black',
              }}
            />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setDrawingMode('rectangle')}
            style={styles.drawOption}>
            <FontAwesome
              name={'square-o'}
              size={25}
              style={{
                color:
                  drawingMode === 'rectangle'
                    ? COLOR_CONSTANT.PRIMARY_COLOR
                    : 'black',
              }}
            />
          </TouchableOpacity>
          <TouchableOpacity style={styles.drawOption}>
            <Fontisto name={'smiley'} size={23} style={{color: 'black'}} />
          </TouchableOpacity>
          <TouchableOpacity onPress={onDrawSubmit} style={styles.drawOption}>
            <Ionicons
              name={'md-checkmark-sharp'}
              size={27}
              style={{color: 'black'}}
            />
          </TouchableOpacity>
        </Animatable.View>
      )}
    </View>
  );
};

export default DrawPhotoScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  topRight: {
    // @ts-ignore
    top: 20 + STATUS_BAR_HEIGHT,
    right: 12,
    position: 'absolute',
  },
  footerPrevContainer: {
    bottom: FIX_IPHONE_X_BOTTOM_SPACE,
    width: '100%',
    flexDirection: 'row',
    position: 'absolute',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 20,
  },
  leftFooter: {
    padding: 12,
    backgroundColor: 'rgba(52, 52, 52, 0.4)',
    borderRadius: 12,
  },
  rightFooter: {
    padding: 12,
    backgroundColor: 'rgba(52, 52, 52, 0.4)',
    borderRadius: 12,
  },
  text: {
    color: 'white',
    fontSize: 16,
  },
  rightCircleButton: {
    width: 40,
    height: 40,
    borderRadius: 40 / 2,
    backgroundColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  footerDrawContainer: {
    bottom: 0,
    position: 'absolute',
    width: '100%',
    backgroundColor: 'white',
    paddingTop: 12,
    flexDirection: 'row',
    paddingBottom: 12 + FIX_IPHONE_X_BOTTOM_SPACE,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  drawOption: {
    width: deviceWidth / 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
