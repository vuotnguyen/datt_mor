import React from 'react';
import {
  ActivityIndicator,
  Dimensions,
  Pressable,
  StyleProp,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native';
import {moderateScale} from 'react-native-size-matters';
import {
  FileLocal,
  IMessageGroupChatReceiver,
  IMessageReceiver,
} from '../../../models/chat';
import {Ionicons} from '../../../assets/icons';
import {Box, HStack} from 'native-base';
import textStyle from '../../../styles/text';
import {useAppSelector} from '../../../stories';
import {get, round} from 'lodash';
import {useDocument} from '../../../hooks/file';
import {useS3} from '../../../hooks/aws';
import {PopoverMessage} from '.';
import {DownloadProgressCallbackResult} from 'react-native-fs';

const screen = Dimensions.get('screen');
const FileChatComponent = ({
  file,
  width = screen.width * 0.7 - 4,
  isLocal = false,
  messageItem,
  mine = false,
}: {
  file: FileLocal;
  width?: number;
  isLocal?: boolean;
  messageItem: IMessageReceiver | IMessageGroupChatReceiver;
  mine?: boolean;
}) => {
  const {downloadAndOpenFile, openAppViewFileLocal} = useDocument();
  const {getSignedUrl} = useS3();
  const {file_name = '', size = 0, uri = ''} = file;
  const convertSize = (sizeKB: number) => {
    return `${round(sizeKB * 0.000001, 2)}MB`;
  };
  const [isProgress, setProgress] = React.useState<boolean>(false);
  const [
    fileState,
    setFileState,
  ] = React.useState<DownloadProgressCallbackResult>({
    bytesWritten: 0,
    contentLength: 0,
    jobId: 0,
  });
  const isConnectNetwork = useAppSelector(
    state => state.dataCache.networkStatusConnect,
  );
  const progressVal = React.useMemo(() => {
    let current = get(fileState, 'bytesWritten', 0);
    let total = get(fileState, 'contentLength', 0);
    let percent = round((current / total) * 100, 2);
    return `${isNaN(percent) ? 0 : percent}%`;
  }, [fileState]);

  const onProgress = (res: DownloadProgressCallbackResult) => {
    setFileState(res);
  };

  const onFinally = () => {
    setProgress(false);
  };
  const handleOpen = () => {
    if (isLocal) {
      openAppViewFileLocal({uriFile: uri});
      return;
    }
    if (uri) {
      const path = getSignedUrl(uri);
      downloadAndOpenFile({
        path,
        nameFile: file_name,
        onProgress,
        onFinally,
        onBeginDownload: () => setProgress(true),
      });
    }
  };
  const handleStyleOverLoad = (): StyleProp<ViewStyle> => {
    if (isLocal) {
      return {
        backgroundColor: isConnectNetwork
          ? 'rgba(230,230,230,0.5)'
          : 'rgba(230,230,230,0.6)',
      };
    }
    // loading
    if (isProgress) {
      return {
        backgroundColor: 'rgba(230,230,230,0.7)',
        // opacity: 0.7,
      };
    }
    return {};
  };

  const OverLoad = () => {
    if (isLocal) {
      return isConnectNetwork ? (
        <ActivityIndicator size={'small'} color="rgba(0,0,0,0.6)" />
      ) : (
        <Ionicons
          name={'information-circle-outline'}
          size={25}
          style={{color: 'rgba(0,0,0,0.6)'}}
        />
      );
    }
    if (isProgress) {
      return (
        <HStack
          style={{
            backgroundColor: '#fff',
            width: '80%',
            borderRadius: 4,
            overflow: 'hidden',
          }}>
          <View
            style={{
              position: 'absolute',
              right: 0,
              left: 0,
              backgroundColor: '#67E753',
              width: progressVal,
              height: '100%',
            }}
          />
          <Text
            style={{
              width: '100%',
              textAlign: 'center',
              fontSize: 10,
            }}>
            {progressVal}
          </Text>
        </HStack>
      );
    }
    return null;
  };

  return (
    <PopoverMessage
      messageItem={messageItem}
      fileName={file_name}
      onPress={handleOpen}
      mine={mine}>
      <View style={[styles.container, {width}]}>
        <View style={[styles.loadingBox, handleStyleOverLoad()]}>
          <OverLoad />
        </View>
        <HStack justifyContent={'space-between'} alignItems={'flex-start'}>
          <View style={styles.boxIconFile}>
            <Ionicons
              name="document-text"
              size={40}
              style={{
                color: 'rgba(0,0,0,0.6)',
                fontWeight: 'bold',
              }}
            />
          </View>
          <Box flex={1} style={styles.boxContent}>
            <Text style={[textStyle.subTitle, {flex: 1, flexShrink: 0}]}>
              {file_name}
            </Text>
            <Text
              style={[
                textStyle.text,
                {textAlign: 'right', fontSize: 12, marginTop: 5},
              ]}>
              Size: {convertSize(size)}
            </Text>
          </Box>
        </HStack>
      </View>
    </PopoverMessage>
  );
};

export default FileChatComponent;
const styles = StyleSheet.create({
  container: {
    borderColor: 'rgba(230,230,230,1)',
    borderWidth: 0.5,
    backgroundColor: 'rgba(230,230,230,0.4)',
    minHeight: 70,
    borderRadius: 10,
    padding: 10,
    position: 'relative',
    overflow: 'hidden',
  },
  boxIconFile: {
    padding: 5,
    borderColor: 'rgba(0,0,0,0.5)',
    borderWidth: 0.5,
    borderRadius: 15,
    backgroundColor: '#fff',
  },
  loadingBox: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 10,
    display: 'flex',
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  boxContent: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    marginLeft: 5,
  },
});
