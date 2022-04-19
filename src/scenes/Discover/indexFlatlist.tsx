import React, {useCallback, useEffect, useRef, useState} from 'react';
import {
  Dimensions,
  FlatList,
  Pressable,
  RefreshControl,
  Text,
  View,
} from 'react-native';
import * as globalStyles from '../../styles';
import {SafeAreaView} from 'react-native-safe-area-context';
import Slider from '../../components/organisms/Slider';
import {createAction, ImageAction} from '../../stories/actions';
import {useAppDispatch, useAppSelector} from '../../stories';
import {useDispatch} from 'react-redux';
import {image, modal} from '../../stories/types';
import MESSAGE from '../../config/Messages';
import SLiderLoading from '../../components/organisms/SliderItem/LoadingSilderItem';
import ImageResView from '../../components/organisms/ImageResView/ImageMasonry';
import LoadingMansoryV2 from '../../components/organisms/MasonryList/LoadingMansoryV2';

import {connectDB} from '../../database';
import {ImageDateBeforeSchemaType} from '../../database/modules/DiscoverScreen/ImageSchema';
import {ImageSchemaOp} from '../../database/modules/DiscoverScreen';

import {
  getListImageBeforePagingDate,
  getListImageCurrentPagingDate,
} from '../../services/image';
import {File, LastEvaluatedKeyImage} from '../../models/chat';
import {ImageDateCurrentSchemaType} from '../../database/modules/DiscoverScreen/ImageCurrentDate';
import {GetAllUserInfo} from '../../stories/actions/infoallUser';
// @ts-ignore
import {useFocusEffect, useScrollToTop} from '@react-navigation/native';

const {width, height} = Dimensions.get('screen');

