import { ReText } from "react-native-redash";

// messages common here
const COMMON = {
  MSG_COMMON_TEXT_ERROR: 'エラー',
  MSG_COMMON_TEXT_SUCCESS: '成功',
  MSG_COMMON_TEXT_WARN: '注意',
  MSG_COMMON_TEXT_INFO: 'お知らせ',
  BUTTON: {
    CONFIRM: 'はい',
    CANCEL: 'いいえ',
    CONFIRM_DATE: '設定',
    CANCEL_002: 'キャンセル', // cancel or hủy bỏ
  },
  MSG_COMMON_ERROR_001: 'インターネット接続がありません。',
  MSG_COMMON_TEXT_001: '既読',
};

// messages login here
const LOGIN = {
  MSG_LOGIN_ERROR_001: 'メールアドレスまたはパスワードが間違っています。',
};

// messages home here
const HOME = {
  MSG_HOME_TEXT_001: '今日の写真がありません。',
  MSG_HOME_TEXT_002: '写真がありません。',
};

// messages dialog here
const DIALOG = {
  MSG_DIALOG_TITLE_001: 'ログアウト',
  MSG_DIALOG_TEXT_001: '本当にログアウトしますか。',
  MSG_DIALOG_TEXT_002: 'この写真を共有しますか。',
};

const CAMERA = {
  MSG_CAMERA_TEXT_001: 'カメラがキャンセルされました。',
  MSG_CAMERA_TEXT_002: 'カメラを使用できません。',
  MSG_CAMERA_TEXT_003: 'カメラへのアクセスを許可。',
  MSG_CAMERA_TEXT_004: 'アップロードが完了しました',
  MSG_CAMERA_TEXT_005: 'カメラの許可',
  MSG_CAMERA_TEXT_006: 'アプリにはカメラの許可が必要です',
  MSG_CAMERA_TEXT_007: '外部ストレージの書き込み権限',
};

const CHAT = {
  MSG_CHAT_TEXT_001: '会話がありません。',
  MSG_CHAT_TEXT_002: 'タップしてチャットを開始します',
  MSG_CHAT_TEXT_003: 'メッセージを入力',
  MSG_CHAT_TEXT_004: '写真を送信しました。',
  MSG_CHAT_TEXT_005: 'が写真を送信しました。',
  MSG_CHAT_TEXT_006: '会話がありません。',
  MSG_CHAT_TEXT_007: '検索',
  MSG_CHAT_TEXT_008: '検索結果はありません。',
  MSG_CHAT_TEXT_009: 'ここから未読メッセージ',
};

//messages reset password here
const RESET_PASSWORD = {
  MSG_RESET_PASSWORD_ERROR_001:
    'このメールアドレスはデータベースに存在しません',
  MSG_RESET_PASSWORD_ERROR_002: '確認コードが無効です。もう一度お試しください',
  MSG_RESET_PASSWORD_ERROR_003: 'メールアドレスの形式ではありません。',
  MSG_RESET_PASSWORD_ERROR_004: 'パスワードの長さは 6 桁以上必要です。',
  MSG_RESET_PASSWORD_ERROR_005:
    'パスワードに使用できない文字が含まれています。',
  MSG_RESET_PASSWORD_ERROR_006: 'パスワードと再入力パスワードが一致しません',
  MSG_RESET_PASSWORD_TEXT_001: 'メールアドレス',
  MSG_RESET_PASSWORD_TEXT_002: '次へ',
  MSG_RESET_PASSWORD_TEXT_003: 'コード',
  MSG_RESET_PASSWORD_TEXT_004: '新しいパスワード',
  MSG_RESET_PASSWORD_TEXT_005: '新しいパスワード(確認)',
  MSG_RESET_PASSWORD_TEXT_006: 'パスワードを変更する',
  MSG_RESET_PASSWORD_TEXT_007: 'パスワードは半角英字数字記号が使用可能です',
  MSG_RESET_PASSWORD_TEXT_008: '記号は以下の文字が使用できます。',
};

