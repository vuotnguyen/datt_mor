import React from 'react';
import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import {
  IMessageGroupChatReceiver,
  IMessageReceiver,
} from '../../../models/chat';
import {useChannelContext} from '../../../hooks/chat';
import {Button, HStack, Popover} from 'native-base';
import {FontAwesome5, Ionicons} from '../../../assets/icons';
import {style} from 'styled-system';
const PopoverMessageComponent = ({
  children,
  messageItem,
  onPress = () => undefined,
  fileName = '',
  mine = false,
}: {
  children: Element;
  messageItem: IMessageReceiver | IMessageGroupChatReceiver;
  onPress?: () => void;
  fileName?: string;
  mine?: boolean;
}) => {
  const channelContext = useChannelContext();
  if (!channelContext) return null;
  const {handleDeleteMessage} = channelContext;
  const [tooltip, setTooltip] = React.useState<boolean>(false);
  const handleClosed = () => {
    setTooltip(false);
  };
  const handleToggle = () => {
    setTooltip(!tooltip);
  };
  const handleDeleted = () => {
    setTooltip(false);
    handleDeleteMessage(messageItem.id_message, fileName);
  };

  const handleCreateReport = () => {
    console.log('create report');
  };

  return (
    <Popover
      isOpen={tooltip}
      onClose={handleClosed}
      trigger={triggerProps => (
        <Button
          p={0}
          flexDirection={'row'}
          justifyContent={'flex-end'}
          size={'sm'}
          delayLongPress={200}
          variant="unstyled"
          onLongPress={handleToggle}
          {...triggerProps}
          onPress={onPress}>
          {children}
        </Button>
      )}>
      <Popover.Content
        // p={1}
        mx={2}
        borderColor={'coolGray.800'}
        // borderRadius={0}
        bg={'coolGray.800'}>
        <Popover.Arrow bg={'coolGray.800'} style={styles.arrow} />
        <Popover.Body bg={'coolGray.800'} p={0}>
          {/* <Button.Group > */}
          <HStack>
            <TouchableOpacity
              style={styles.button}
              onPress={handleCreateReport}>
              <View style={styles.wrapperIcon}>
                <FontAwesome5 name={'tasks'} size={20} style={styles.icon} />
                <Text style={styles.text}>報告作成</Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.button,
                {borderRightWidth: 0, opacity: mine ? 0.5 : 1},
              ]}
              disabled={mine}
              onPress={handleDeleted}>
              <View style={styles.wrapperIcon}>
                <Ionicons
                  name={'trash-outline'}
                  size={20}
                  style={styles.icon}
                />
                <Text style={styles.text}>削除</Text>
              </View>
            </TouchableOpacity>
          </HStack>
          {/* </Button.Group> */}
        </Popover.Body>
      </Popover.Content>
    </Popover>
  );
};

export default PopoverMessageComponent;

const styles = StyleSheet.create({
  button: {height: 45, width: 45, borderRightWidth: 0.2, borderColor: '#ccc'},
  icon: {color: '#ccc', marginTop: 4},
  wrapperIcon: {alignItems: 'center'},
  arrow: {
    borderColor: 'rgba(0,0,0,0.9)',
    zIndex: 0,
  },
  text: {color: '#ccc', fontSize: 9, marginTop: 3},
});
