import * as React from "react";
import { Fragment, useEffect, useState, useCallback } from "react";
import { useTeams } from "msteams-react-base-component";
import {
    Accordion, Card, Input, Flex, Grid, Loader, Skeleton, Text
} from "@fluentui/react-northstar";
import { SearchIcon } from "@fluentui/react-icons-northstar";
import {
    getUser, getTeamMembers, deleteUser, removeTeamMember,
    getCurrentUser, getUserPresence, getUserPhoto
} from "../services/GraphService";
import { getUserByEmail } from "../services/PwCService";
import { InviteDialog } from "./InviteDialog";
import { MemberCard } from "./uiComponents/MemberCard";

const CardHeader = () => {
    return (
        <Grid columns="6" style={{ 
            columnGap: "32px",
            padding: "0 1rem"
        }} >
            <Flex hAlign="start" vAlign="center">
                <Text content="Name" />
            </Flex>
            <Flex hAlign="start" vAlign="center">
                <Text content="User Type" />
            </Flex>
            <Flex hAlign="start" vAlign="center">
                <Text content="Status" />
            </Flex>
            <Flex hAlign="start" vAlign="center">
                <Text content="Date Added" />
            </Flex>
            <Flex hAlign="start" vAlign="center">
                <Text content="Role" />
            </Flex>
            <Flex></Flex>
        </Grid>
    );
}

