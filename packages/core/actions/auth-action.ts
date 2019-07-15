import createStore from 'unistore';
import { Call, EventEmitter } from 'basic-helper';

import { ApplyLogin, ON_CONNECT_CLOSE } from '@little-chat/sdk';
import initHeartBeat from './heartbeat';
import {
  parseToObj
} from '../lib/storage';
import { USER_INFO_STORAGE } from '../constant';

let lastUserInfo = localStorage.getItem(USER_INFO_STORAGE);

if (lastUserInfo) {
  lastUserInfo = parseToObj(lastUserInfo);
}

let stopHeartbeat = () => {};
const handleConnectClose = () => {
  /** 链接断开时，停止心跳 */
  stopHeartbeat();
};
EventEmitter.on(ON_CONNECT_CLOSE, handleConnectClose);

const defaultAuthStore = {
  userInfo: {},
  username: '',
  loginResDesc: '',
  Token: '',
  logging: false,
  logouting: false,
  isLogin: false,
};

const runtimeState = Object.assign({}, defaultAuthStore, lastUserInfo ? {
  ...lastUserInfo,
  isLogin: true
} : {});

const authStore = createStore(runtimeState);

async function onLoginSuccess(store, resData) {
  const userInfo = resData;
  const nextLoginInfo = {
    userInfo,
    username: userInfo.UserName,
    loginResDesc: '登陆成功',
    logging: false,
    logouting: false,
    isLogin: true,
  };
  const emitEvent = 'LOGIN_SUCCESS';
  const emitData = { userInfo };

  stopHeartbeat = initHeartBeat();

  localStorage.setItem(USER_INFO_STORAGE, JSON.stringify({
    userInfo,
  }));

  store.setState(nextLoginInfo);

  EventEmitter.emit(emitEvent, emitData);
}

function clearPrevLoginData() {
  localStorage.removeItem(USER_INFO_STORAGE);
}

const authActions = store => ({
  async autoLogin() {
    if (!runtimeState.userInfo.Token) {
      store.setState({
        isLogin: false
      });
    } else {
      try {
        const loginRes = await ApplyLogin({
          Token: runtimeState.userInfo.Token
        });
        onLoginSuccess(store, { ...loginRes });
      } catch (error) {
        console.log(error);
        store.setState({
          isLogin: false
        });
      }
    }
  },
  async applyLogin(state, form, callback) {
    let isPass = false;
    store.setState({
      logging: true,
      loginResDesc: '',
    });
    const loginRes = await ApplyLogin(form);
    if (!loginRes.Code) isPass = true;
    const isLogin = isPass;
    if (isLogin) {
      Call(callback, form);
      onLoginSuccess(store, { ...form, ...loginRes });
    } else {
      store.setState({
        logging: false,
        loginResDesc: loginRes ? loginRes.Message : '请求失败'
      });
    }
  },
  async logout() {
    store.setState({
      logouting: true,
    });
    // await AUTH_APIS.logout();
    store.setState(defaultAuthStore);
    clearPrevLoginData();
  },
  logFail() {
    store.setState(defaultAuthStore);
    clearPrevLoginData();
  },
});

export {
  authStore, authActions
};
