import * as React from "react";
import { Fragment, useEffect, useState, useCallback } from "react";
import {
    Accordion, Avatar, Card, Button, Flex, Grid, Input, Text
} from "@fluentui/react-northstar";
import { getCurrentUser } from "../services/GraphService";
import { getApproverApprovals, getApproverByEmail, updateApprovalStatus, updateUserPermissions, getUserApprovalsByStatus } from "../services/PwCService";

export function ApprovalsView(props) {
    const [pendingApprovals, setPendingApprovals] = useState<any[]>([]);
    const [approvedApprovals, setApprovedApprovals] = useState<any[]>([]);
    const [rejectedApprovals, setRejectedApprovals] = useState<any[]>([]);
    const [pendingUserApprovals, setUserPendingApprovals] = useState<any[]>([]);
    const [approvedUserApprovals, setUserApprovedApprovals] = useState<any[]>([]);
    const [rejectedUserApprovals, setUserRejectedApprovals] = useState<any[]>([]);
    const token = props.token;
    
    /**
     * Approve approvals and update inviter permissions
     * @param approvalId Used to update approval
     * @param inviterId Used to update inviter permissions
     * @param inviterPermissions Inviter permissions
     * @param approverId Used to update inviter permissions
     */
    const handleApprove = async (approvalId, inviterId, inviterPermissions, approverId) => {
        const approverResponse = updateApprovalStatus(approvalId, 2);
        const permissions = new Set(inviterPermissions.split(","));
        permissions.add(approverId);
        const userResponse = updateUserPermissions(inviterId, Array.from(permissions));
        getApprovals();
    };

    /**
     * Reject approvals and revoke inviter permissions
     * @param approvalId Used to update approval
     * @param inviterId Used to update inviter permissions
     * @param inviterPermissions Inviter permissions
     * @param approverId Used to update inviter permissions
     */
    const handleReject = async (approvalId, inviterId, inviterPermissions, approverId) => {
        const approverResponse = updateApprovalStatus(approvalId, 0);
        const permissions = inviterPermissions.split(",");
        permissions.splice(permissions.indexOf(approverId), 1)
        const userResponse = updateUserPermissions(inviterId, permissions);
        getApprovals();
    };

    /**
     * Get the approvals for the current user
     */
    const getApprovals = useCallback(async () => {
        if (!token) { return; }

        const userResponse = await getCurrentUser(token)
        const userEmail = userResponse.mail; // Email of current user
        
        // input_email = userEmail;//add: use it in the UpdateApprovalStatus function
        // get the user approvals first
        const pendingPayload = await getUserApprovalsByStatus(userEmail, 1);
        const pendingResponseUser = pendingPayload.data;
        const approvedPayload = await getUserApprovalsByStatus(userEmail, 2);
        const approvedResponseUser = approvedPayload.data;
        const rejectedPayload = await getUserApprovalsByStatus(userEmail, 0);
        const rejectedResponseUser = rejectedPayload.data;
        setUserPendingApprovals(pendingResponseUser);
        setUserApprovedApprovals(approvedResponseUser);
        setUserRejectedApprovals(rejectedResponseUser);


        
        const approverResponse = await getApproverByEmail(userEmail); // Check if current user is an approver
        const approver = approverResponse.data[0];

        /** 
         * If they are an approver, find relevant approvals
         * TODO: Add splash screen if user is a non-approver, telling them they do not have access?
         */
        if (approver) {
            // Find approvals in database
            const pendingPayload = await getApproverApprovals(approver.email, 1);
            const pendingResponse = pendingPayload.data;
            const approvedPayload = await getApproverApprovals(approver.email, 2);
            const approvedResponse = approvedPayload.data;
            const rejectedPayload = await getApproverApprovals(approver.email, 0);
            const rejectedResponse = rejectedPayload.data;
            setPendingApprovals(pendingResponse);
            setApprovedApprovals(approvedResponse);
            setRejectedApprovals(rejectedResponse);
        }
    }, [token]);

    useEffect(() => {
        getApprovals();
    }, [token]);

    const ApprovalCard = (approval) => {
        return (
            <Card fluid id={`approval_${approval.id}`}>
                <Card.Header>
                    <Flex gap="gap.small">
                        <Avatar name={`${approval.inviterFirst} ${approval.inviterLast}`} />
                        <Flex column>
                            <Text content={`${approval.inviterFirst} ${approval.inviterLast}`} weight="bold" />
                            <Text content={approval.inviterEmail} />
                        </Flex>
                    </Flex>
                </Card.Header>
                <Card.Body style={{
                    padding: "0 2.6rem"
                }}>
                    <Flex gap="gap.small">
                        <Flex.Item size="size.quarter">
                            <Text weight="bold" content="Team" />
                        </Flex.Item>
                        <Flex.Item >
                            <Text content={approval.team} />
                        </Flex.Item>
                    </Flex>
                    <Flex gap="gap.small">
                        <Flex.Item size="size.quarter">
                            <Text weight="bold" content="Company" />
                        </Flex.Item>
                        <Flex.Item >
                            <Text content={approval.company} />
                        </Flex.Item>
                    </Flex>
                    <Flex gap="gap.small">
                        <Flex.Item size="size.quarter">
                            <Text weight="bold" content="Domain" />
                        </Flex.Item>
                        <Flex.Item >
                            <Text content={approval.domain} />
                        </Flex.Item>
                    </Flex>
                </Card.Body>
                <Card.Footer>
                    <Flex space="around">
                        <Button content="Approve" onClick={() => handleApprove(approval.id, approval.inviterId, approval.inviterPermissions, approval.approverId)}/>
                        <Button content="Reject"  onClick={() => handleReject(approval.id, approval.inviterId, approval.inviterPermissions, approval.approverId)} />
                    </Flex>
                </Card.Footer>
            </Card>
        );
    }

    const ApprovalCardRevoke = (approval) => {
        return (
            <Card fluid id={`approval_${approval.id}`}>
                <Card.Header>
                    <Flex gap="gap.small">
                        <Avatar name={`${approval.inviterFirst} ${approval.inviterLast}`} />
                        <Flex column>
                            <Text content={`${approval.inviterFirst} ${approval.inviterLast}`} weight="bold" />
                            <Text content={approval.inviterEmail} />
                        </Flex>
                    </Flex>
                </Card.Header>
                <Card.Body style={{
                    padding: "0 2.6rem"
                }}>
                    <Flex gap="gap.small">
                        <Flex.Item size="size.quarter">
                            <Text weight="bold" content="Team" />
                        </Flex.Item>
                        <Flex.Item >
                            <Text content={approval.team} />
                        </Flex.Item>
                    </Flex>
                    <Flex gap="gap.small">
                        <Flex.Item size="size.quarter">
                            <Text weight="bold" content="Company" />
                        </Flex.Item>
                        <Flex.Item >
                            <Text content={approval.company} />
                        </Flex.Item>
                    </Flex>
                    <Flex gap="gap.small">
                        <Flex.Item size="size.quarter">
                            <Text weight="bold" content="Domain" />
                        </Flex.Item>
                        <Flex.Item >
                            <Text content={approval.domain} />
                        </Flex.Item>
                    </Flex>
                </Card.Body>
                <Card.Footer>
                    <Flex space="around">
                        <Button content="Revoke Permissions"  onClick={() => handleReject(approval.id, approval.inviterId, approval.inviterPermissions, approval.approverId)} />
                    </Flex>
                </Card.Footer>
            </Card>
        );
    }

    const ApprovalCardApprove = (approval) => {
        return (
            <Card fluid id={`approval_${approval.id}`}>
                <Card.Header>
                    <Flex gap="gap.small">
                        <Avatar name={`${approval.inviterFirst} ${approval.inviterLast}`} />
                        <Flex column>
                            <Text content={`${approval.inviterFirst} ${approval.inviterLast}`} weight="bold" />
                            <Text content={approval.inviterEmail} />
                        </Flex>
                    </Flex>
                </Card.Header>
                <Card.Body style={{
                    padding: "0 2.6rem"
                }}>
                    <Flex gap="gap.small">
                        <Flex.Item size="size.quarter">
                            <Text weight="bold" content="Team" />
                        </Flex.Item>
                        <Flex.Item >
                            <Text content={approval.team} />
                        </Flex.Item>
                    </Flex>
                    <Flex gap="gap.small">
                        <Flex.Item size="size.quarter">
                            <Text weight="bold" content="Company" />
                        </Flex.Item>
                        <Flex.Item >
                            <Text content={approval.company} />
                        </Flex.Item>
                    </Flex>
                    <Flex gap="gap.small">
                        <Flex.Item size="size.quarter">
                            <Text weight="bold" content="Domain" />
                        </Flex.Item>
                        <Flex.Item >
                            <Text content={approval.domain} />
                        </Flex.Item>
                    </Flex>
                </Card.Body>
                <Card.Footer>
                    <Flex space="around">
                        <Button content="Approve" onClick={() => handleApprove(approval.id, approval.inviterId, approval.inviterPermissions, approval.approverId)}/>                    
                    </Flex>
                </Card.Footer>
            </Card>
        );
    }


    const UserCard = (approval) => {
        return (
            <Card fluid id={`approval_${approval.id}`}>
                <Card.Header>
                    <Flex gap="gap.small">
                        <Avatar name={`${approval.inviterFirst} ${approval.inviterLast}`} />
                        <Flex column>
                            <Text content={`${approval.inviterFirst} ${approval.inviterLast}`} weight="bold" />
                            <Text content={approval.inviterEmail} />
                        </Flex>
                    </Flex>
                </Card.Header>
                <Card.Body style={{
                    padding: "0 2.6rem"
                }}>
                    <Flex gap="gap.small">
                        <Flex.Item size="size.quarter">
                            <Text weight="bold" content="Team" />
                        </Flex.Item>
                        <Flex.Item >
                            <Text content={approval.team} />
                        </Flex.Item>
                    </Flex>
                    <Flex gap="gap.small">
                        <Flex.Item size="size.quarter">
                            <Text weight="bold" content="Company" />
                        </Flex.Item>
                        <Flex.Item >
                            <Text content={approval.company} />
                        </Flex.Item>
                    </Flex>
                    <Flex gap="gap.small">
                        <Flex.Item size="size.quarter">
                            <Text weight="bold" content="Domain" />
                        </Flex.Item>
                        <Flex.Item >
                            <Text content={approval.domain} />
                        </Flex.Item>
                    </Flex>
                </Card.Body>
            </Card>
        );
    }

    return (
        <Fragment> 
            <Flex column fill={true} gap="gap.large">
                <Accordion defaultActiveIndex={[0]} panels={
                    [{ 
                        title: {
                        content: (
                            <span>
                                <Text weight="bold"  content="User Approvals " />
                            </span>
                        ),
                    },
                    content: (<Accordion defaultActiveIndex={[0]} panels={
                        [{
                            title: {
                                content: (
                                    <span>
                                        <Text weight="bold" disabled={pendingUserApprovals.length === 0 ? true : false} content="Pending" />
                                        <Text disabled={pendingUserApprovals.length === 0 ? true : false} content={`(${pendingUserApprovals.length})`} />
                                    </span>
                                ),
                                disabled: pendingUserApprovals.length === 0 ? true : false
                            },
                            content: (<Grid style={{columnGap:'32px', rowGap:'32px', marginLeft:'16rem', marginRight:'16rem'}} columns={2}>
                                {
                                    pendingUserApprovals.map(approval => {
                                        return UserCard(approval)
                                    })
                                }
                            </Grid>)
                        },
                        {
                            title: {
                                content: (
                                    <span>
                                        <Text weight="bold" disabled={approvedUserApprovals.length === 0 ? true : false} content="Approved" />
                                        <Text disabled={approvedUserApprovals.length === 0 ? true : false} content={`(${approvedUserApprovals.length})`} />
                                    </span>
                                ),
                                disabled: approvedUserApprovals.length === 0 ? true : false
                            },
                            content: (<Grid style={{columnGap:'32px', rowGap:'32px', marginLeft:'16rem', marginRight:'16rem'}} columns={2}>
                                {
                                    approvedUserApprovals.map(approval => {
                                        return UserCard(approval)
                                    })
                                }
                            </Grid>)
                        },
                        {
                            title: {
                                content: (
                                    <span>
                                        <Text weight="bold" disabled={rejectedUserApprovals.length === 0 ? true : false} content="Rejected" />
                                        <Text disabled={rejectedUserApprovals.length === 0 ? true : false} content={`(${rejectedUserApprovals.length})`} />
                                    </span>
                                ),
                                disabled: rejectedUserApprovals.length === 0 ? true : false
                            },
                            content: (<Grid style={{columnGap:'32px', rowGap:'32px', marginLeft:'16rem', marginRight:'16rem'}} columns={2}>
                                {
                                    rejectedUserApprovals.map(approval => {
                                        return UserCard(approval)
                                    })
                                }
                            </Grid>)
                        }]
                    }/>
                    )},
                    {
                        title: {
                            content: (
                                <span>
                                    <Text weight="bold" content=" Approver Approvals " />
                                </span>
                            ),
                        },
                        content: (<Accordion defaultActiveIndex={[0]} panels={
                            [{
                                title: {
                                    content: (
                                        <span>
                                            <Text weight="bold" disabled={pendingApprovals.length === 0 ? true : false} content="Pending" />
                                            <Text disabled={pendingApprovals.length === 0 ? true : false} content={`(${pendingApprovals.length})`} />
                                        </span>
                                    ),
                                    disabled: pendingApprovals.length === 0 ? true : false
                                },
                                content: (<Grid style={{columnGap:'32px', rowGap:'32px', marginLeft:'16rem', marginRight:'16rem'}} columns={2}>
                                    {
                                        pendingApprovals.map(approval => {
                                            return ApprovalCard(approval)
                                        })
                                    }
                                </Grid>)
                            },
                            {
                                title: {
                                    content: (
                                        <span>
                                            <Text weight="bold" disabled={approvedApprovals.length === 0 ? true : false} content="Approved" />
                                            <Text disabled={approvedApprovals.length === 0 ? true : false} content={`(${approvedApprovals.length})`} />
                                        </span>
                                    ),
                                    disabled: approvedApprovals.length === 0 ? true : false
                                },
                                content: (<Grid style={{columnGap:'32px', rowGap:'32px', marginLeft:'16rem', marginRight:'16rem'}} columns={2}>
                                    {
                                        approvedApprovals.map(approval => {
                                            return ApprovalCardRevoke(approval)
                                        })
                                    }
                                </Grid>)
                            },
                            {
                                title: {
                                    content: (
                                        <span>
                                            <Text weight="bold" disabled={rejectedApprovals.length === 0 ? true : false} content="Rejected" />
                                            <Text disabled={rejectedApprovals.length === 0 ? true : false} content={`(${rejectedApprovals.length})`} />
                                        </span>
                                    ),
                                    disabled: rejectedApprovals.length === 0 ? true : false
                                },
                                content: (<Grid style={{columnGap:'32px', rowGap:'32px', marginLeft:'16rem', marginRight:'16rem'}} columns={2}>
                                    {
                                        rejectedApprovals.map(approval => {
                                            return ApprovalCardApprove(approval)
                                        })
                                    }
                                </Grid>)
                            }]
                        }/>
                        )}
                    ]
                } />
            </Flex>
        </Fragment>
    );
}
