import * as React from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {Snackbar} from 'react-native-paper';

type IActionSnackbar = {
  label: string;
  accessibilityLabel?: string;
  onPress: () => void;
};
interface IToastContext {
  visible: boolean;
  setVisible: (val: boolean) => void;
}
const ToastContext = React.createContext<IToastContext | null>(null);
export const useToast = () => React.useContext(ToastContext);

export function ToastConsumer({children}: {children: React.ReactChild}) {
  const [visible, setVisible] = React.useState<boolean>(false);
  const onDismissSnackBar = () => setVisible(false);
  return (
    <ToastContext.Provider value={{visible, setVisible}}>
      <View>{children}</View>
      <Snackbar
        style={{zIndex: 99}}
        visible={visible}
        onDismiss={onDismissSnackBar}
        action={{
          label: 'OK',
          onPress: () => {},
        }}>
        Not found app support this file in your devices, please try again!
      </Snackbar>
    </ToastContext.Provider>
  );
}

const styles = StyleSheet.create({});
