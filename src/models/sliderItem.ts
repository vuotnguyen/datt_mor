import {ImageSourcePropType} from 'react-native';

export interface ISliderItem {
  user: {
    avatar: ImageSourcePropType;
    name: string;
    id: string;
  };
  product: {
    image: ImageSourcePropType;
  };
}
