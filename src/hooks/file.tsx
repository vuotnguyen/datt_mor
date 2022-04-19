import * as React from 'react';
import FileViewer from 'react-native-file-viewer';
import DocumentPicker, {
  DocumentPickerResponse,
} from 'react-native-document-picker';
import {
  Alert,
  PermissionsAndroid,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Snackbar } from 'react-native-paper';
import { useToast } from '../components/organisms/Toast';
import Messages from '../config/Messages';
import RNFS, {
  DownloadFileOptions,
  DownloadProgressCallbackResult,
} from 'react-native-fs';
import { AntDesign, FontAwesome5 } from '../assets/icons';

const TYPE_SUPPORT = [
  // DocumentPicker.types.doc,
  // DocumentPicker.types.docx,
  // DocumentPicker.types.csv,
  // DocumentPicker.types.pdf,
  // DocumentPicker.types.plainText,
  // DocumentPicker.types.ppt,
  // DocumentPicker.types.pptx,
  // DocumentPicker.types.xls,
  // DocumentPicker.types.xlsx,
  // DocumentPicker.types.zip,
  DocumentPicker.types.allFiles,
];
interface IPickFunc {
  onSuccess?: (data?: DocumentPickerResponse) => void;
  onCancel?: (error?: any) => void;
  onError?: (error?: any) => void;
}
interface ILocalFileViewer {
  uriFile: string;
  onSuccess?: () => void;
  onNotFound?: (error?: any) => void;
}
export const useDocument = () => {
  const pickDocumentFile = async ({
    onSuccess = () => undefined,
    onCancel = () => undefined,
    onError = () => undefined,
  }: IPickFunc) => {
    try {
      const res = await DocumentPicker.pick({
        type: TYPE_SUPPORT,
      });
      onSuccess(res);
    } catch (err: any) {
      if (DocumentPicker.isCancel(err)) {
        // User cancelled the picker, exit any dialogs or menus and move on
        onCancel(err);
      } else {
        onError(err);
        throw err;
      }
    }
  };
  const openAppViewFileLocal = ({
    uriFile,
    onSuccess = () => undefined,
    onNotFound = () => undefined,
  }: ILocalFileViewer) => {
    let uri = uriFile;
    if (Platform.OS === 'ios') {
      // Remove 'file://' from file path for FileViewer
      uri = uriFile.replace('file://', '');
    }
    FileViewer.open(uri)
      .then(() => {
        // Do whatever you want
        onSuccess();
      })
      .catch(_err => {
        // Do whatever you want
        onNotFound();
        console.log(_err);
      });
  };
  const ViewerFile = (url: string) => {
    FileViewer.open(url).catch(err =>
      Alert.alert(
        '',
        // 'Not found your apps support this file, please try again!',
        'このファイルをサポートするアプリが見つかりませんでした。もう一度やり直してください。',
        [
          {
            text: Messages.COMMON.BUTTON.CONFIRM,
          },
        ],
      ),
    );
  };
  const downloadAndOpenFile = async ({
    path,
    nameFile,
    onBeginDownload = () => undefined,
    onNotFound = () => undefined,
    onSuccess = () => undefined,
    onProgress = () => undefined,
    onFinally = () => undefined,
  }: {
    path: string;
    nameFile: string;
    onBeginDownload?: () => void;
    onSuccess?: () => void;
    onNotFound?: (error?: any) => void;
    onProgress?: (res: DownloadProgressCallbackResult) => void;
    onFinally?: () => void;
  }) => {
    const localFile = `${RNFS.DownloadDirectoryPath}/${nameFile}`;
    const Read = () => {
      RNFS.read(localFile)
        .then(res => {
          ViewerFile(localFile);
        })
        .catch(err => {
          onBeginDownload();
          const options: DownloadFileOptions = {
            fromUrl: path,
            progressDivider: 10,
            progressInterval: 500,
            toFile: localFile,
            progress: onProgress,
          };
          RNFS.downloadFile(options)
            .promise.then(() => ViewerFile(localFile))
            .then(() => {
              // success
              console.log('success');

              onSuccess();
            })
            .catch(error => {
              // error
              onNotFound();
              console.log('error', error);
            })
            .finally(onFinally);
        });
    }
    if (Platform.OS === 'android') {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
        {
          // title: 'To open file with local apps',
          title: 'ローカルアプリでファイルを開くには',
          // message: 'We need your permission',
          message: 'あなたの許可が必要です',
          // no
          buttonNegative: Messages.COMMON.BUTTON.CANCEL,
          // yes
          buttonPositive: Messages.COMMON.BUTTON.CONFIRM,
        },
      );
      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        Read();
      } else {
        console.log('Camera permission denied');
      }
    }
    if (Platform.OS === 'ios') {
      Read();
    }

  };

  return { pickDocumentFile, openAppViewFileLocal, downloadAndOpenFile };
};
export const TemplateFileDocument = ({
  file,
  onDeleted = () => undefined,
  disabledDeleteMode = false,
  disabledOpenFile = false,
}: {
  file?: DocumentPickerResponse;
  onDeleted?: () => void;
  disabledDeleteMode?: boolean;
  disabledOpenFile?: boolean;
}) => {
  if (!file) return null;

  const toastContext = useToast();
  if (!toastContext) return null;

  const { openAppViewFileLocal } = useDocument();
  const handleOpenFile = () => {
    openAppViewFileLocal({
      uriFile: file.uri,
      onNotFound: () => toastContext.setVisible(true),
    });
  };
  return (
    <>
      <Pressable
        style={({ pressed }) => [
          styles.ImagePickerDiv,
          { opacity: pressed ? 0.7 : 1 },
        ]}
        onPress={disabledOpenFile ? () => undefined : handleOpenFile}>
        <View>
          <FontAwesome5 name={'file'} size={30} color={'#000'} />
          <Text numberOfLines={1}>{file.name}</Text>
        </View>
        {!disabledDeleteMode ? (
          <Pressable style={styles.deleteDot} onPress={onDeleted}>
            <AntDesign name={'close'} size={10} color={'#fff'} />
          </Pressable>
        ) : null}
      </Pressable>
    </>
  );
};
const styles = StyleSheet.create({
  ImagePickerDiv: {
    position: 'relative',
    margin: 2,
    paddingVertical: 4,
    height: 70,
    flex: 1,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  deleteDot: {
    position: 'absolute',
    top: 4,
    right: 1,
    // height: 25,
    // width: 25,
    paddingVertical: 4,
    paddingHorizontal: 4,
    backgroundColor: 'rgba(0,0,0,1)',
    borderRadius: 20 / 2,
    transform: [{ translateY: -5 }],
    // borderColor: '#fff',
    // borderWidth: 1,
    flex: 1,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
});
