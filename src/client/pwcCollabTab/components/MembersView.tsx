import * as React from "react";
import { Fragment, useEffect, useState, useCallback } from "react";
import { useTeams } from "msteams-react-base-component";
import {
    Accordion, Button, Dialog, Status, Table, Input,
    Header, Flex, Loader, Text
} from "@fluentui/react-northstar";
import { MoreIcon, ParticipantAddIcon, SearchIcon } from "@fluentui/react-icons-northstar";
import {
    getUser, getTeamMembers,
    deleteUser, removeTeamMember
} from "../services/GraphService";
import { InvalidTokenError } from "jwt-decode";

import { InviteDialog } from "./InviteDialog";

export function MembersView(props) {
    const [{ theme, context }] = useTeams();
    const [ownerRows, setOwnerRows] = useState<any[]>([]);
    const [memberRows, setMemberRows] = useState<any[]>([]);
    const [pendingRows, setPendingRows] = useState<any[]>([]);
    const [teamMembers, setTeamMembers] = useState<any[]>([]);
    const [activePanels, setActivePanels] = useState<number[]>([]);
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

            let splitDate = user.createdDateTime.split("-");
            const createdDate = `${splitDate[1]}/${splitDate[2].split("T")[0]}/${splitDate[0]}`;
            
            let formatStatus = user.externalUserState === "PendingAcceptance" ? "Pending Acceptance" : user.externalUserState;
            const row = {
                key: user.id,
                items: [
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
                            trigger={<Button tabIndex={-1} icon={<MoreIcon />} circular text iconOnly title="More options" />}
                        />,
                        truncateContent: true
                    }
                ]
            };

            if (teamMember.roles.includes("owner")) {
                ownerUserRows.push(row);
            } else if (user.externalUserState === "PendingAcceptance") {
                pendingUserRows.push(row);
            } else {
                memberUserRows.push(row);
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
    }, [ownerRows, memberRows, pendingRows])

    return (
        <Fragment>
            
            <Flex column fill={true} gap="gap.large">
                <Flex space="between">
                    <Input icon={<SearchIcon />} placeholder="Search for members" />
                    <InviteDialog token={token} teamId={teamId} teamName={props.teamName}/> 
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
                                disabled: ownerRows.length === 0 ? true : false
                            },
                            content:
                                <Table
                                    variables={{
                                        cellContentOverflow: "none"
                                    }}
                                    header={header}
                                    rows={ownerRows}
                                    styles={{
                                        width: "100%"
                                    }}
                                />
                            
                        },
                        {
                            title: {
                                content: (
                                    <span>
                                        <Text weight="bold" disabled={memberRows.length === 0 ? true : false} content="Members and Guests " />
                                        <Text disabled={memberRows.length === 0 ? true : false} content={`(${memberRows.length})`} />
                                    </span>
                                ),
                                disabled: memberRows.length === 0 ? true : false
                            },
                            content: 
                                <Table
                                    variables={{
                                        cellContentOverflow: "none"
                                    }}
                                    header={header}
                                    rows={memberRows}
                                    styles={{
                                        width: "100%"
                                    }}
                                />
                        },
                        {
                            title: {
                                content: (
                                    <span>
                                        <Text weight="bold" disabled={pendingRows.length === 0 ? true : false} content="Pending Acceptance " />
                                        <Text disabled={pendingRows.length === 0 ? true : false} content={`(${pendingRows.length})`} />
                                    </span>
                                ),
                                disabled: pendingRows.length === 0 ? true : false
                            },
                            content: 
                                <Table
                                    variables={{
                                        cellContentOverflow: "none"
                                    }}
                                    header={header}
                                    rows={pendingRows}
                                    styles={{
                                        width: "100%"
                                    }}
                                />
                        }
                    ]
                } />
            </Flex>
        </Fragment>
    );
}
