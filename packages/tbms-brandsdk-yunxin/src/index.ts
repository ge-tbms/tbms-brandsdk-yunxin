/**
 * ----------------------------------
 * @file index.ts
 * @desc branksdk, tbms, yunxin
 * @author tbms-brandsdk-yunxin
 * ----------------------------------
 */

import { _, Constant } from 'tbms-util';
import Core from './core';
import { CCOptionsObject } from './global';
import { messageEncodeFlow, messageDecodeFlow } from './middleware'
import merge from 'lodash/merge';

const MSG_EVENT_CONSTANT = Constant.MSG_EVENT_CONSTANT;
export default class {
  private core: any
  private options: CCOptionsObject = {
    appkey: "",
    targetType: "",
    uid: "",
    touid: "",
    bizCode: "",
    user: {},
    onmsg: () => {},
    onofflinemsg: () => {},
    onerror: () => {},
    onclose: () => {},
    onconversation: () => {},
    onsystemmsg: () => {},
    onlogin: () => {}
  };
  constructor(options: any) {
    this.options = options;
    this.core = new Core(options);
    this.core.useBatch([messageEncodeFlow, messageDecodeFlow])
    this.init();
  }

  init() {
    this.core.on(MSG_EVENT_CONSTANT.RECEIVE_MSG, (msg: any) => {
      this.core.dispatchMsg(msg);
    });

    this.core.on(MSG_EVENT_CONSTANT.LOGIN_SUCCESS, (event: any) => {
      this.core.dispatchLogin(event);
    });

    this.core.on(MSG_EVENT_CONSTANT.LOGIN_ERROR, (event: any) => {
      this.options.onerror(event);
    });

    this.core.on(MSG_EVENT_CONSTANT.GET_OFFLINE_MSG, (msgs: any) => {
      msgs.forEach((msg: any) => {
        this.core.dispatchOfflineMsg(msg);
      });
    });
  }

  /**
   * 获取离线消息
   * @param options
   */
  getHistoryMessage(options: any) {
    this.core.getOfflineMessage(merge({
      to: this.options.touid,
      scene: 'p2p'
    }, options,  {
      done: (err: any, obj: any) => {
        if (err) {
          this.core.dispatchError(err);
        } else {
          obj.msgs.forEach((msg: any) => {
            msg.id = msg.idClient;
            this.core.dispatchOfflineMsg(msg)
          })
        }
      }
    }));
  }

  /**
   * 发送实时消息
   * @param data
   */
  sendMsg(data: any) {
    let { type = '' } = data;

    switch (type) {
      case 'text':
        this.core.sendText({
          scene: 'p2p',
          to: this.options.touid,
          text: data.content,
          done: (error: any, msg: any) => {
            if (error) {
              this.core.dispatchError(error);
            } else {
              msg.id = msg.idClient;
              this.core.dispatchMsg(msg);
            }
          }
        })
    }
  }

}
