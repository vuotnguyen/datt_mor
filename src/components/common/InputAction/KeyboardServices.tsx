import React, {memo, useCallback, useRef} from 'react';
import {
  Dimensions,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  FlatList,
  Pressable,
  ScrollView,
} from 'react-native';
import {AntDesign} from '../../../assets/icons';
import GalleryModal from '../../organisms/Gallery';
import {PhotoIdentifier} from '@react-native-community/cameraroll';
import {apiUploadImage, CATEGORY_TYPE} from '../../../services/image';
import * as Modals from '../../../stories/types/modal';
import {IImage} from '../../../models/image';
import {AxiosResponse} from 'axios';
import {ImagePickerResponse} from 'react-native-image-picker';
import EmojiSelector, {Categories} from 'react-native-emoji-selector';
import EmojiBoard from '../../organisms/EmojiBoard';
import ExtendsOption from '../../organisms/ExtendOptions';
import {Octicons, FontAwesome5} from '../../../assets/icons';
import {useDocument, TemplateFileDocument} from '../../../hooks/file';
import {ToastConsumer, useToast} from '../../organisms/Toast';
import {useInputContext} from './hooks';
import {DocumentPickerResponse} from 'react-native-document-picker';
const {height} = Dimensions.get('screen');
const defaultText = 'Aa';
const limitedCount = 50;

export enum KeyboardComponentType {
  GallaryKB = 'GallaryKB',
  EmojiKB = 'EmojiKB',
  MORE_KB = 'MORE_KB',
}
export type ITypeInput = 'individual' | 'group';
const KeyboardServices: React.FC<{
  setFiles: React.Dispatch<
    React.SetStateAction<
      {
        img: PhotoIdentifier;
        active: boolean;
        count: number | null;
        disabled: boolean;
      }[]
    >
  >;
  files: {
    img: PhotoIdentifier;
    active: boolean;
    count: number | null;
    disabled: boolean;
  }[];
  refreshGallery: boolean;
  text: string;
  keyBoardComponent: KeyboardComponentType | null;
  onChageText: (text: string) => void;
  typeInput?: ITypeInput;
}> = memo(
  ({
    files,
    setFiles,
    refreshGallery,
    text,
    onChageText,
    keyBoardComponent,
    typeInput = 'individual',
  }) => {
    const refFlatList = useRef<FlatList>(null);
    const InputContext = useInputContext();
    if (!InputContext) return null;
    const {attachFiles} = InputContext;
    /**
     * handle remove image selected
     */
    const _removeImage = useCallback(
      (uri: string) => {
        let index = files.findIndex(item => item.img.node.image.uri === uri);
        if (index !== -1) {
          let lst = [...files];
          lst.splice(index, 1);
          setFiles(lst);
        }
      },
      [files],
    );
    return (
      <ToastConsumer>
        <React.Fragment>
          <View style={{paddingVertical: 1}}>
            <FlatList
              ref={refFlatList}
              data={files}
              keyExtractor={(item, index) => 'image_selected_' + index}
              horizontal
              onContentSizeChange={() => {
                if (refFlatList) {
                  refFlatList.current?.scrollToEnd();
                }
              }}
              renderItem={({item}) => (
                <View
                  style={[
                    styles.ImagePickerDiv,
                    {
                      height: 70,
                      flex: 1,
                      alignItems: 'center',
                      flexDirection: 'row',
                      justifyContent: 'center',
                    },
                  ]}>
                  <Image
                    style={{
                      width: 70,
                      height: 60,
                      marginHorizontal: 5,
                    }}
                    borderRadius={5}
                    source={{uri: String(item.img.node.image.uri)}}
                  />
                  <Pressable
                    style={styles.deleteDot}
                    onPress={() => {
                      _removeImage(String(item.img.node.image.uri));
                    }}>
                    <AntDesign name={'close'} size={10} color={'#fff'} />
                  </Pressable>
                </View>
              )}
            />
            <FlatList
              ref={refFlatList}
              data={attachFiles}
              keyExtractor={(item, index) => 'image_selected_' + index}
              horizontal
              onContentSizeChange={() => {
                if (refFlatList) {
                  refFlatList.current?.scrollToEnd();
                }
              }}
              renderItem={({item}: {item: DocumentPickerResponse}) => (
                <Text>
                  {item.name} size {item.size}
                </Text>
              )}
            />
          </View>
          <View
            style={[
              styles.wrapperKeyboardBottom,
              {
                paddingVertical: keyBoardComponent ? 4 : 0,
              },
            ]}>
            {/* {renderKeyBoardType(keyBoardComponent)} */}
            <View
              style={[
                styles.wrapperKeyboardBottom,
                {
                  height:
                    keyBoardComponent &&
                    keyBoardComponent == KeyboardComponentType.EmojiKB
                      ? height / 3
                      : 0,
                },
              ]}>
              <EmojiBoard text={text} selectEmoji={onChageText} />
            </View>
            <View style={styles.wrapperKeyboardBottom}>
              {keyBoardComponent == KeyboardComponentType.GallaryKB ? (
                <View style={{height: height / 3}}>
                  <GalleryModal
                    getListGallery={setFiles}
                    listFiles={files}
                    limitedCount={limitedCount}
                    refreshPhotos={refreshGallery}
                  />
                </View>
              ) : null}
              {keyBoardComponent == KeyboardComponentType.MORE_KB ? (
                <View
                  style={{
                    maxHeight: height / 3,
                  }}>
                  <ExtendsOption typeInput={typeInput} />
                </View>
              ) : null}
            </View>
          </View>
        </React.Fragment>
      </ToastConsumer>
    );
  },
);

export default KeyboardServices;
const styles = StyleSheet.create({
  container: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowOpacity: 0,

    elevation: 0,
  },
  groupActions: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'flex-end',
    // paddingVertical: 5,
    paddingTop: 0,
    backgroundColor: '#fff',
  },
  btnAttach: {
    // backgroundColor: 'blue',
    height: 35,
    width: 35,
    borderRadius: 35 / 2,
  },
  input: {
    backgroundColor: 'rgba(229,229,229,0.5)',
    paddingHorizontal: 10,
    borderRadius: 20,
    flex: 1,
    // flexWrap: 'wrap',
    fontSize: 13,
  },
  ImagePickerDiv: {
    position: 'relative',
    margin: 2,
    paddingVertical: 4,
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
    transform: [{translateY: -5}],
    // borderColor: '#fff',
    // borderWidth: 1,
    flex: 1,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  btnSend: {
    backgroundColor: 'blue',
    height: 35,
    width: 35,
    borderRadius: 35 / 2,
  },
  centerAlign: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  wrapperKeyboardBottom: {
    position: 'relative',
    zIndex: 55,
    backgroundColor: '#fff',
  },
});
