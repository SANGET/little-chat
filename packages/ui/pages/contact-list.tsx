import React from 'react';
import { Avatar } from '@deer-ui/core/avatar';
import { DropdownWrapper } from '@deer-ui/core/dropdown-wrapper';
import { Menus } from '@deer-ui/core/menu';
import { Icon } from '@deer-ui/core/icon';

import { UserInfo, ContactState } from '@little-chat/core/types';
import {
  selectContact
} from '@little-chat/core/actions';
import Link from '../components/nav-link';
import ChatAvatar from '../components/avatar';

interface ContactProps extends UserInfo {
  contactData: ContactState;
  selectContact: typeof selectContact;
}

export default class Contacts extends React.Component<ContactProps, {}> {
  static RightBtns = (props) => (
    <DropdownWrapper
      position="right"
      outside
      overlay={({ hide }) => (
        <Menus data={[
          {
            text: '添加联系人',
            id: '1',
            action: () => {
              hide();
              props.onNavigate({
                type: 'PUSH',
                route: 'N',
                params: {
                  Com: 'SearchContact',
                  Title: '搜索联系人',
                }
              });
            }
          }
        ]}
        />
      )}
    >
      <Icon n="plus" classNames={["p20"]} />
    </DropdownWrapper>
  )

  contactFilter = () => {
    const { contactData, userInfo } = this.props;
    // const { UserName } = userInfo;
    let list = contactData.array;
    list = list.filter((item) => item.UserName !== userInfo.UserName);
    return list;
  }

  render() {
    const { userInfo } = this.props;
    const myName = userInfo.UserName;
    const contactList = this.contactFilter();
    const hasContact = contactList.length > 0;

    return hasContact ? (
      <div className="contact-list">
        {
          contactList.map((item) => {
            // const item = contactData[contactID];
            const { UserName, UserID, AvatarFileID } = item;
            const isMe = UserName === myName;
            const _UserID = UserID.toString();

            return !isMe && (
              <Link
                key={_UserID}
                Com="ContactDetail"
                Title={UserName}
                params={{
                  UserName,
                  UserID: _UserID
                }}
                onClick={() => {
                  this.props.selectContact(item);
                }}
              >
                <div className="c-item">
                  <ChatAvatar
                    AvatarFileID={AvatarFileID}
                    text={UserName[0]}
                    size={40}
                  />
                  <span className="name">{UserName}</span>
                </div>
              </Link>
            );
          })
        }
      </div>
    ) : (
      <div className="p20">
        <Link Com="SearchContact" Title="搜索联系人" className="link">
          还没有联系人，添加一个试试
        </Link>
      </div>
    );
  }
}
