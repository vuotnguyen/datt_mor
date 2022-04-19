import React from 'react';
import {DocumentPickerResponse} from 'react-native-document-picker';

export type IInputContext = {
  attachFiles: DocumentPickerResponse[];
  setAttachFiles: (arr: DocumentPickerResponse[]) => void;
  text: string;
  onChangeText: (val: string) => void;
  services: {
    handleAttachFile: (file: DocumentPickerResponse) => void;
  };
};

export const InputContext = React.createContext<IInputContext | null>(null);
export const useInputContext = () => React.useContext(InputContext);
