import * as React from "react";
import { Button, Flex, Text, Avatar, Card, Grid } from "@fluentui/react-northstar";
import ScheduleIcon  from '@material-ui/icons/Schedule';
import CheckCircleOutlineIcon from '@material-ui/icons/CheckCircleOutline';
import CloseIcon from '@material-ui/icons/Close';
import CheckIcon from '@material-ui/icons/Check';
import ArrowBackIcon from '@material-ui/icons/ArrowBack';
import RemoveIcon from '@material-ui/icons/Remove';


type Option = {
    userId: string;
    teamId: string;
    userImage: any;
    userName: string;
    userType: string;
    userStatus: string;
    dateAdded: string;
    userRole: string;
    userEmail: string;
    userPresence: string;
    canDelete: boolean;
    callback: (user: {id: string, teamId: string, name: string}) => Promise<void>;
};

export function MemberCard({ userId, teamId, userImage, userName, userType, userStatus, dateAdded, userRole, userEmail, userPresence, canDelete, callback }: Option) {
    let statusColor = "";
    let statusIcon;
    let statusTitle = "";

    if (userPresence === "Available") {
        statusColor = "green";
        statusIcon = <CheckIcon />;
        statusTitle = "Available";
    } else if (userPresence === "OutOfOffice, Offline"){
        statusColor = "purple";
        statusIcon = <ArrowBackIcon />;
        statusTitle = "OutOfOffice";
    } else if (userPresence === "Offline") {
        statusColor = "grey";
        statusIcon = <CloseIcon />;
        statusTitle = "Offline";
    } else if ((userPresence === "Busy") || (userPresence === "InACall") || (userPresence === "InAConferenceCall") || (userPresence === "InAMeeting")){
        statusColor = "red";
        statusTitle = "Busy";
    } else if ((userPresence === "DoNotDisturb") || (userPresence === "Presenting") || (userPresence === "UrgentInteruptionsOnly")) {
        statusColor = "red";
        statusIcon = <RemoveIcon />
        statusTitle = "DoNotDisturb";
    } else {
        statusColor = "orange";
        statusIcon = <ScheduleIcon />;
        statusTitle = "Away";
    }

    let status;
    
    if (statusIcon === "") {
        status = {
            color: statusColor,
            title: statusTitle,
            size: "large"
        }
    } else {
        status = {
            color: statusColor,
            icon: statusIcon,
            title: statusTitle,
            size: "large"
        }
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
                            status = {status}
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
                        {(userRole.includes("guest") && canDelete) && (
                            <Button
                                size="small"
                                onClick={() => callback({id: userId, teamId: teamId, name: userName})}
                                content="Delete"
                            />
                        )}
                    </Flex>

                </Grid>
            </Card.Header>
        </Card>
    );
};
