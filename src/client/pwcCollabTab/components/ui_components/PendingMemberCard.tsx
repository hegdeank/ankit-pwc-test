import * as React from 'react';
import { Button, Flex, Text, Avatar, Card, Grid} from '@fluentui/react-northstar';
import { AcceptIcon, CloseIcon, ArrowLeftIcon, PresenceStrokeIcon } from '@fluentui/react-icons-northstar';

type Option = {
  userImage: any;
  userName: string;
  userType: string;
  userStatus: string;
  dateAdded: string;
  userRole: string;
  userDelete: boolean;
  shouldDelete: any;
  userEmail: string;
  userPresence: string;
};

const PendingMemberCard = ({userImage, userName, userType, userStatus, dateAdded, userRole, userDelete, shouldDelete, userEmail, userPresence}: Option) => {
    if (userDelete)
    {
        // Need to Implement Delete Button
        (shouldDelete=<Button onClick={() => console.log("Delete Button Clicked")} style={{ backgroundColor: '#f00', color:'#fff' }} content="Delete?" />)
    } else {
        (shouldDelete=<Text content="&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;" />)
    }
    
    let statusColor = "green";
    let statusIcon = <AcceptIcon />
    let statusTitle = "Available"

    if (userPresence === "Available") {
      statusColor = "green";
      statusIcon = <AcceptIcon />
      statusTitle = "Available"
    } else if (userPresence === "Offline") {
      statusColor = "grey";
      statusIcon = <CloseIcon />
      statusTitle = "Offline";
    } else if (userPresence === "OutOfOffice") {
      statusColor = "purple";
      statusIcon = <ArrowLeftIcon />
      statusTitle = "OutOfOffice";
    } else {
      statusColor = "orange";
      statusIcon = <PresenceStrokeIcon />
      statusTitle = "Away";
    }    

    return (
      <Card aria-roledescription="card avatar" fluid>
        <Card.Header fitted>
          <Grid columns='6' style={{columnGap:'32px'}} >
            {/* User Avatar and User Display Name */}
            <Flex gap="gap.small">
              <Avatar
                size="large"
                image={userImage}
                name={userName}
                status={{
                  color: statusColor,
                  icon: statusIcon,
                  title: statusTitle,
                  size: 'large'
                }}
              />
              <Flex column>
                <Text size="smaller" content="&nbsp;" />
                <Text content={userName} />
              </Flex>
            </Flex>

            {/* User Type */}
            <Flex column>
              <Text size="smaller" content="&nbsp;" />
              <Flex>
                <Text content={userType} />
              </Flex>
            </Flex>

            {/* User Status */}
            <Flex column>
              <Text size="smaller" content="&nbsp;" />
              <Flex>
                <Text content={userStatus} />
              </Flex>
            </Flex>

            {/* Date Added to the Tenant */}
            <Flex column>
              <Text size="smaller" content="&nbsp;" />
              <Flex>
                <Text content={dateAdded} />
              </Flex>
            </Flex>

            {/* User Role */}
            <Flex column>
              <Text size="smaller" content="&nbsp;" />
              <Flex>
                <Text content={userRole} style={{textTransform:"capitalize"}}/>
              </Flex>
            </Flex>

            {/* Should Delete? */}
            <Flex column>
              <Text size="smaller" content="&nbsp;" />
              <Flex hAlign='end'>
                {shouldDelete}
              </Flex>
            </Flex>
          </Grid>            
        </Card.Header>
      </Card>
    )
};
  
  export default PendingMemberCard;