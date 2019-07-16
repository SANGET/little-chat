import React from 'react';
import { Avatar } from 'ukelli-ui/core/avatar';
import { DropdownWrapper } from 'ukelli-ui/core/selector';
import { Menus } from 'ukelli-ui/core/menu';
import { Icon } from 'ukelli-ui/core/icon';

import { UserInfo, ContactState, ContactList } from '@little-chat/core/types';
import {
  selectContact, applyGetContacts
} from '@little-chat/core/actions';
import Link from '../components/nav-link';

interface ContactProps extends UserInfo {
  contactData: ContactState;
  selectContact: typeof selectContact;
}

export default class Contacts extends React.Component<ContactProps, {}> {
  static RightBtns = props => (
    <div className="p20">
      <DropdownWrapper
        position="right"
        needAction={false}
        outside
        overlay={({ hide }) => (
          <Menus data={[
            {
              text: '添加联系人',
              id: '1',
              action: () => {
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
          ]} />
        )}>
        <Icon n="plus" />
      </DropdownWrapper>
    </div>
  )

  contactFilter = () => {
    const { contactData, userInfo } = this.props;
    // const { UserName } = userInfo;
    const list = contactData.array;
    // list.filter(item => item.UserName !== UserName);
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
            const { UserName, UserID } = item;
            const isMe = UserName === myName;
            const contactAvatar = item.Avatar;
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
                }}>
                <div className="c-item">
                  <Avatar src={contactAvatar || null} size={30}>
                    {contactAvatar || UserName[0]}
                  </Avatar>
                  {UserName}
                </div>
              </Link>
            );
          })
        }
      </div>
    ) : (
      <div>
        还没有联系人，添加一个试试
      </div>
    );
  }
}
