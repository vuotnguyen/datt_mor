import React, {Component} from 'react';
import {
  StyleSheet,
  Text,
  View,
  Animated,
  StyleProp,
  StyleSheetProperties,
  ImageProps,
  ImagePropsBase,
} from 'react-native';
import {NoImage} from '../../../assets/images/other';
interface Props {
  uri: string;
  style?: StyleProp<any>;
}
const ProgessiveImage: React.FC<Props> = props => {
  const defaultImageAnimated = new Animated.Value(0);
  const imageAnimated = new Animated.Value(0);
  const handleDefaultImageLoad = () => {
    Animated.timing(defaultImageAnimated, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  };

  const handleImageLoad = () => {
    Animated.timing(imageAnimated, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  };
  const {uri, style} = props;
  return (
    <View>
      <Animated.Image
        source={NoImage}
        style={[{width: 270, height: 300}, {opacity: defaultImageAnimated}]}
        onLoad={handleDefaultImageLoad}
        blurRadius={1}
      />
      <Animated.Image
        source={{uri: uri}}
        style={[
          {width: 270, height: 300},
          {opacity: imageAnimated},
          styles.imageOverlay,
        ]}
        onLoad={handleImageLoad}
        blurRadius={1}
      />
    </View>
  );
};
export default ProgessiveImage;

// export default class ProgessiveImage extends Component<Props> {
//   defaultImageAnimated = new Animated.Value(0);
//   imageAnimated = new Animated.Value(0);
//   handleDefaultImageLoad = () => {
//     Animated.timing(this.defaultImageAnimated, {
//       toValue: 1,
//       useNativeDriver: true,
//     }).start();
//   };

//   handleImageLoad = () => {
//     Animated.timing(this.imageAnimated, {
//       toValue: 1,
//       useNativeDriver: true,
//     }).start();
//   };

//   render() {
//     const {defaultImageSource, source, style, ...props} = this.props;
//     return (
//       <View>
//         <Animated.Image
//           {...props}
//           source={defaultImageSource}
//           style={[style, {opacity: this.defaultImageAnimated}]}
//           onLoad={this.handleDefaultImageLoad}
//           blurRadius={1}
//         />
//         <Animated.Image
//           {...props}
//           source={{uri: source}}
//           style={[style, {opacity: this.imageAnimated}, styles.imageOverlay]}
//           onLoad={this.handleImageLoad}
//           blurRadius={1}
//         />
//       </View>
//     );
//   }
// }

const styles = StyleSheet.create({
  imageOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
  },
});
