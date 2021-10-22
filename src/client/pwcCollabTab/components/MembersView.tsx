import * as React from "react";
import { Fragment, useEffect, useState, useCallback } from "react";
import { useTeams } from "msteams-react-base-component";
import {
    Accordion, Avatar, Button, Dialog, Status, Table, Input,
    Header, Flex, Loader, Text
} from "@fluentui/react-northstar";
import { MoreIcon, ParticipantAddIcon, SearchIcon } from "@fluentui/react-icons-northstar";
import {
    getUser, getTeamMembers,
    deleteUser, removeTeamMember,getCurrentUser
} from "../services/GraphService";
import { InvalidTokenError } from "jwt-decode";

import { InviteDialog } from "./InviteDialog";

import {  getUserByEmail, getApproverByEmail } from "../services/PwCService";

import OwnerCard from "./ui_components/OwnerCard";
import PendingMemberCard from "./ui_components/PendingMemberCard";
import MemberCard from "./ui_components/MemberCard";

export function MembersView(props) {
    const [{ theme, context }] = useTeams();
    const [ownerRows, setOwnerRows] = useState<any[]>([]);
    const [ownerUsers, setOwnerUsers] = useState<any[]>([]);
    const [memberUsers, setMemberUsers] = useState<any[]>([]);
    const [pendingUsers, setPendingUsers] = useState<any[]>([]);
    const [memberRows, setMemberRows] = useState<any[]>([]);
    const [pendingRows, setPendingRows] = useState<any[]>([]);
    const [teamMembers, setTeamMembers] = useState<any[]>([]);
    const [activePanels, setActivePanels] = useState<number[]>([]);
    const [memberType, setMemberStatus] = useState<number>();
    //const [approverType, setApproverStatus] = useState<number[]>([]);
    const token = props.token;
    const teamId = props.teamId;
    
    const header = {
        key: "header",
        items: [
            {
                content: "Name",
                key: "name"
            },
            {
                content: "E-Mail",
                key: "mail"
            },
            {
                content: "User Type",
                key: "type"
            },
            {
                content: "Status",
                key: "status"
            },
            {
                content: "Date Added",
                key: "created"
            },
            {
                content: "Role",
                key: "role"
            },
            {
                key: "more options",
                "aria-label": "options"
            }
        ]
    };

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
        console.log("User Status, If 1 then internal, if 0 then external: "+ userParams);
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

        // Users lists for Member Cards 
        const ownerUsers: any[] = []; // Owners of the team
        const memberUsers: any[] = []; // Non-Guest Members of the Team
        const guestUsers: any[] = []; // Guest Members of the Team
        const pendingUsers: any[] = []; // Users who have not accepte invite to team yet

        for (const teamMember of teamMembers) {
            const user = await getUser(
                token,
                teamMember.userId,
                "companyName,createdDateTime,displayName,externalUserState,id,mail,userType"
            );

            let splitDate = user.createdDateTime.split("-");
            const createdDate = `${splitDate[1]}/${splitDate[2].split("T")[0]}/${splitDate[0]}`;
            
            let formatStatus = user.externalUserState === "PendingAcceptance" ? "Pending Acceptance" : user.externalUserState;
            const row = {
                key: user.id,
                items: [
                    {
                        content: (
                            <Flex vAlign="center" gap="gap.small">
                                <Avatar name={user.displayName} />
                                <Text content={user.displayName} />
                            </Flex>
                        ),
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
                        content: formatStatus,
                        truncateContent: true,
                        key: `externalUserState-${user.id}`
                    },
                    {
                        content: createdDate,
                        truncateContent: true,
                        key: `createdDateTime-${user.id}`
                    },
                    {
                        content: user.role,
                        key: `role-${user.id}`
                    },
                    {
                        key: `more-${user.id}`,
                        // content: <Button tabIndex={-1} icon={<MoreIcon />} circular text iconOnly title="More options" />,
                        content: <Dialog
                            cancelButton="Cancel"
                            
                            content={
                                <Flex gap="gap.medium" hAlign="center" space="around">
                                    <Button content="Remove from Team" onClick={() => handleTeamMemberRemove(teamMember.id)}/>
                                    <Button
                                        content="Remove from Team and Organization"
                                        onClick={() => handleDeleteUser(user.id)}
                                        style={{
                                            backgroundColor: theme.siteVariables.colors.red[300]
                                        }}
                                    />
                                </Flex>
                            }
                            header="Remove Member"
                            trigger={<Button disabled={memberType === 0 ? true : false} tabIndex={-1} icon={<MoreIcon />} circular text iconOnly title="More options" />}
                        />,
                        truncateContent: true
                    }
                ]
            };

            if (teamMember.roles.includes("owner")) {
                ownerUserRows.push(row);
                // Add Owners to ownerUsers here
                ownerUsers.push(
                    <OwnerCard 
                        userImage = 'https://fabricweb.azureedge.net/fabric-website/assets/images/avatar/CarlosSlattery.jpg'
                        userName = {user.displayName}
                        userType = {user.userType}
                        //userStatus = "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"
                        userStatus = {formatStatus}
                        dateAdded = {createdDate}
                        userRole = {teamMember.roles}
                        userDelete={true}
                        shouldDelete=""

                    />)
            } else if (user.externalUserState === "PendingAcceptance") {
                pendingUserRows.push(row);
                // Add Pending Users to pendingUsers here
                pendingUsers.push(
                    <PendingMemberCard 
                        userImage = 'https://fabricweb.azureedge.net/fabric-website/assets/images/avatar/CarlosSlattery.jpg'
                        userName = {user.displayName}
                        userType = {user.userType}
                        //userStatus = "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"
                        userStatus = {formatStatus}
                        dateAdded = {createdDate}
                        userRole = {teamMember.roles}
                        userDelete={true}
                        shouldDelete=""

                    />)
            } else {
                if (teamMember.roles.includes("guest")){
                    // Add user to guestUsers here
                }
                else if (teamMember.roles.includes("member")){
                    // Add user to memberUsers here
                }
                memberUsers.push(
                    <MemberCard 
                        userImage = 'https://fabricweb.azureedge.net/fabric-website/assets/images/avatar/CarlosSlattery.jpg'
                        userName = {user.displayName}
                        userType = {user.userType}
                        //userStatus = "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"
                        userStatus = {formatStatus}
                        dateAdded = {createdDate}
                        userRole = {teamMember.roles}
                        userDelete={true}
                        shouldDelete=""

                    />)
                memberUserRows.push(row);
            }
        }
        setOwnerRows(ownerUserRows);
        setMemberRows(memberUserRows);
        setPendingRows(pendingUserRows);
        setOwnerUsers(ownerUsers);
        setMemberUsers(memberUsers);
        setPendingUsers(pendingUsers);
    }, [teamMembers]);

    useEffect(() => {
        getTeamGuests();
    }, [token]);

    useEffect(() => {
        getUsersById();
    }, [teamMembers]);

    useEffect(() => {
        let panels: number[] = [];
        if (ownerRows.length !== 0) {
            panels.push(0);
        } 
        if (memberRows.length !== 0) {
            panels.push(1);
        }
        if (pendingRows.length !== 0) {
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

    return (
        <Fragment>
            
            <Flex column fill={true} gap="gap.large">
                <Flex space="between">
                    <Input icon={<SearchIcon />} placeholder="Search for members" />
                    {memberType === 1 && (
                        <InviteDialog token={token} teamId={teamId} teamName={props.teamName}/>
                        )}
                </Flex>
                
                <Accordion activeIndex={activePanels} panels={
                    [
                        {
                            title: {
                                content: (
                                    <span>
                                        <Text weight="bold" disabled={ownerRows.length === 0 ? true : false} content="Owners " />
                                        <Text disabled={ownerRows.length === 0 ? true : false} content={`(${ownerRows.length})`} />
                                    </span>
                                ),
                                disabled: ownerRows.length === 0 ? true : false,
                                onClick: () => handlePanelClick(0)
                            },
                            content:(
                                // Add Card Content here for Owner Cards
                                <Flex column gap="gap.smaller">
                                    <Flex gap="gap.smaller" space="between">
                                        <Text content="Name" />
                                        <Text content="User Type" />
                                        <Text content="Status" />
                                        <Text content="Date Added" />
                                        <Text content="Role" />
                                        <Text content="&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;" />
                                    </Flex>

                                    {ownerUsers}
                                </Flex>
                            )
                        },
                        {
                            title: {
                                content: (
                                    <span>
                                        <Text weight="bold" disabled={memberRows.length === 0 ? true : false} content="Members and Guests " />
                                        <Text disabled={memberRows.length === 0 ? true : false} content={`(${memberRows.length})`} />
                                    </span>
                                ),
                                disabled: memberRows.length === 0 ? true : false,
                                onClick: () => handlePanelClick(1)
                            },
                            content: (
                                // Add Card Content here for Member Cards
                                <Flex column gap="gap.smaller">
                                    <Flex gap="gap.smaller" space="between">
                                        <Text content="Name" />
                                        <Text content="User Type" />
                                        <Text content="Status" />
                                        <Text content="Date Added" />
                                        <Text content="Role" />
                                        <Text content="&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;" />
                                    </Flex>

                                    {memberUsers}
                                </Flex>
                            )
                        },
                        {
                            title: {
                                content: (
                                    <span>
                                        <Text weight="bold" disabled={pendingRows.length === 0 ? true : false} content="Pending Acceptance " />
                                        <Text disabled={pendingRows.length === 0 ? true : false} content={`(${pendingRows.length})`} />
                                    </span>
                                ),
                                disabled: pendingRows.length === 0 ? true : false,
                                onClick: () => handlePanelClick(2)
                            },
                            content: (
                                // Add Card Content here for Pending Member Cards
                                <Flex column gap="gap.smaller">
                                    <Flex gap="gap.smaller" space="between">
                                        <Text content="Name" />
                                        <Text content="User Type" />
                                        <Text content="Status" />
                                        <Text content="Date Added" />
                                        <Text content="Role" />
                                        <Text content="&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;" />
                                    </Flex>

                                    {pendingUsers}
                                </Flex>
                            )
                        }
                    ]
                } />
            </Flex>
        </Fragment>
    );
}
