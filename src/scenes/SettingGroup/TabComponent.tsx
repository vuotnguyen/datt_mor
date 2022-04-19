import React, {useState, memo} from 'react';
import {Text, View, TouchableOpacity, Dimensions} from 'react-native';
import {ButtonIcon} from '../../components/buttons';
import {
  Ionicons,
  Entypo,
  FontAwesome5,
  AntDesign,
  MaterialIcons,
  Foundation,
} from '../../assets/icons';
const {height} = Dimensions.get('screen');
// custom styles
import * as stylesGlobal from '../../styles';

export enum statusTab {
  Notices = 1,
  Sucess = 2,
  Warning = 3,
  Normal = 4,
}
export enum TabType {
  ListUser = 'ListUser',
  LeaveRoom = 'LeaveRoom',
}

export type type_tab = {
  isExpanded: boolean;
  isUseExpanded: boolean;
  isTab: TabType;
  title: string;
  onPress: () => void;
  Icon: JSX.Element | null;
  statusTab: statusTab;
  children: JSX.Element | null;
  color?: string;
  disabled?:boolean;
};

const TabComponent: React.FC<{
  tab: type_tab;
  isAdmin: boolean;
  loading: boolean;
}> = ({
  tab,
  // onPressTab,
  isAdmin,
  loading,
}) => {
  const [expand, setExpand] = useState<boolean>(true);

  const onPressTab = () => {
    setExpand(!expand);
  };
  return (
    <View
      key={'tab' + tab.title}
      style={{backgroundColor: '#fff', marginBottom: 5,opacity:tab.disabled?0.6:1}}>
      <TouchableOpacity
        onPress={tab.isUseExpanded ? onPressTab : tab.onPress}
        disabled={loading||tab.disabled}
        style={[
          {
            paddingVertical: 5,
            borderBottomWidth: 0.5,
            opacity: loading ? 0.5 : 1,
          },
          expand
            ? {
                borderBottomColor: '#ccc',
              }
            : {borderBottomColor: 'transparent'},
        ]}>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
          }}>
          <View
            style={{
              width: '15%',
              justifyContent: 'center',
              flexDirection: 'row',
            }}>
            {tab.Icon}
          </View>
          <View
            style={{
              flex: 1,
              flexDirection: 'row',
            }}>
            <View
              style={[
                {
                  flexDirection: 'row',
                  alignItems: 'center',
                  position: 'relative',
                  // justifyContent: 'space-between',
                  // width: '100%',
                },
                isAdmin
                  ? {}
                  : {
                      justifyContent: 'space-between',
                      width: '100%',
                    },
              ]}>
              <Text
                style={
                  tab.statusTab === statusTab.Warning
                    ? {color: stylesGlobal.colors.DANGER}
                    : {color: 'rgba(0,0,0,0.7)'}
                }>
                {tab.title}
              </Text>
              {tab.isUseExpanded ? (
                <View
                  style={[
                    {paddingTop: 2},
                    isAdmin
                      ? {
                          paddingHorizontal: 7,

                          position: 'absolute',
                          right: 0,
                          transform: [{translateX: 35}],
                        }
                      : {
                          paddingHorizontal: 12,
                        },
                  ]}>
                  <MaterialIcons
                    name={expand ? 'expand-less' : 'expand-more'}
                    size={18}
                    color={'rgba(0,0,0,0.7)'}
                    style={{opacity: loading ? 0 : 1}}
                  />
                </View>
              ) : null}
            </View>
          </View>
          <View style={{display: isAdmin ? 'flex' : 'none'}}>
            {tab.isTab === TabType.ListUser ? (
              <ButtonIcon
                disabled={loading}
                onPress={
                  tab.isTab === TabType.ListUser ? tab.onPress : () => {}
                }
                style={{
                  marginHorizontal: 5,
                }}>
                <View style={{paddingHorizontal: 7, paddingVertical: 7}}>
                  <AntDesign
                    name={'plus'}
                    size={18}
                    color={'rgba(0,0,0,0.7)'}
                    style={{opacity: loading ? 0 : 1}}
                  />
                </View>
              </ButtonIcon>
            ) : (
              <View style={{paddingHorizontal: 7, paddingVertical: 7}}></View>
            )}
          </View>
        </View>
      </TouchableOpacity>
      <View
        style={{
          height: expand ? undefined : 0,
          maxHeight: height / 2,
          overflow: 'hidden',
        }}>
        {tab.children}
      </View>
    </View>
  );
};
export default memo(TabComponent);
