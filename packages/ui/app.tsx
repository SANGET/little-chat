import React, { Component } from "react";

import "./style/style.scss";

export interface ChatLayoutProps {

}

export default class ChatLayout extends Component<ChatLayoutProps> {
  render() {
    console.log(this.props)
    return (
      <div className="layout">
        <div>laft</div>
        <div>right</div>
      </div>
    );
  }
}