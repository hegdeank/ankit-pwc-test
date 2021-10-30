import * as React from "react";
import { useTeams } from "msteams-react-base-component";
import { Button, Flex, Text, Avatar, Card, Grid } from "@fluentui/react-northstar";
import { AcceptIcon, ArrowLeftIcon, CloseIcon, SubtractIcon } from "@fluentui/react-icons-northstar";



/* 
import ScheduleIcon  from '@material-ui/icons/Schedule';
import CheckCircleOutlineIcon from '@material-ui/icons/CheckCircleOutline';
import CloseIcon from '@material-ui/icons/Close';
import CheckIcon from '@material-ui/icons/Check';
import ArrowBackIcon from '@material-ui/icons/ArrowBack';
import RemoveIcon from '@material-ui/icons/Remove'; */


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
    const [{ theme, context }] = useTeams();
    let statusColor = "";
    let statusIcon;
    let statusTitle = "";
    let customIcon;

    if (userPresence === "Available") {
        statusColor = "green";
        customIcon = <AcceptIcon outline size="large"/>
        statusIcon = <AcceptIcon />;
        statusTitle = "Available";
    } else if (userPresence === "OffWork"){
        statusColor = "purple";
        customIcon = <ArrowLeftIcon outline size="large"/>
        statusTitle = "OffWork";
    } else if (userPresence === "Offline") {
        statusColor = theme.siteVariables.colors.grey[300];
        customIcon = <CloseIcon outline size="large"/>
        statusTitle = "Offline";
    } else if ((userPresence === "Busy") || (userPresence === "InACall") || (userPresence === "InAConferenceCall") || (userPresence === "InAMeeting")){
        statusColor = theme.siteVariables.colors.red[300];
        statusTitle = "Busy";
    } else if ((userPresence === "DoNotDisturb") || (userPresence === "Presenting") || (userPresence === "UrgentInteruptionsOnly")) {
        statusColor = theme.siteVariables.colors.red[300];
        customIcon = <SubtractIcon outline size="large"/>
        statusTitle = "DoNotDisturb";
    } else {
        statusColor = "orange";
        // There is no away icon in the Fluent UI Icons Package
        statusTitle = "Away";
    }

    let status;
    
    if (statusIcon === "") {
        status = {
            color: statusColor,
            title: statusTitle,
        }
    } else {
        status = {
            color: statusColor,
            icon: customIcon,
            title: statusTitle,
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
                                primary
                                size="small"
                                onClick={() => callback({id: userId, teamId: teamId, name: userName})}
                                style={{ backgroundColor: theme.siteVariables.colors.red[300] }}  // Sets Button Color to Red, as per UI Mockup
                                content="Delete"
                            />
                        )}
                    </Flex>

                </Grid>
            </Card.Header>
        </Card>
    );
};
