import {Dimensions, StyleSheet} from 'react-native';
const screen = Dimensions.get('screen');
export const heightHeader = screen.width * 0.12;
const styles = StyleSheet.create({
  top: {
    borderStyle: 'solid',
    borderBottomColor: 'rgba(0,0,0,0.1)',
    borderBottomWidth: 1,
    width: '100%',
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    height: screen.width * 0.12,
    backgroundColor: '#fff',
  },
});
export default styles;