const CONSTRUCTION = {
  MSG_CONSTRUCTION_TITLE: '工事一覧',
  MSG_CONSTRUCTION_DETAIL: '更新',
  MSG_CONSTRUCTION_OPTION: '機能',
  MSG_CONSTRUCTION_SEARCH: '検索',
  MSG_CONSTRUCTION_TITLE_UPDATE: '工事情報',
  MSG_CONSTRUCTION_LIST_USER_PICKER: '担当一覧',
  MSG_CONSTRUCTION_NAME_WORKITEM: '工種名',
  MSG_CONSTRUCTION_START_DATE: '開始日',
  MSG_CONSTRUCTION_END_DATE: '終了日',
  MSG_CONSTRUCTION_ADD_WORKITEM: '工種追加する',
  MSG_CONSTRUCTION_DELETE_WORKITEM: '工事を削除する',
  MSG_CONSTRUCTION_DELETE: '工種を追加する',
  MSG_CONSTRUCTION_LIST_WORKITEM: '工種',
  MSG_CONSTRUCTION_LIST_USER: '担当選択',
  MSG_CONSTRUCTION_SEARCH_USER: 'この写真を共有しますか。',
  MSG_CONSTRUCTION_OK: '確定',
  MSG_CONSTRUCTION_TITLE_ADD: '工事作成',
  MSG_CONSTRUCTION_ADD: '作成',
  MSG_CONSTRUCTION_NAME: '工事名',
  MSG_CONSTRUCTION_ADDRESS: '住所',
  CONSTRUCTION_ADD_WORKITEM_ERROR: '工種を入力してください。',
  CONSTRUCTION_CHECK_WORKITEM_NAME: '工種名を入力してください。',
  CONSTRUCTION_CHECK_WORKITEM_DATE: '開始日、終了日は両方入力してください。',
  CONSTRUCTION_CHECK_CONTRUCTION_NAME: '工事名を入力してください。',
  CONSTRUCTION_CHECK_INFO_WORKITEM: '工種を入力してください。',
  MSG_CREATE_SUCCESS_LEFT: '工事「',
  MSG_CREATE_SUCCESS_RIGHT: '」を作成しました。',
  MSG_UPDATE_SUCCESS_LEFT: '工事「',
  MSG_UPDATE_SUCCESS_RIGHT: '」を更新しました',
  MSG_NON_CONSTRUCTION: '工事がありません',
  MSG_NON_CONSTRUCTION_SEARCH: '検索結果がありません',

  UPDATE: '編集',
  INFO: '参照',


  MSG_DELETE_SUCCESS_LEFT: '工事「',
  MSG_DELETE_SUCCESS_RIGHT: '」を削除してもよろしいですか？',
  MSG_CONSTRUCTION_DELETE_CONFIRM: '工事「xxx」を削除してもよろしいですか？',
  MSG_CONFIRM_BACK_LISTCONSTRUCTION: '入力した内容が破棄されますが、移動してもよろしいですか？',

};

const CRUD_CONSTRUCTION = (name: string, type: string) => {
  switch (type) {
    case CONSTRUCTION.MSG_CONSTRUCTION_DELETE_CONFIRM:
      return `工事 「${name}」 を削除してもよろしいですか？`
    case CONSTRUCTION.MSG_CONSTRUCTION_DELETE_WORKITEM:
      return `工種 「${name}」 を削除してもよろしいですか？`
    case CONSTRUCTION.MSG_CONSTRUCTION_DELETE:
      return `工事 「${name}」 を削除しました。`
    default:
      return 'default';
  }

}

const BOTTOM_TAB = {
  TITLE_HOME: '工事一覧',
  TITLE_CAMERA: '撮影',
  TITLE_CHAT: 'チャット',
  TITLE_PROFILE: 'その他',
};

export default {
  COMMON,
  LOGIN,
  HOME,
  DIALOG,
  CAMERA,
  CHAT,
  RESET_PASSWORD,
  CONSTRUCTION,
  BOTTOM_TAB,
  CRUD_CONSTRUCTION
};
