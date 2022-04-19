import React, { memo, useCallback, useEffect, useState } from 'react';
import {
  Dimensions,
  RefreshControl,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { PhotoIdentifier } from '@react-native-community/cameraroll';
import ImageGallery from './ImageGallery';
import { useGallary } from '../../../hooks/gallery';
import { IToast, TypeToash } from '../../../models/common';
import { useAppDispatch } from '../../../stories';
import { createAction } from '../../../stories/actions';
import { modal } from '../../../stories/types';
import Messages from '../../../config/Messages';
import { PHOTOP_TYPE_ACCEPT } from '../../../constants';
const { height, width } = Dimensions.get('screen');
interface Props {
  getListGallery: (
    lst: Array<{
      img: PhotoIdentifier;
      active: boolean;
      count: number | null;
      disabled: boolean;
    }>,
  ) => void;
  listFiles: Array<{
    img: PhotoIdentifier;
    active: boolean;
    count: number | null;
    disabled: boolean;
  }>;
  limitedCount: number;
  refreshPhotos: boolean;
  // fileNameCapture?: string;
}
const Gallery: React.FC<Props> = ({
  getListGallery,
  listFiles,
  limitedCount,
  refreshPhotos,
  // fileNameCapture,
}) => {
  const [photos, setPhotos] = React.useState<
    Array<{
      img: PhotoIdentifier;
      active: boolean;
      count: number | null;
      disabled: boolean;
    }>
  >();
  const [count, setCount] = React.useState<number>(10);
  const [refresh, setRefresh] = useState<boolean>(false);
  const dispatch = useAppDispatch();
  const { getPhotos } = useGallary();
  const photoTypeArray = ['jpeg', 'heic', 'png', 'jpg'];
  const FetchListImages = useCallback(async () => {
    await getPhotos(count)
      .then(response => {
        const result = response?.edges.filter((item: any, index) => {
          if (!item.node.image.filename) return false;

          return PHOTOP_TYPE_ACCEPT.find(type => item.node.image.filename.includes(type))
            ? true
            : false;
        })
          .map(item => ({
            img: item,
            active: false,
            count: null,
            disabled: false,
          }));
        setPhotos(result);
      })
      .catch(err => {
        //Error Loading Images
      })
      .finally(() => {
        setRefresh(false);
      });
  }, [count]);
  useEffect(() => {
    FetchListImages();
  }, [count, refreshPhotos]);

  // useEffect(() => {
  //   if (fileNameCapture) {
  //     _handleChooseImage(fileNameCapture);
  //   }
  // }, [fileNameCapture]);

  const _onRefresh = useCallback(() => {
    setCount(10);
    setRefresh(true);
    FetchListImages();
  }, []);

  const _handleChooseImage = useCallback(
    (filename: string, uri: string) => {
      if (photos) {
        let idx: number = -1;
        let arrIamge: {
          img: PhotoIdentifier;
          active: boolean;
          count: number | null;
          disabled: boolean;
        }[] = [];
        photos.map((item, ind) => {
          if (item.img.node.image.uri === uri) {
            idx = ind;
          }
          arrIamge.push(item);
        });

        const listFilesArr: {
          img: PhotoIdentifier;
          active: boolean;
          count: number | null;
          disabled: boolean;
        }[] = [];
        if (listFiles.length) {
          listFiles.map(item => {
            let itemUpdating: {
              img: PhotoIdentifier;
              active: boolean;
              count: number | null;
              disabled: boolean;
            };
            if (item.count == -1) {
              let idx = photos.findIndex(
                p => p.img.node.image.filename === item.img.node.image.filename,
              );
              if (idx !== -1) {
                itemUpdating = photos[idx];
              } else {
                itemUpdating = item;
              }
            } else {
              itemUpdating = item;
            }
            listFilesArr.push(itemUpdating);
          });
        }
        let index = listFilesArr.findIndex(
          img => img.img.node.image.uri === uri,
        );

        if (index === -1) {
          if (idx !== -1) {
            const { count, active, disabled, img } = arrIamge[idx];
            let lst: {
              img: PhotoIdentifier;
              active: boolean;
              count: number | null;
              disabled: boolean;
            }[] = [
                ...listFiles,
                {
                  img,
                  active,
                  count,
                  disabled,
                },
              ];
            if (listFiles.length < limitedCount) {
              // let idx = photos.findIndex(image => image.img.node.image.uri === uri);
              getListGallery(lst);
            } else {
              let payload: IToast = {
                isShow: true,
                title: Messages.COMMON.MSG_COMMON_TEXT_WARN,
                type: TypeToash.WARN,
                message: `${limitedCount}枚までしか送信できません`,
              };
              dispatch(createAction(modal.SET_TOASH, payload));
            }
          }
        } else {
          let lst = [...listFiles];
          lst.splice(index, 1);
          getListGallery(lst);
        }
      }
    },
    [photos, listFiles],
  );
  // useEffect(() => {
  //   if (removeImage) {
  //     _handleChooseImage(removeImage);
  //   }
  // }, [removeImage]);
  // useEffect(() => {
  //   getListGallery(listImages);
  // }, [listImages]);

  const _renderListPhotos = useCallback(() => {
    if (photos) {
      let arr: {
        img: PhotoIdentifier;
        active: boolean;
        count: number | null;
        disabled: boolean;
      }[] = [];
      // let idxUri = listFiles.findIndex(item => item.count == -1);
      // let idxCapture: number = -1;
      // if (idxUri !== -1) {
      //   idxCapture = photos.findIndex(
      //     photo =>
      //       photo.img.node.image.filename ===
      //       listFiles[idxUri].img.node.image.filename,
      //   );
      // }
      // arr = photos.map((itemArr, idx) => {
      // let idxA = listFiles.findIndex(
      //   item =>
      //     item.img.node.image.uri == itemArr.img.node.image.uri,
      // );

      // let itemUpdating: {
      //   img: PhotoIdentifier;
      //   active: boolean;
      //   count: number | null;
      //   disabled: boolean;
      // } = {
      //   img: itemArr.img,
      //   active: false,
      //   count: 0,
      //   disabled: itemArr.disabled,
      // };

      // if (idxA !== -1) {
      //   itemUpdating.active = true;
      //   itemUpdating.count = idxA + 1;
      // }
      // return itemUpdating;
      // });
      const listFilesArr: {
        img: PhotoIdentifier;
        active: boolean;
        count: number | null;
        disabled: boolean;
      }[] = [];
      if (listFiles.length) {
        listFiles.map(item => {
          let itemUpdating: {
            img: PhotoIdentifier;
            active: boolean;
            count: number | null;
            disabled: boolean;
          };
          if (item.count == -1) {
            let idx = photos.findIndex(
              p => p.img.node.image.filename === item.img.node.image.filename,
            );
            if (idx !== -1) {
              itemUpdating = photos[idx];
            } else {
              itemUpdating = item;
            }
          } else {
            itemUpdating = item;
          }
          listFilesArr.push(itemUpdating);
        });
      }
      arr = photos.map((p, i) => {
        let idxA = listFilesArr.findIndex(
          item =>
            // item.img.node.image.filename == p.img.node.image.filename &&
            item.img.node.image.uri == p.img.node.image.uri,
        );
        let itemUpdating: {
          img: PhotoIdentifier;
          active: boolean;
          count: number | null;
          disabled: boolean;
        } = {
          img: p.img,
          active: false,
          count: 0,
          disabled: p.disabled,
        };

        if (idxA !== -1) {
          itemUpdating.active = true;
          itemUpdating.count = idxA + 1;
        }
        return itemUpdating;
      });

      return arr.map((p, i) => (
        <ImageGallery item={p} key={i} handleChooseImage={_handleChooseImage} />
      ));
    }
    return null;
  }, [photos, listFiles]);

  return (
    <ScrollView
      refreshControl={
        <RefreshControl refreshing={refresh} onRefresh={_onRefresh} />
      }
      onScrollEndDrag={({ nativeEvent }) => {
        // if (
        //   nativeEvent.contentOffset.y +
        //     nativeEvent.layoutMeasurement.height +
        //     40 >=
        //   nativeEvent.contentSize.height
        // ) {

        // }
        setCount(count + 10);
      }}>
      <View style={styles.box}>{_renderListPhotos()}</View>
    </ScrollView>
  );
};
export default memo(Gallery);
const styles = StyleSheet.create({
  box: {
    display: 'flex',
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
});
