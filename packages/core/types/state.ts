import * as ChatSDK from '@little-chat/sdk/lib';

export interface AuthState {
  isLogin: boolean;
  logging: boolean;
  msg: string;
}

export interface UserInfo {
  UserName: string;
}

// Chat

export interface ChatItemEntity extends ChatSDK.kproto.IChat {

}

export interface ChatContentState {
  [chatName: string]: {
    [chatID: string]: {
      ID: number;
      Message: string;
      FromUser: string;
      SendTime: number;
      UpdatedAt: number;
      MsgType: number;
    };
  };
}
