import * as React from "react";
import { Fragment, useEffect, useState, useCallback } from "react";
import { 
  Button, Status, Table, 
  Header, Flex, Loader 
} from "@fluentui/react-northstar";
import { MoreIcon } from '@fluentui/react-icons-northstar'
import { getUser, getTeamMembers } from "../GraphService";


export function GuestList(props) {
  const [rows, setRows] = useState<any[]>([]);      // Rows of table
  const [userIds, setUserIds] = useState<any>();  // User Ids of Team Members
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

  const getTeamGuests = useCallback(async () => {
    if (!token) { return; }
    const responsePayload = await getTeamMembers(token, teamId, "userId");
    const userResponse = responsePayload.value.map((user: any) => {
      return user.userId;
    });

    setUserIds(userResponse);
  }, [token]);

  const getUsersById = useCallback(async () => {
    if (!token) { return; }
    let userRows: any[] = [];

    for (let userId of userIds) {
      const user = await getUser(
        token, 
        userId,
        "companyName,createdDateTime,displayName,externalUserState,externalUserStateChangeDateTime,id,mail,userType"
      );
      
      // We're fetching only Invited Guests
      if (user.userType !== "Guest") {
        continue;
      }

      let statusIndicator;
      if (user.externalUserState === "PendingAcceptance") {
        statusIndicator = (<Status state="error" title="error" />);
      } else if (user.externalUserState === "Accepted") {
        statusIndicator = (<Status state="success" title="success" />);
      } else {
        statusIndicator = (<Status state="unknown" title="unknown" />);
      }

      let dte = user.createdDateTime.split("-");
      const date1 = dte[1]+"/"+dte[2].split("T")[0]+"/"+dte[0];
      dte = user.externalUserStateChangeDateTime.split("-");
      const date2 = dte[1]+"/"+dte[2].split("T")[0]+"/"+dte[0];
      
      userRows.push({
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
            content: date1,
            truncateContent: true,
            key: `createdDateTime-${user.id}`
          },
          {
            content: date2,
            truncateContent: true,
            key: `externalUserStateChangeDateTime-${user.id}`
          },
          {
            key: `more-${user.id}`,
            ...moreOptionCell
          }
        ]
      });
    }
    setRows(userRows);
  }, [userIds]);

  useEffect(() => {
    getTeamGuests();
  }, [token]);

  useEffect(() => {
    getUsersById();
  }, [userIds]);
  
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
        {rows.length === 0 && (
          <Loader />
        )}
      </Flex>
    </Fragment>
  );
}