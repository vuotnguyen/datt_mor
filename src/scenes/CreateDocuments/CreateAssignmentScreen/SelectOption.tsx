import React, {useState} from 'react';
import {
  Dimensions,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Modal,
  SafeAreaView,
  FlatList,
} from 'react-native';
import {Entypo} from '../../../assets/icons';
import OptionComponent from './OptionComponent';

const {width} = Dimensions.get('window');
type test = {
  options: any;
  onChangeSelect: any;
  text: any;
};
const SelectOption = ({options, onChangeSelect, text}: test) => {
  //   const Select = () => {
  const [txt, setTxt] = useState(text);
  const [selected, setSelected] = useState('');
  const [modalVisible, setModalVisible] = useState(false);

  const renderOption = (item: any) => {
    return (
      <TouchableOpacity
        style={[
          styles.optionContainer,
          {backgroundColor: item.id === selected ? '#eee' : '#fff'},
        ]}
        onPress={() => {
          onChangeSelect(item.id);
          setTxt(item.name);
          setModalVisible(false);
          setSelected(item.id);
        }}>
        <Text
          style={[
            styles.optionTxt,
            {fontWeight: item.id === selected ? 'bold' : 'normal'},
          ]}>
          {item.name}
        </Text>
        {item.id === selected && (
          <Entypo name={'check'} size={20} color={'blue'} />
        )}
      </TouchableOpacity>
    );
  };

  // const renderOption = (item: any) => {
  //   return (
  //     <OptionComponent
  //       item={item}
  //       selected={selected}
  //       onChangeSelect={onChangeSelect}
  //       setTxt={setTxt}
  //       setModalVisible={setModalVisible}
  //       setSelected={setSeclected}
  //     />
  //   );
  // };

  return (
    <>
      <TouchableOpacity
        activeOpacity={0.8}
        style={styles.container}
        onPress={() => {
          setModalVisible(true);
        }}>
        <Text style={styles.text} numberOfLines={1}>
          {txt}
        </Text>
        <Entypo
          name="chevron-down"
          size={20}
          color={'#ccc'}
          style={{marginRight: 10}}
        />
      </TouchableOpacity>

      <Modal
        animationType="slide"
        visible={modalVisible}
        onRequestClose={() => {
          setModalVisible(false);
        }}>
        <SafeAreaView>
          <View style={styles.headerModal}>
            <TouchableOpacity
              onPress={() => {
                setModalVisible(false);
              }}>
              <Entypo
                name="chevron-left"
                size={25}
                color={'#000'}
                style={{marginRight: 10}}
              />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>{text}</Text>
            <TouchableOpacity
              onPress={() => {
                setModalVisible(false);
              }}>
              {/* <Text style={styles.modalCancel}>Cancel</Text> */}
            </TouchableOpacity>
          </View>
          <FlatList
            data={options}
            keyExtractor={item => String(item.id)}
            renderItem={({item}) => renderOption(item)}
          />
        </SafeAreaView>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 40,
    backgroundColor: '#f8f9fa',
    paddingLeft: 12,
    // marginHorizontal: 20,
    borderRadius: 8,
    fontSize: 18,
    borderWidth: 1,
    borderColor: '#ccc',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  label: {
    color: '#555',
    fontSize: 16,
    paddingLeft: 20,
    paddingVertical: 10,
  },
  text: {
    color: '#555',
    fontSize: 16,
    marginRight: 36,
    width: width - 100,
  },
  headerModal: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    borderBottomColor: '#ddd',
    borderBottomWidth: 1,
    paddingBottom: 12,
    marginTop: 10,
  },
  modalTitle: {
    fontSize: 18,
    color: '#555',
  },
  // modalCancel: {
  //   fontSize: 13,
  //   color: 'blue',
  //   fontWeight: 'bold',
  // },
  optionContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomColor: '#eee',
    borderBottomWidth: 1,
    padding: 10,
  },
  optionTxt: {
    fontSize: 16,
    color: '#555',
  },
});
export default SelectOption;
