import React, { Component } from 'react';

import { FormGenerator } from '@deer-ui/core/form-generator';
import { Button } from '@deer-ui/core/button';
import { Toast } from '@deer-ui/core/toast';
import { Call } from '@mini-code/base-func/call';
import { tuple } from '@mini-code/base-func/utils/type';
import { ApplyRegister } from '@little-chat/sdk';
import { registeFormOptions } from './form-options';
import gradientColorFilter, { gradientColorMapper } from '../components/color';

export interface RegisterPanelProps {
  /** 是否登陆中 */
  logging?: boolean;
  /** 是否自动登陆中 */
  autoLoging?: boolean;
  /** 登陆的回调 */
  applyLogin: Function;
  /** 登陆的 logo */
  logo?: Function;
  /** didMount 回调 */
  didMount?: Function;
  /** 登陆框的背景图 */
  backgroundImage?: string;
  /** 按钮的颜色，请参考 UI 库 Button 的配色方案 */
  btnColor?: string;
  /** 按钮的渐变颜色 */
  btnGColor?: btnGColor;
}

const btnGColorTypes = tuple(...Object.keys(gradientColorMapper));
type btnGColor = (typeof btnGColorTypes)[number];

export default class RegisterPanel extends Component<RegisterPanelProps, {}> {
  static defaultProps = {
    btnGColor: 'blue',
    logo: (appName = 'Elk Chat') => (
      <h2 className="title" style={{
        fontFamily: 'cursive'
      }}
      >{appName}</h2>
    )
  };

  state = {
    registerRes: {},
    loading: false
  }

  toast;

  autoLoginTime = 2;

  formHelper!: {
    value: any;
  }

  saveForm = (e: any) => {
    if (e) this.formHelper = e;
  }

  applyRegister = async (form) => {
    this.setState({
      loading: true,
    });
    let res;
    try {
      res = await ApplyRegister(form);
    } catch (e) {
      // console.log(e);
      res = e;
    }
    const isSuccess = !res.Code;
    if (isSuccess) {
      this.toast.show(`注册成功，正在自动登陆，请稍后`, 'success');
      setTimeout(() => {
        this.props.applyLogin(form);
      }, this.autoLoginTime * 1000);
    } else {
      this.toast.show(res.Message, 'error');
    }
    this.setState({
      registerRes: res,
      loading: false,
    });
  }

  render() {
    const { ClientConfig, logo } = this.props;
    const { loading } = this.state;
    const submitable = !loading;
    let btnTxt;
    switch (true) {
      case loading:
        btnTxt = '注册中...';
        break;
      default:
        btnTxt = '注册';
        break;
    }
    return (
      <div className="login-panel fixbg fixed"
        style={{
          // backgroundImage: `url(/img/login_bg.jpg)`
        }}
      >
        <Toast ref={(e) => { this.toast = e; }} />
        <div className="login-layout">
          {
            ClientConfig.logo && ClientConfig.logo.src ? (
              <img src={ClientConfig.logo.src} alt="logo" style={{ maxWidth: '100%' }} />
            ) : Call(logo, ClientConfig.appName)
          }
          <FormGenerator
            formOptions={registeFormOptions}
            layout="vertical"
            ref={this.saveForm}
          >
            <Button
              onClick={() => {
                const checkRes = this.formHelper.checkForm();
                if (checkRes.isPass) {
                  this.applyRegister(this.formHelper.value);
                } else {
                  this.toast.show(`请输入${checkRes.desc}`, 'error');
                }
              }}
              disabled={!submitable}
              className="res login-btn"
              size="lg"
              style={{
                backgroundImage: gradientColorFilter('red')
              }}
            >
              {btnTxt}
            </Button>
          </FormGenerator>
        </div>
      </div>
    );
  }
}
