import * as React from 'react';
import { Accordion, Button, Flex, Text, Avatar, Card, } from '@fluentui/react-northstar';

type Option = {
  userImage: string;
  userName: string;
  userType: string;
  userStatus: string;
  dateAdded: string;
  userRole: string;
  userDelete: boolean;
  shouldDelete: any;
};

const OwnerCard = ({userImage, userName, userType, userStatus, dateAdded, userRole, userDelete, shouldDelete}: Option) => {
    if (userDelete)
    {
        (shouldDelete=<Button style={{ backgroundColor: '#f00', color:'#fff' }} content="Delete?" />)
        //(shouldDelete=<Text content="&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;" />)
    } else {
        (shouldDelete=<Text content="&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;" />)
    }
    
    return (
    <Card aria-roledescription="card avatar" fluid>
          <Card.Header fitted>
          <Flex gap="gap.smaller" space="between">
                    <Flex gap="gap.small">
                      <Avatar
                        size="large"
                        image={userImage}
                        name={userName}
                        status="unknown"
                      />
                      <Flex column>
                      <Text size="smaller" content="&nbsp;" />
                      <Text content={userName} />
                      </Flex>
                    </Flex>
                    <Flex column>
                      <Text size="smaller" content="&nbsp;" />
                      <Flex>
                        <Text content={userType} />
                        {/* <Text content='&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;' /> */}
                      </Flex>
                    </Flex>
                    <Flex column>
                      <Text size="smaller" content="&nbsp;" />
                      <Flex>
                        <Text content={userStatus} />
                        <Text content="&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;" />
                      </Flex>
                    </Flex>
                    <Flex column>
                      <Text size="smaller" content="&nbsp;" />
                      <Flex>
                        <Text content={dateAdded} />
                        {/* <Text content="&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;" /> */}
                      </Flex>
                    </Flex>
                    <Flex column>
                      <Text size="smaller" content="&nbsp;" />
                      <Flex>
                        <Text content={userRole} style={{textTransform:"capitalize"}}/>
                      </Flex>
                    </Flex>
                    <Flex column>
                      <Text size="smaller" content="&nbsp;" />
                      
                            <Flex>
                            {shouldDelete}
                            </Flex>
                          
                          
                        
                    </Flex>
                </Flex>
            
          </Card.Header>
        </Card>
    )
};
  
  export default OwnerCard;