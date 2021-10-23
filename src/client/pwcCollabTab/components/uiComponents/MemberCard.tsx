import * as React from "react";
import { useTeams } from "msteams-react-base-component";
import { Button, Flex, Text, Avatar, Card, Grid } from "@fluentui/react-northstar";
import { AcceptIcon, CloseIcon, ArrowLeftIcon, PresenceStrokeIcon } from "@fluentui/react-icons-northstar";

type Option = {
  userImage: any;
  userName: string;
  userType: string;
  userStatus: string;
  dateAdded: string;
  userRole: string;
  userEmail: string;
  userPresence: string;
};

export function MemberCard({ userImage, userName, userType, userStatus, dateAdded, userRole, userEmail, userPresence }: Option) {
    const [{ theme, context }] = useTeams();
    let statusColor = "";
    let statusIcon;
    let statusTitle = "";

    if (userPresence === "Available") {
        statusColor = "green";
        statusIcon = <AcceptIcon />;
        statusTitle = "Available";
    } else if (userPresence === "Offline") {
        statusColor = "grey";
        statusIcon = <CloseIcon />;
        statusTitle = "Offline";
    } else if (userPresence === "OutOfOffice") {
        statusColor = "purple";
        statusIcon = <ArrowLeftIcon />;
        statusTitle = "OutOfOffice";
    } else {
        statusColor = "orange";
        statusIcon = <PresenceStrokeIcon />;
        statusTitle = "Away";
    }

    return (
        <Card aria-roledescription="card avatar" fluid>
            <Card.Header fitted>
                <Grid columns="6" style={{ columnGap: "32px" }} >
                    <Flex gap="gap.small" hAlign="start" vAlign="center">
                        <Avatar
                            size="large"
                            image={userImage}
                            name={userName}
                            status={{
                                color: statusColor,
                                icon: statusIcon,
                                title: statusTitle,
                                size: "large"
                            }}
                        />
                        <Text content={userName} />
                    </Flex>

                    <Flex hAlign="start" vAlign="center">
                        <Text content={userType} />
                    </Flex>

                    <Flex hAlign="start" vAlign="center">
                        <Text content={userStatus} />
                    </Flex>

                    <Flex hAlign="start" vAlign="center">
                        <Text content={dateAdded} />
                    </Flex>

                    <Flex hAlign="start" vAlign="center">
                        <Text content={userRole} style={{ textTransform: "capitalize" }}/>
                    </Flex>

                    <Flex hAlign="end" vAlign="center">
                        {userRole.includes("guest") && (
                            <Button primary
                                size="small"
                                onClick={() => console.log("Delete Button Clicked")} 
                                style={{ backgroundColor: theme.siteVariables.colors.red[300] }} 
                                content="Delete?" 
                            />
                        )}
                    </Flex>

                </Grid>
            </Card.Header>
        </Card>
    );
};
