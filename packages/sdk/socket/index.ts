import { EventEmitter, EventEmitterClass, Call } from 'basic-helper';
import { decodeData, messageResHandler } from '../handler';
import { RECEIVE_STATE_UPDATE } from '../constant';

interface SocketParams {
  /** 链接的 apiHost */
  apiHost: string;
  /** ws 发送请求前的 hook */
  beforeWSHook?: (any) => any;
  /** ws onmessage 时的 hook */
  afterWSHook?: (any) => any;
  /** 打开 socket 链接 */
  onOpen?: () => void;
  /** 失败 */
  onErr?: () => void;
  onMessage?: (event: MessageEvent) => void;
}

const onOpenMark = 'onOpen';
const onMessageMark = 'onMessage';

function wrapWSUrl(hostname) {
  if (/wss?:\/\//.test(hostname)) {
    console.warn('websocket host 不正确');
  }
  return hostname;
}

class SocketHelper extends EventEmitterClass {
  socket!: WebSocket;

  params!: SocketParams;

  connecting: boolean = false;

  reqQueue: {} = {};

  constructor(params: SocketParams) {
    super();
    const { apiHost } = params;
    this.params = params;
    if (apiHost) {
      this.initWS(apiHost);
    } else {
      console.error('请传入 apiHost');
    }
    // this.send = this.send.bind(this);
  }

  initWS = (apiHost: string) => {
    const wsApiHost = wrapWSUrl(apiHost);
    this.socket = new WebSocket(wsApiHost);
    this.socket.binaryType = 'arraybuffer';

    this.socket.onopen = this.onOpen;
    this.socket.onmessage = this.onMessage;
    this.socket.onerror = this.onErr;
    this.socket.onclose = this.onClose;
  }

  before = data => data;

  after = data => data.Data;

  resStatusFilter = data => !data.Data.Code

  setReqQuquq = (requestID, success, fail) => {
    this.reqQueue[requestID.toString()] = {
      success,
      fail,
    };
  }

  getReqQueue = requestID => this.reqQueue[requestID.toString()] || {}

  send = (
    buffer: ArrayBuffer, requestID: BigInt,
    success: Function, fail: Function
  ) => {
    if (!this.connecting) {
      console.error('链接已中断');
    } else {
      const wrapData = this.before(buffer);
      this.socket.send(wrapData);
      this.setReqQuquq(requestID, success, fail);
    }
  }

  onOpen = () => {
    // this.params.onOpen();
    this.connecting = true;
    this.emit(onOpenMark, {});
  }

  onMessage = (event) => {
    const { data } = event;
    const decodedData = decodeData(data);
    const { RequestID } = decodedData;
    const finalData = messageResHandler(decodedData);
    if (RequestID === BigInt(0)) {
      /** 来自推送的消息 */
      EventEmitter.emit(RECEIVE_STATE_UPDATE, finalData.Data);
    } else {
      const currReq = this.getReqQueue(RequestID);
      const { success, fail } = currReq;
      const isSuccess = this.resStatusFilter(finalData);
      const nextData = this.after(finalData);
      Call(isSuccess ? success : fail, nextData);
      this.emit(onMessageMark, nextData);
    }
  }

  onErr = (e) => {
    this.connecting = false;
    console.log(e, 'onErr');
  }

  onClose = (e) => {
    this.connecting = false;
    console.log(e, 'onClose');
  }
}

export default SocketHelper;
