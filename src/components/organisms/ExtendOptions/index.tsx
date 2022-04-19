import * as React from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { get } from 'lodash';
import { Octicons, FontAwesome5 } from '../../../assets/icons';
import { useDocument } from '../../../hooks/file';
import { ITypeInput } from '../../common/InputAction/KeyboardServices';
import { useChatContext } from '../../../hooks/chat';
import { useInputContext } from '../../common/InputAction/hooks';
interface IExtendsOption {
  typeInput?: ITypeInput;
}
const ExtendsOption = React.memo(({ }: IExtendsOption) => {
  const { pickDocumentFile } = useDocument();
  const chatContext = useChatContext();
  const InputContext = useInputContext();

  if (!InputContext || !chatContext) return null;

  const { services } = InputContext;
  const handleSelectFile = () =>
    pickDocumentFile({
      onSuccess: data => {
        if (data) {
          services.handleAttachFile(data);
        }
      },
    });
  const generalServices = () => {
    if (chatContext.typeChat == 'groupUser' || chatContext.typeChat == 'individual') {
      return (<View style={styles.wrappButton}>
        <TouchableOpacity
          style={styles.buttonMore}
          onPress={handleSelectFile}>
          <FontAwesome5
            name={'file-upload'}
            size={29}
            style={styles.iconMore}
          />
          <Text style={styles.textMore}>{'ファイル'}</Text>
        </TouchableOpacity>
      </View>)
    }
    return (
      <>
        <View style={styles.wrappButton}>
          <TouchableOpacity
            style={styles.buttonMore}
            onPress={() => {
              chatContext.navigation.navigate('CreateAssignment');
            }}>
            <Octicons name={'project'} size={30} style={styles.iconMore} />
            <Text style={styles.textMore}>{'指示作成'}</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.wrappButton}>
          <TouchableOpacity
            style={styles.buttonMore}
            onPress={() => {
              chatContext.navigation.navigate('CreateReport');
            }}>
            <FontAwesome5 name={'tasks'} size={29} style={styles.iconMore} />
            <Text style={styles.textMore}>{'報告作成'}</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.wrappButton}>
          <TouchableOpacity
            style={styles.buttonMore}
            onPress={handleSelectFile}>
            <FontAwesome5
              name={'file-upload'}
              size={29}
              style={styles.iconMore}
            />
            <Text style={styles.textMore}>{'ファイル'}</Text>
          </TouchableOpacity>
        </View>
      </>)
  };
  return (
    <ScrollView
      showsHorizontalScrollIndicator={false}
      showsVerticalScrollIndicator={false}>
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'flex-start',
          flexWrap: 'wrap',
          alignItems: 'flex-start',
          paddingVertical: 5,
          display: 'flex',
          marginHorizontal: -5,
        }}>
        {generalServices()}
      </View>
    </ScrollView>
  );
});
export default ExtendsOption;

const styles = StyleSheet.create({
  wrapperKeyboardBottom: {
    position: 'relative',
    zIndex: 55,
    backgroundColor: '#fff',
  },
  wrappButton: {
    width: '25%',
    minWidth: '25%',
    maxWidth: '25%',
    paddingVertical: 5,
    paddingHorizontal: 5,
  },
  buttonMore: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  iconMore: {
    marginBottom: 5,
  },
  textMore: {
    textAlign: 'center',
    maxWidth: '80%',
  },
});
