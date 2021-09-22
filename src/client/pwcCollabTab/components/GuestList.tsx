import * as React from "react";
import { Fragment, useEffect, useState, useCallback } from "react";
import { Button, Status, Table, Text, Header, Flex } from "@fluentui/react-northstar";
import { MoreIcon } from '@fluentui/react-icons-northstar'
import { getUsers, getUser, getTeamMembers } from "../GraphService";

export function GuestList(props) {
  const [rows, setRows] = useState<any[]>([]); // String input
  const token = props.token;
  const teamId = props.teamId;

  const header = {
    key: 'header',
    items: [
      {
        key: 'statusColor',
        'aria-label': 'status color',
      },
      {
        content: 'Name',
        key: 'name',
      },
      {
        content: 'E-Mail',
        key: 'mail',
      },
      {
        content: 'User Type',
        key: 'type',
      },
      {
        content: 'Status',
        key: 'status',
      },
      {
        content: 'Created Date',
        key: 'created',
      },
      {
        content: 'Updated Date',
        key: 'updated',
      },
      {
        key: 'more options',
        'aria-label': 'options',
      },
    ],
  }

  const moreOptionCell = {
    content: <Button tabIndex={-1} icon={<MoreIcon />} circular text iconOnly title="More options" />,
    truncateContent: true,
    onClick: e => {
      alert('more option button clicked')
      e.stopPropagation()
    },
  }

  const getInvitedUsers = useCallback(async () => {
    if (!token) { return; }
    // let userList : any[] = [];

    const teamResponsePayload = await getTeamMembers(token, teamId, "userId");

    //console.log(teamResponsePayload);

    // for (let member of teamResponsePayload.value) {
    //   const userPayload = await getUser(
    //     token, 
    //     member.userId,
    //     "companyName,createdDateTime,displayName,externalUserState,externalUserStateChangeDateTime,id,mail,userType"
    //   )

    //   userList.push(userPayload);
      //.then(userPayload => {
      //   console.log(userPayload);

      //   const user = userPayload.value;

      //   let statusIndicator;
      //   if (user.externalUserState === null) {
      //     statusIndicator = (<Status state="unknown" title="unknown" />);
      //   } else if (user.externalUserState === "PendingAcceptance") {
      //     statusIndicator = (<Status state="error" title="error" />);
      //   } else if (user.externalUserState === "Accepted") {
      //     statusIndicator = (<Status state="success" title="success" />);
      //   }

      //   userList.push({
      //     key: user.id,
      //     items: [
      //       {
      //         content: statusIndicator,
      //         key: `status-${user.id}`
      //       },
      //       {
      //         content: user.displayName,
      //         key: `displayName-${user.id}`
      //       },
      //       {
      //         content: user.mail,
      //         key: `mail-${user.id}`
      //       },
      //       {
      //         content: user.userType,
      //         key: `userType-${user.id}`
      //       },
      //       {
      //         content: user.externalUserState,
      //         key: `externalUserState-${user.id}`
      //       },
      //       {
      //         content: user.createdDateTime,
      //         key: `createdDateTime-${user.id}`
      //       },
      //       {
      //         content: user.externalUserStateChangeDateTime,
      //         key: `externalUserStateChangeDateTime-${user.id}`
      //       },
      //       {
      //         key: `more-${user.id}`,
      //         ...moreOptionCell
      //       }
      //     ]
      //   })
      // });
    // }

    const responsePayload = await getUsers(
      token,
      "companyName,createdDateTime,displayName,externalUserState,externalUserStateChangeDateTime,id,mail,userType&$filter=userType eq 'guest'"
    );
    console.log(responsePayload);

    const userResponse = responsePayload.value.map((user: any) => {
      let statusIndicator;
      if (user.externalUserState === "PendingAcceptance") {
        statusIndicator = (<Status state="error" title="error" />);
      } else if (user.externalUserState === "Accepted") {
        statusIndicator = (<Status state="success" title="success" />);
      } else {
        statusIndicator = (<Status state="unknown" title="unknown" />);
      }
      
      return {
        key: user.id,
        items: [
          {
            content: statusIndicator,
            key: `status-${user.id}`
          },
          {
            content: user.displayName,
            key: `displayName-${user.id}`
          },
          {
            content: user.mail,
            truncateContent: true,
            key: `mail-${user.id}`
          },
          {
            content: user.userType,
            key: `userType-${user.id}`
          },
          {
            content: user.externalUserState,
            truncateContent: true,
            key: `externalUserState-${user.id}`
          },
          {
            content: user.createdDateTime,
            truncateContent: true,
            key: `createdDateTime-${user.id}`
          },
          {
            content: user.externalUserStateChangeDateTime,
            truncateContent: true,
            key: `externalUserStateChangeDateTime-${user.id}`
          },
          {
            key: `more-${user.id}`,
            ...moreOptionCell
          }
        ]
      }
    });

    setRows(userResponse);
  }, [token]);

  useEffect(() => {
    getInvitedUsers();
  }, [token]);
  
  return (
    <Fragment>
      <Flex column fill={true}>
        <Header as="h2" content="Invited external users" />
      
        <Table 
          variables={{ 
            cellContentOverflow: "none"
          }}
          header={header}
          rows={rows}
          styles={{
            width: '100%'
          }}
        />
      </Flex>
    </Fragment>
  );
}