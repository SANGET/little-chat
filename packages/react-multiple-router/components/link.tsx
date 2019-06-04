import React from 'react';

import { getUrlParams } from 'uke-request/url-resolve';
import { CallFunc, IsUrl } from 'basic-helper';

import {
  getRouteKey, onNavigate
} from '../utils';

interface LinkProps {
  /** 将要导航到的路由 */
  to: string;
  className?: string;
  onClick?: Function;
  /** 作为 query string 的导航参数，例如 { ID: 123, name: alex } -> ID=123&name=alex */
  params?: {};
}

/**
 * 用于导航到另外页面的组件
 * @param {object} options 参数
 * @TODO: 完善是否激活的判定
 */
const Link: React.SFC<LinkProps> = ({
  to, className = 'link-btn', children, onClick, params
}) => {
  const activeRoute = getUrlParams()[getRouteKey()];
  const isActive = activeRoute === to;

  return (
    <span
      className={className + (isActive ? ' active' : '')}
      onClick={(e) => {
        CallFunc(onClick)(e);
        if (IsUrl(to)) return window.open(to);
        return onNavigate({
          type: 'PUSH',
          route: to,
          params
        });
      }}>
      {children}
    </span>
  );
};
Link.defaultProps = {
  className: 'link-btn',
  params: {}
};

export default Link;