export function MembersView(props) {
    const [ownerRows, setOwnerRows] = useState<any[] | undefined>();
    const [memberRows, setMemberRows] = useState<any[] | undefined>();
    const [pendingRows, setPendingRows] = useState<any[] | undefined>();
    const [teamMembers, setTeamMembers] = useState<any[]>([]);
    const [activePanels, setActivePanels] = useState<number[]>([]);
    const [memberType, setMemberStatus] = useState<number>();
    const token = props.token;
    const teamId = props.teamId;

    const isLoading = () => {
        if ((!ownerRows || ownerRows.length === 0) && 
            (!memberRows || memberRows.length === 0) && 
            (!pendingRows || pendingRows.length === 0)) {
            return true;
        } 
        return false;
    }

    const getTeamGuests = useCallback(async () => {
        if (!token) { return; }

        const responsePayload = await getTeamMembers(token, teamId);
        const teamMemberResponse = responsePayload.value.map((user: any) => {
            return ({
                id: user.id,
                userId: user.userId,
                roles: user.roles
            });
        });
        const userData = await getCurrentUser(token)
        const userEmail = userData.mail; // email needed to get user specific data from db
        
        const userKey = await getUserByEmail(userEmail);
        const userParams = userKey.data.length; // data from query that holds: id, firstname, lastname, email, permission

        setMemberStatus(userParams);
        setTeamMembers(teamMemberResponse);
    }, [token]);

    const handleTeamMemberRemove = async (memberId : string) => {
        await removeTeamMember(token, teamId, memberId);
        // setRows([]);
        // getTeamGuests();
    };

    const handleDeleteUser = async (userId : string) => {
        await deleteUser(token, userId);
        // setRows([]);
        // getTeamGuests();
    };

    const getUsersById = useCallback(async () => {
        if (!token) { return; }

        const ownerUserRows: any[] = [];
        const memberUserRows: any[] = [];
        const pendingUserRows: any[] = [];

        for (const teamMember of teamMembers) {
            const user = await getUser(
                token,
                teamMember.userId,
                "companyName,createdDateTime,displayName,externalUserState,id,mail,userType"
            );
            
            const indivUserPresence = await getUserPresence(
                token,
                teamMember.userId
            );

            const indivUserPhoto = await getUserPhoto(
                token,
                teamMember.userId
            );

            let splitDate = user.createdDateTime.split("-");
            const createdDate = `${splitDate[1]}/${splitDate[2].split("T")[0]}/${splitDate[0]}`;
            
            let formatStatus = user.externalUserState === "PendingAcceptance" ? "Pending Acceptance" : user.externalUserState;

            const memberRow = <MemberCard 
                userImage = {indivUserPhoto}
                userName = {user.displayName}
                userType = {user.userType}
                userStatus = {formatStatus}
                dateAdded = {createdDate}
                userRole = {teamMember.roles}
                userEmail = {user.mail}
                userPresence = {indivUserPresence.activity}
            />

            if (teamMember.roles.includes("owner")) {
                ownerUserRows.push(memberRow);
            } else if (user.externalUserState === "PendingAcceptance") {
                pendingUserRows.push(memberRow);
            } else {
                if (teamMember.roles.includes("guest")) {
                    memberUserRows.push(memberRow);
                }
                else{
                    memberUserRows.push(memberRow);
                }
                
            }
        }
        setOwnerRows(ownerUserRows);
        setMemberRows(memberUserRows);
        setPendingRows(pendingUserRows);
    }, [teamMembers]);

    useEffect(() => {
        getTeamGuests();
    }, [token]);

    useEffect(() => {
        getUsersById();
    }, [teamMembers]);

    useEffect(() => {
        let panels: number[] = [];
        if (ownerRows && ownerRows.length !== 0) {
            panels.push(0);
        } 
        if (memberRows && memberRows.length !== 0) {
            panels.push(1);
        }
        if (pendingRows && pendingRows.length !== 0) {
            panels.push(2);
        }
        setActivePanels(panels);
    }, [ownerRows, memberRows, pendingRows]);

    /**
     * Toggles accordion panels when panel titles are clicked
     * @param panelIndex Index of panel title clicked
     */
    const handlePanelClick = (panelIndex : number) => {
        if (activePanels.includes(panelIndex)) {
            setActivePanels(activePanels.filter(panel => panel !== panelIndex));
        } else {
            setActivePanels([...activePanels, panelIndex]);
        }
    }

    const MemberAccordion = () => {
        return (
            <Accordion activeIndex={activePanels} panels={
                [
                    {
                        title: {
                            content: (
                                <span>
                                    <Text weight="bold" disabled={ownerRows?.length === 0 ? true : false} content="Owners " />
                                    <Text disabled={ownerRows?.length === 0 ? true : false} content={`(${ownerRows?.length})`} />
                                </span>
                            ),
                            disabled: ownerRows?.length === 0 ? true : false,
                            onClick: () => handlePanelClick(0)
                        },
                        content:(
                            <Flex column gap="gap.smaller">
                                <CardHeader />
                                {ownerRows}
                            </Flex>
                        )
                    },
                    {
                        title: {
                            content: (
                                <span>
                                    <Text weight="bold" disabled={memberRows?.length === 0 ? true : false} content="Members and Guests " />
                                    <Text disabled={memberRows?.length === 0 ? true : false} content={`(${memberRows?.length})`} />
                                </span>
                            ),
                            disabled: memberRows?.length === 0 ? true : false,
                            onClick: () => handlePanelClick(1)
                        },
                        content: (
                            <Flex column gap="gap.smaller">
                                <CardHeader />
                                {memberRows}
                            </Flex>
                        )
                    },
                    {
                        title: {
                            content: (
                                <span>
                                    <Text weight="bold" disabled={pendingRows?.length === 0 ? true : false} content="Pending Acceptance " />
                                    <Text disabled={pendingRows?.length === 0 ? true : false} content={`(${pendingRows?.length})`} />
                                </span>
                            ),
                            disabled: pendingRows?.length === 0 ? true : false,
                            onClick: () => handlePanelClick(2)
                        },
                        content: (
                            <Flex column gap="gap.smaller">
                                <CardHeader />
                                {pendingRows}
                            </Flex>
                        )
                    }
                ]
            } />
        );
    }

    const MemberLoading = () => {
        const CardLoading = () => {
            return (
                <Card fluid>
                    <Flex vAlign="center" gap="gap.large">
                        <Skeleton.Avatar size="large" />
                        <Skeleton.Line width="80%" />
                    </Flex>
                </Card>
            );
        }

        return (
            <Skeleton animation="pulse">
                <Flex column gap="gap.medium">
                    <Skeleton.Line width="6rem" />
                    <CardLoading />
                    <Skeleton.Line width="6rem" />
                    <CardLoading />
                    <CardLoading />
                    <Skeleton.Line width="6rem" />
                    <CardLoading />
                    <CardLoading />
                </Flex>
            </Skeleton>
        );
    }

    return (
        <Fragment>
            
            <Flex column fill={true} gap="gap.large">
                <Flex space="between">
                    <Input icon={<SearchIcon />} placeholder="Search for members" />
                    { memberType === 1 && 
                        <InviteDialog token={token} teamId={teamId} teamName={props.teamName}/>
                    }
                </Flex>

                {/* { isLoading() && <Loader label="Loading members..." /> } */}
                { isLoading() && <MemberLoading /> }
                { !isLoading() && <MemberAccordion /> }
            </Flex>
        </Fragment>
    );
}
