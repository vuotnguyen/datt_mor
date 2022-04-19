import React, { useRef, useState } from 'react';
import {
  Animated, Dimensions,
  findNodeHandle, FlatList, Pressable,
  StyleSheet, Text,
  TouchableOpacity, UIManager, View
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { Ionicons } from '../../assets/icons';
import MESSAGE from '../../config/Messages';
import { getWorkItems } from '../../services/construction';
import { useAppDispatch } from '../../stories';
import SkeletonPlaceholder from './AnimationShimer';
import ImageConstruction from './ImageConstruction';
import WorkItem from './WorkItem';


const { width } = Dimensions.get('screen');
const IMAGE_SIZE = (width - 10) / 4;
const image = [0, 1, 2, 3]

export default ({ item, clickDetail }: any) => {

  const [workItems, setWorkItems] = useState([]);
  const [imageConstructions, setImageConstructions] = useState([]);
  const [loading, setLoading] = useState(false)
  let boxRef: any;

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

  React.useEffect(() => {
    fetchData();
    fetchConstructionImage();
  }, []);


  const fetchData = () => {
    getWorkItems(item.item.construction_id)
      .then(res => {
        setWorkItems(res?.data?.data?.work_items);
      })
      .catch(error => console.log(error));
  };
  const fetchConstructionImage = async () => {
    setLoading(true)
    await getWorkItems(item.item.construction_id, true)
      .then(res => {
        setImageConstructions(res?.data);
      })
      .catch(error => console.log(error));
    setLoading(false)
  };
  const name = item.item.construction_name;
  const dispatchLocal = useAppDispatch();
  const [showConstruction, setShowCons] = React.useState(true);
  const toggleConstruction = () => {
    setShowCons(!showConstruction);

  };
  const mapWorkItem = () => {
    if (loading == true) {
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
    } else {
      return (
        <>
          <FlatList
            horizontal
            data={imageConstructions.data}
            renderItem={({ item }) =>
              <ImageConstruction key = {item.path_file_thumb} show={show} item={item} fadeAnim={fadeAnim} />
            }
            key="_"
            keyExtractor={(item, index) => '_' + index.toString()}
          />
          {workItems.length
            ? workItems.map((v, index) => (
              <WorkItem
                show={show}
                fadeAnim={fadeAnim}
                {...v}
                key={index}
                constructionId={item.item.construction_id}
              />
            ))
            : null}
        </>
      );
    }


  };
  const measure = () => {
    UIManager.measureInWindow(findNodeHandle(boxRef), (x: number, y: number) => {
      clickDetail(item, true, y)
    })
  };

  return (
    <View >

      <Pressable
        ref={(ref) => boxRef = ref}
        style={styles.itemConstruction} onPress={toggleConstruction}>
        <View style={styles.row}>
          <Ionicons
            name={showConstruction == true ? 'chevron-down' : 'chevron-forward'}
            size={18}
            color="#000"
          />
          <Text numberOfLines={1} style={styles.labelConstruction}>
            {name.length >= 40 ? name.substr(0, 40) + ' ...' : name}
          </Text>
        </View>
        <TouchableOpacity
          style={styles.btEdit}
          onPress={() => {
            measure()
          }}>
          <Text style={{ color: '#fff' }}>
            {MESSAGE.CONSTRUCTION.MSG_CONSTRUCTION_OPTION}
          </Text>
        </TouchableOpacity>

      </Pressable>
      {showConstruction ? mapWorkItem() : null}
    </View >
  );
};

const styles = StyleSheet.create({
  image: {
    width: IMAGE_SIZE,
    height: IMAGE_SIZE,
    marginHorizontal: 2,
    borderRadius: 6,
    marginBottom: 4
  },
  itemConstruction: {
    marginBottom: 4,
    backgroundColor: '#94A2AB',
    height: 40,
    flexDirection: 'row',
    paddingHorizontal: 6,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  btEdit: {
    width: 51,
    height: 24,
    backgroundColor: '#F2994A',
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
    borderRadius: 6,
  },
  noImageText: { textAlign: 'center', marginTop: 20, marginBottom: 16 },
  row: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  labelConstruction: {
    color: '#000000',
    marginLeft: 4,
    fontSize: 16,
    fontWeight: '300',
    flex: 1,
  },
  triangle: {
    width: 0,
    height: 0,
    backgroundColor: "transparent",
    borderStyle: "solid",
    borderLeftWidth: 50,
    borderRightWidth: 50,
    borderBottomWidth: 100,
    borderLeftColor: "transparent",
    borderRightColor: "transparent",
    borderBottomColor: "red",
  },
});
