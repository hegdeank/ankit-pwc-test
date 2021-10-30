import * as React from "react";
import { useTeams } from "msteams-react-base-component";
import { useEffect, useState, useCallback } from "react";
import {
    Accordion, Button, Card, Dialog, Input, Flex, Grid, Skeleton, Text
} from "@fluentui/react-northstar";
import { SearchIcon, CloseIcon } from "@fluentui/react-icons-northstar";
import {
    getUser, getTeamMembers, deleteUser, removeTeamMember,
    getUserPresence, getUserPhoto
} from "../services/GraphService";
import { InviteDialog } from "./InviteDialog";
import { MemberCard } from "./uiComponents/MemberCard";


export function MembersView(props) {
    const [ownerRows, setOwnerRows] = useState<any[] | undefined>();
    const [memberRows, setMemberRows] = useState<any[] | undefined>();
    const [pendingRows, setPendingRows] = useState<any[] | undefined>();
    const [teamMembers, setTeamMembers] = useState<any[]>([]);
    const [activePanels, setActivePanels] = useState<number[]>([]);
    const [dialogOpen, setDialogOpen] = useState<boolean>(false);
    const [selectedUser, setSelectedUser] = useState<{id: string, teamId: string, name: string}>({id: "", teamId: "", name: ""});
    const [{ theme }] = useTeams();
    const token = props.token;
    const teamId = props.teamId;
    const teamName = props.teamName;
    const userType = props.userType;

    /** Returns true if the member rows are undefined or not yet populated */
    const isLoading = () => {
        if ((!ownerRows || ownerRows.length === 0) && 
            (!memberRows || memberRows.length === 0) && 
            (!pendingRows || pendingRows.length === 0)) {
            return true;
        } 
        return false;
    }

    /**
     * Gets team members for specified team
     */
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

        setTeamMembers(teamMemberResponse);
    }, [token]);

    const handleTeamMemberRemove = async (memberId : string) => {
        const removeResponse = await removeTeamMember(token, teamId, memberId);
        console.log(removeResponse);
        setOwnerRows(ownerRows?.filter(row => row.teamId !== memberId));
        setMemberRows(memberRows?.filter(row => row.teamId !== memberId));
        setPendingRows(pendingRows?.filter(row => row.teamId !== memberId));
        setDialogOpen(false);
    };

    const handleDeleteUser = async (userId : string) => {
        await deleteUser(token, userId);
        setOwnerRows(ownerRows?.filter(row => row.id !== userId));
        setMemberRows(memberRows?.filter(row => row.id !== userId));
        setPendingRows(pendingRows?.filter(row => row.id !== userId));
        setDialogOpen(false);
    };

    const handleDelete = async (user : {id: string, teamId: string, name: string}) => {
        setSelectedUser(user);
        setDialogOpen(true);
    };

    /**
     * Gets user representation of team members
     */
    const getUsersById = useCallback(async () => {
        if (!token) { return; }

        const ownerUserRows: any[] = [];
        const memberUserRows: any[] = [];
        const pendingUserRows: any[] = [];

        for (const teamMember of teamMembers) {
            const user = await getUser(
                token,
                teamMember.userId,
                "createdDateTime,displayName,externalUserState,id,mail,userType"
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

            // If you want to change the following please confirm with Ankit, this is needed for the User Role to say member
            let role = teamMember.roles;
            if (!((teamMember.roles.includes("owner")) || (user.externalUserState === "PendingAcceptance") || (teamMember.roles.includes("guest")))) {
                role = "member";
            }


            const memberRow = <MemberCard 
                userId={teamMember.userId}
                teamId={teamMember.id}
                userImage={indivUserPhoto}
                userName={user.displayName}
                userType={user.userType}
                userStatus={formatStatus}
                dateAdded={createdDate}
                userRole={role}
                userEmail={user.mail}
                userPresence={indivUserPresence.activity}
                canDelete={userType === 1}
                callback={handleDelete}
            />

            if (teamMember.roles.includes("owner")) {
                ownerUserRows.push({id: teamMember.userId, teamId: teamMember.id, row: memberRow});
            } else if (user.externalUserState === "PendingAcceptance") {
                pendingUserRows.push({id: teamMember.userId, teamId: teamMember.id, row: memberRow});
            } else {
                memberUserRows.push({id: teamMember.userId, teamId: teamMember.id, row: memberRow});
            }
        }

        setOwnerRows(ownerUserRows);
        setMemberRows(memberUserRows);
        setPendingRows(pendingUserRows);
    }, [teamMembers, userType]);

    useEffect(() => {
        getTeamGuests();
    }, [token]);

    useEffect(() => {
        setOwnerRows([]);
        setMemberRows([]);
        setPendingRows([]);
        getUsersById();
    }, [teamMembers, userType]);

    /**
     * Sets the active panels of the accordion
     */
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
    
    /** Header of fields for the member cards */
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

    /** Accordion of member cards */
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
                                { ownerRows?.map(row => row.row) }
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
                                { memberRows?.map(row => row.row) }
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
                                { pendingRows?.map(row => row.row) }
                            </Flex>
                        )
                    }
                ]
            } />
        );
    }

    /** Skeleton replacement for loading Accordion */
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

    const DeleteDialog= () => {
        return (
            <Dialog
                open={dialogOpen}
                onOpen={() => setDialogOpen(true)}
                onCancel={() => setDialogOpen(false)}
                header={`Delete ${selectedUser.name}`}
                headerAction={{
                    icon: <CloseIcon />,
                    title: 'Close',
                    onClick: () => setDialogOpen(false),
                }}
                content={
                    <Flex column gap="gap.large">
                        <Text content="Would you like to delete this user?" />
                        <Flex gap="gap.medium" hAlign="center">
                            <Button content="Delete From Team" onClick={() => handleTeamMemberRemove(selectedUser.teamId)} />    
                            <Button 
                                content="Delete From Organization"
                                primary
                                onClick={() => handleDeleteUser(selectedUser.id)}
                                style={{ backgroundColor: theme.siteVariables.colors.red[300] }} 
                            />
                        </Flex>
                    </Flex>
                }
            />
        );
    }

    return (
        <React.Fragment>
            <DeleteDialog />
            <Flex column fill={true} gap="gap.large">
                <Flex space="between">
                    <Input icon={<SearchIcon />} placeholder="Search for members" />
                    { userType === 1 && <InviteDialog token={token} teamId={teamId} teamName={teamName}/> }
                </Flex>
                { isLoading() ? <MemberLoading /> : <MemberAccordion /> }
            </Flex>
        </React.Fragment>
        
    );
}