const DiscoverScreen = (): JSX.Element => {
  const dispatchThunk = useDispatch();
  const dispatchLocal = useAppDispatch();

  const [count, setCount] = useState<number>(1);
  const [loadingSlider, setLoadingSlider] = useState<boolean>(false);
  const [loadingMansory, setLoadingMansory] = useState<boolean>(false);
  const [refresh, setRefresh] = useState<boolean>(false);

  const FlatlistRef = useRef<FlatList | any>();
  useScrollToTop(FlatlistRef);

  useFocusEffect(
    useCallback(() => {
      FetchData();
    }, []),
  );
  const {ImageCurrentDay, ImageDayBefore} = useAppSelector(
    state => state.dataImage,
  );
  const FetchData = useCallback(() => {
    setCount(1);
    // const success = () => { };
    // const fail = () => { };
    setLoadingSlider(true);
    setLoadingMansory(true);
    dispatchThunk(
      GetAllUserInfo(
        () => {},
        () => {},
        () => {},
      ),
    );
    getDataImageCurrentDateFromRealm();
    getDataImageBeforeDateFromRealm();
    // setTimeout(() => {
    //   console.log("call")
    //   const AvatarTmp: Avatar = {
    //     id: '',
    //     path_file_thumb: '',
    //     create_at: '',
    //     file_name: '',
    //     path_file: '',
    //   };
    //   ImageDayBefore.listAll.map(m => {
    //     m.user.avatar = AvatarTmp;
    //   })
    // }, 20000);
    // dispatchThunk(
    //   ImageAction.GetListImageCurrentDate(success, fail, () => {
    //     setLoadingSlider(false);
    //     console.log('FetchData ');
    //   }),
    // );
    // dispatchThunk(
    //   ImageAction.GetListImageDayBefore(success, fail, () => {
    //     setLoadingMansory(false);
    //     console.log('FetchData ');
    //   }),
    // );
    setRefresh(false);
  }, []);

  const getDataImageCurrentDateFromRealm = async () => {
    const realmOpen = await connectDB();
    let lastKeyLocal: string = '';

    realmOpen.write(async () => {
      const imageDateCurrentLocal = realmOpen.objectForPrimaryKey<ImageDateCurrentSchemaType>(
        ImageSchemaOp.NAME_SCHEMA,
        'ImageDateCurrentID',
      );

      /**
       *  remove image not current date
       */
      // let today = new Date().toJSON().slice(0,10);

      if (imageDateCurrentLocal) {
        // const deleteImage = imageDateCurrentLocal?.image.filter(
        //   e => !e.create_at.includes(today),
        // );
        // deleteImage.map(m => {
        //   let idx = imageDateCurrentLocal.image.findIndex(
        //     mlc => mlc.id == m.id,
        //   );
        //   imageDateCurrentLocal.image.splice(idx, 1);
        // });
        imageDateCurrentLocal.image = [];
      }

      // /**
      //  *  check exist image Date Before
      //  */
      // if (imageDateCurrentLocal) {
      //   lastKeyLocal = imageDateCurrentLocal.lastKey;
      //   dispatchThunk(
      //     ImageAction.fetchImageCurrentDateLocalStorages(
      //       imageDateCurrentLocal.image,
      //     ),
      //   );
      //   setLoadingSlider(false);
      // }

      try {
        /**
         *  parse  respone data json to object
         */
        if (imageDateCurrentLocal?.image.length === 0) {
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          lastKeyLocal = '';
        }
        const respone = await getListImageCurrentPagingDate('');
        const resConvert = JSON.parse(JSON.stringify(respone));
        // console.log("resConvert.data.data.length", lastKeyLocal)
        const newImageArr: Array<File> = [];

        if (resConvert.data.data && resConvert.data.data.length) {
          resConvert.data.data.map((item: File, index: number) => {
            let result = {
              id: item.id,
              file_name: item.file_name,
              path_file: item.path_file,
              path_file_thumb: item.path_file_thumb,
              create_at: item.create_at,
              user: item.user,
            };
            newImageArr.push(result);
          });
        }
        /**
         * handle last key from api respone
         */
        const LastEvaluatedKey: LastEvaluatedKeyImage =
          resConvert.data.LastEvaluatedKey;

        const lastKey =
          LastEvaluatedKey &&
          LastEvaluatedKey.id &&
          LastEvaluatedKey.gsi &&
          LastEvaluatedKey.create_at
            ? `${LastEvaluatedKey.id}%26${
                LastEvaluatedKey.gsi
              }%26${LastEvaluatedKey.create_at.replace(/:/g, '%3A')}`
            : '';

        const imageDateCurrentUpdating = {
          id: 'ImageDateCurrentID',
          image: newImageArr,
          lastKey,
        };

        /**
         * connectDB data local and insert new room data
         */

        realmOpen.write(() => {
          const imageDateCurrentLocal = realmOpen.objectForPrimaryKey<ImageDateCurrentSchemaType>(
            ImageSchemaOp.NAME_SCHEMA,
            'ImageDateCurrentID',
          );

          if (imageDateCurrentLocal) {
            /**
             * if exist update room
             */
            imageDateCurrentUpdating.image.map(m => {
              let idx = imageDateCurrentLocal.image.findIndex(
                mlc => mlc.id == m.id,
              );
              /**
               * if existed
               *    update
               * else
               *    add new
               */
              //if (idx == -1) imageDateBeforeUpdating.image.push(m);
              if (idx == -1) {
                // imageDateCurrentLocal.image.unshift(m);
                imageDateCurrentLocal.image.push(m);
              } else {
                imageDateCurrentLocal.image[idx].create_at = m.create_at;
                imageDateCurrentLocal.image[idx].file_name = m.file_name;
                imageDateCurrentLocal.image[idx].id = m.id;
                imageDateCurrentLocal.image[idx].path_file = m.path_file;
                imageDateCurrentLocal.image[idx].path_file_thumb =
                  m.path_file_thumb;
                imageDateCurrentLocal.image[idx].user = m.user;
              }
            });
            /**
             * update room lastkey
             */
            imageDateCurrentLocal.lastKey = imageDateCurrentUpdating.lastKey;
            // console.log('done Image Current update');
            // if (imageDateCurrentUpdating.image.length > 0) {
            //   dispatchThunk(
            //     ImageAction.fetchImageCurrentDateLocalStorages(
            //       imageDateCurrentLocal.image,
            //     ),
            //   );
            // }
            dispatchThunk(
              ImageAction.fetchImageCurrentDateLocalStorages(
                imageDateCurrentLocal.image,
              ),
            );
          } else {
            /**
             * create new record when this room not exist
             */
            realmOpen.create(
              ImageSchemaOp.NAME_SCHEMA,
              imageDateCurrentUpdating,
            );
            dispatchThunk(
              ImageAction.fetchImageCurrentDateLocalStorages(
                imageDateCurrentUpdating.image,
              ),
            );
          }
          setLoadingSlider(false);
        });
      } catch (error) {
        setLoadingSlider(false);
        console.log('error', error);
      }
    });
  };

  const getDataImageBeforeDateFromRealm = async () => {
    const realmOpen = await connectDB();
    let lastKeyLocal: string = '';

    realmOpen.write(async () => {
      const imageDateBeforeLocal = realmOpen.objectForPrimaryKey<ImageDateBeforeSchemaType>(
        ImageSchemaOp.NAME_SCHEMA,
        'ImageDateBeforeID',
      );

      /**
       *  check exist image Date Before
       */
      if (imageDateBeforeLocal) {
        lastKeyLocal = imageDateBeforeLocal.lastKey;
        dispatchThunk(
          ImageAction.fetchImageBeforeDateLocalStorages(
            imageDateBeforeLocal.image,
          ),
        );
        setLoadingMansory(false);
      }

      try {
        const respone = await getListImageBeforePagingDate(lastKeyLocal); //lastKeyLocal,);
        /**
         *  parse  respone data json to object
         */
        const resConvert = JSON.parse(JSON.stringify(respone));

        const newImageArr: Array<File> = [];

        if (resConvert.data.data && resConvert.data.data.length) {
          resConvert.data.data.map((item: File, index: number) => {
            // let result: File = {
            //   ...item,
            // };
            let result = {
              id: item.id,
              file_name: item.file_name,
              path_file: item.path_file,
              path_file_thumb: item.path_file_thumb,
              create_at: item.create_at,
              user: item.user,
            };
            //console.log("result", result)
            newImageArr.push(result);
          });
        }

        /**
         * handle last key from api respone
         */
        //const lastKey: string = resConvert.data.LastEvaluatedKey;
        const LastEvaluatedKey: LastEvaluatedKeyImage =
          resConvert.data.LastEvaluatedKey;

        const lastKey =
          LastEvaluatedKey.id &&
          LastEvaluatedKey.gsi &&
          LastEvaluatedKey.create_at
            ? `${LastEvaluatedKey.id}%26${
                LastEvaluatedKey.gsi
              }%26${LastEvaluatedKey.create_at.replace(/:/g, '%3A')}`
            : '';

        const imageDateBeforeUpdating = {
          id: 'ImageDateBeforeID',
          image: newImageArr,
          lastKey,
        };

        /**
         * connectDB data local and insert new room data
         */

        realmOpen.write(() => {
          const imageDateBeforeLocal = realmOpen.objectForPrimaryKey<ImageDateBeforeSchemaType>(
            ImageSchemaOp.NAME_SCHEMA,
            'ImageDateBeforeID',
          );

          if (imageDateBeforeLocal) {
            /**
             * if exist update room
             */
            imageDateBeforeUpdating.image.map(m => {
              let idx = imageDateBeforeLocal.image.findIndex(
                mlc => mlc.id == m.id,
              );
              /**
               * if existed
               *    update
               * else
               *    add new
               */
              //if (idx == -1) imageDateBeforeUpdating.image.push(m);
              if (idx == -1) {
                imageDateBeforeLocal.image.unshift(m);
              } else {
                imageDateBeforeLocal.image[idx].create_at = m.create_at;
                imageDateBeforeLocal.image[idx].file_name = m.file_name;
                imageDateBeforeLocal.image[idx].id = m.id;
                imageDateBeforeLocal.image[idx].path_file = m.path_file;
                imageDateBeforeLocal.image[idx].path_file_thumb =
                  m.path_file_thumb;
                imageDateBeforeLocal.image[idx].user = m.user;
              }
            });
            /**
             * update room lastkey
             */
            imageDateBeforeLocal.lastKey = imageDateBeforeUpdating.lastKey;
            if (imageDateBeforeUpdating.image.length > 0) {
              console.log('Update Image Before');
              dispatchThunk(
                ImageAction.fetchImageBeforeDateLocalStorages(
                  imageDateBeforeLocal.image,
                ),
              );
            }
            setLoadingMansory(false);
          } else {
            /**
             * create new record when this room not exist
             */
            realmOpen.create(
              ImageSchemaOp.NAME_SCHEMA,
              imageDateBeforeUpdating,
            );
            dispatchThunk(
              ImageAction.fetchImageBeforeDateLocalStorages(
                imageDateBeforeUpdating.image,
              ),
            );
            setLoadingMansory(false);
          }
        });
      } catch (error) {
        setLoadingMansory(false);
        console.log('error', error);
      }
    });
  };

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

  const onRefresh = useCallback(() => {
    setRefresh(true);
    FetchData();
  }, []);

  return (
    <SafeAreaView style={{backgroundColor: '#fff', minHeight: height}}>
      <View>
        <View style={{position: 'relative'}}>
          <FlatList
            ref={FlatlistRef}
            data={ImageDayBefore.listCurrent}
            numColumns={2}
            onRefresh={onRefresh}
            refreshControl={
              <RefreshControl refreshing={refresh} onRefresh={onRefresh} />
            }
            refreshing={refresh}
            onEndReached={() => handleReadmore()}
            scrollEventThrottle={16}
            columnWrapperStyle={{
              marginHorizontal: 14,
              paddingBottom: 8,
              display: loadingMansory ? 'none' : 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexDirection: 'row',
              flex: 1,
            }}
            ListEmptyComponent={() =>
              !loadingMansory ? (
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
              ) : null
            }
            showsVerticalScrollIndicator={false}
            showsHorizontalScrollIndicator={false}
            renderItem={({item, index}) => (
              <Pressable
                onPress={() => {
                  dispatchLocal(
                    createAction(modal.SET_MODAL, {
                      isShow: true,
                      value: item,
                    }),
                  );
                }}>
                <ImageResView indexItem={index} uri={item.path_file_thumb} />
              </Pressable>
            )}
            keyExtractor={(item, index) => `masonryList-${index}`}
            ListHeaderComponent={() => (
              <>
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
                  <View
                    style={[
                      {
                        position: 'relative',
                      },
                    ]}>
                    {loadingSlider || loadingMansory ? (
                      <View
                        style={{
                          top: 0,
                          left: 0,
                          right: 0,
                          bottom: 0,
                          zIndex: 5,
                          height: 315,
                        }}>
                        <SLiderLoading />
                      </View>
                    ) : ImageCurrentDay.listAll.length > 0 ? (
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

                <View
                  style={{
                    paddingHorizontal: 14,
                    marginTop: 48,
                    marginBottom: 24,
                  }}>
                  <Text style={[globalStyles.text.subTitle]}>全て表示する</Text>
                </View>
                {loadingMansory ? <LoadingMansoryV2 /> : null}
              </>
            )}
            ListFooterComponent={() => (
              <View style={{width: width, height: height * 0.12}} />
            )}
          />
        </View>
      </View>
    </SafeAreaView>
  );
};
export default DiscoverScreen;
