import React, {memo} from 'react';
import {
  StyleSheet,
  Text,
  View,
  Image,
  ImageStyle,
  ImageProps,
  ViewStyle,
} from 'react-native';
import {ActivityIndicator} from 'react-native-paper';
import {iconUser} from '../../../assets/images/users';
import {useS3} from '../../../hooks/aws';
import {colors} from '../../../styles';
const {getSignedUrl} = useS3();
type Props = {
  uri: string | null;
  size: number;
  style?: ImageStyle;
  sizeIconLoad?: number;
  bgLoading?: string;
  styleWrapper?: ViewStyle;
  showIconload?: boolean;
};
const AvatarRes: React.FC<Props> = ({
  uri,
  style,
  size,
  bgLoading,
  sizeIconLoad,
  styleWrapper,
  showIconload,
}) => {
  const [isloaded, setLoaded] = React.useState<boolean>(false);
  const radius = (size * 2) / 2;
  let uriImage = React.useMemo(() => {
    if (uri?.includes('file') || uri?.includes('ph')) {
      return uri;
    }
    return uri
      ? {uri: getSignedUrl(uri.replace('/images/', '/thumbnails/'))}
      : iconUser;
  }, [uri]);
  let showIcon = React.useMemo(() => {
    return showIconload ?? true;
  }, [showIconload]);

  return (
    <View
      style={[
        {
          position: 'relative',
          height: size,
          width: size,
          backgroundColor: bgLoading ?? colors.LOADING,
          borderRadius: radius,
        },
        styleWrapper,
      ]}>
      {uri?.includes('file') || uri?.includes('ph') ? (
        <Image
          source={{uri: uriImage}}
          style={style}
          height={size}
          width={size}
          resizeMethod={'resize'}
          resizeMode={'cover'}
          borderRadius={radius}
          onLoad={() => setLoaded(true)}
        />
      ) : (
        <Image
          source={uriImage}
          style={style}
          height={size}
          width={size}
          resizeMethod={'resize'}
          resizeMode={'cover'}
          borderRadius={radius}
          onLoad={() => setLoaded(true)}
        />
      )}

      {!isloaded && showIcon ? (
        <View style={[styles.wapperLoading]}>
          <ActivityIndicator
            size={sizeIconLoad ?? (size > 40 ? 'small' : 16)}
            color="rgba(0,0,0,0.3)"
          />
        </View>
      ) : null}
    </View>
  );
};
export default memo(AvatarRes);
const styles = StyleSheet.create({
  wapperLoading: {
    position: 'absolute',
    // backgroundColor: colors.LOADING,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    paddingVertical: 5,
  },
});
