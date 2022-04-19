import React, {
  memo,
  PureComponent,
  useCallback,
  useEffect,
  useState,
} from 'react';
import {
  View,
  ScrollView,
  Dimensions,
  TouchableNativeFeedback,
  StyleSheet,
  NativeSyntheticEvent,
  NativeScrollEvent,
  ActivityIndicator,
  Text,
} from 'react-native';
import {IChatResutlMessageSearch} from '../../../models/chat';
import {apiSearchMessage} from '../../../services/chat';
import {useAppSelector} from '../../../stories';
import ChatBoxItem from '../../organisms/ChatBoxItem/ChatBoxItemSearchMessage';
const {height, width} = Dimensions.get('screen');

const limitPaging = 20;

type Props = {
  chats: Array<IChatResutlMessageSearch>;
  handleSearchMessageID: (
    idmessage: string,
    create_at: string,
    index: number,
  ) => void;
  keyworkFullwidth: string;
  keyworkHalfwidth: string;
  totalResultSearch: number;
  roomID: string;
  keywork: string;
};

type State = {
  result: Array<IChatResutlMessageSearch>;
  count: number;
  totalResult: number;
  loadmore: boolean;
  loadingEndToStart: boolean;
};

class index extends PureComponent<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      result: this.props.chats.slice(0, limitPaging),
      count: 0,
      totalResult: 0,
      loadingEndToStart: false,
      loadmore: false,
    };
  }

  RenderChatBox = () => {
    if (!(this.state.result && this.state.result?.length)) return;
    return this.state.result
      .filter(item => {
        return !item.message.includes('SpecialMessage: ');
      })
      .map((item, index) => {
        return (
          <View key={index} style={[styles.wrapperBox, styles.viewChatbox]}>
            <TouchableNativeFeedback
              onPress={() =>
                this.props.handleSearchMessageID(
                  item.id_message,
                  item.create_at,
                  index + 1,
                )
              }>
              <View style={[styles.userBox, styles.paddingViewChatBox]}>
                <ChatBoxItem
                  item={item}
                  keyworkFullwidth={this.props.keyworkFullwidth}
                  keyworkHalfwidth={this.props.keyworkHalfwidth}
                />
              </View>
            </TouchableNativeFeedback>
          </View>
        );
      });
  };

  LoadingChatBox = () => {
    const {result, loadingEndToStart} = this.state;

    return (
      <>
        <View key={'LoadingChatBox'} style={[styles.wrapperBox]}>
          <View
            style={{
              height: !loadingEndToStart && result.length >= 20 ? 40 : 0,
              backgroundColor: 'transparent',
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              display:
                !loadingEndToStart && result.length >= 20 ? 'flex' : 'none',
            }}>
            <ActivityIndicator size={20} color={'#000'} />
          </View>
          <View
            style={[
              styles.userBoxLoading,
              styles.paddingViewLoading,
              {
                padding:
                  10 - this.state.result.length > 0
                    ? (10 - this.state.result.length) * 35
                    : 10, //chats.length < 10 ? 300 : 10
              },
            ]}></View>
        </View>
      </>
    );
  };

  TotalMessage = () => {
    return (
      <>
        <View style={[styles.paddingViewLoading]}>
          <Text
            style={
              styles.titleTotalResult
            }>{`メッセージ ${this.props.totalResultSearch}`}</Text>
        </View>
      </>
    );
  };

  addToEnd = async () => {
    const {totalResult, result} = this.state;
    const {roomID, keywork, chats} = this.props;
    this.setState(
      {
        loadmore: true,
        count: this.state.count + 1,
      },
      async () => {
        if (this.state.count <= totalResult && result.length > 0) {
          // apiSearchMessage(roomID, keywork, this.state.count )
          //     .then(res => {
          //         const resDataConvert = JSON.parse(JSON.stringify(res));
          //         let arr: Array<IChatResutlMessageSearch> = [];
          //         if (resDataConvert.data.data.length > 0) {
          //             arr = resDataConvert.data.data;
          //         } else {
          //             arr = [];
          //         }
          //         this.setState(state => {
          //             return {
          //               result: state.result.concat(arr)
          //             }
          //           })
          //     })
          //     .catch(err => {
          //         console.log('apiSearchMessage error', err);
          //     })
          const resDataConvert = chats.slice(
            this.state.count * limitPaging,
            this.state.count * limitPaging * 2,
          );
          let arr: Array<IChatResutlMessageSearch> = [];
          if (resDataConvert.length > 0) {
            arr = resDataConvert;
          } else {
            arr = [];
          }
          this.setState(state => {
            return {
              result: state.result.concat(arr),
            };
          });
        } else {
          this.setState({loadingEndToStart: true});
        }
      },
    );
  };

  handleOnScroll = ({nativeEvent}: NativeSyntheticEvent<NativeScrollEvent>) => {
    const {result, loadmore} = this.state;
    let bottom =
      nativeEvent.layoutMeasurement.height + nativeEvent.contentOffset.y;
    if (bottom > nativeEvent.contentSize.height - height * 0.1) {
      if (result.length >= 20 && !loadmore) {
        this.addToEnd();
      }
    }
  };

  render() {
    const {loadmore} = this.state;
    return (
      <>
        {this.TotalMessage()}
        <View>
          <ScrollView
            nestedScrollEnabled={false}
            removeClippedSubviews={true}
            scrollEventThrottle={16}
            showsVerticalScrollIndicator={false}
            showsHorizontalScrollIndicator={false}
            onScroll={this.handleOnScroll}
            onContentSizeChange={() => {
              if (loadmore) {
                setTimeout(() => {
                  this.setState({loadmore: false});
                }, 500);
              }
            }}>
            {this.RenderChatBox()}
            {this.LoadingChatBox()}

            <View style={styles.footerScrollView}></View>
          </ScrollView>
        </View>
      </>
    );
  }

  /**
   *  life cycle run after component render
   */
  componentDidMount() {
    const {totalResultSearch} = this.props;
    if (totalResultSearch % 2) {
      this.setState({
        totalResult: Math.floor(totalResultSearch / limitPaging) - 1,
      });
    } else {
      this.setState({totalResult: Math.floor(totalResultSearch / limitPaging)});
    }
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  wrapperBox: {
    borderStyle: 'solid',
    borderBottomColor: 'rgba(0,0,0,0.1)',
    borderBottomWidth: 1,
    overflow: 'hidden',
  },
  userBox: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    width: '100%',
  },
  userBoxLoading: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',

    width: '100%',
  },
  footerScrollView: {
    height: height * 0.15,
    width: width,
  },
  viewChatbox: {
    overflow: 'hidden',
  },
  paddingViewChatBox: {
    paddingHorizontal: 10,
  },
  paddingViewLoading: {
    paddingHorizontal: 10,
  },
  titleTotalResult: {
    fontSize: 13,
    color: '#000',
    marginBottom: 8,
    marginTop: 8,
  },
});

export default index;
