import * as React from "react";
import { Fragment, useEffect, useState, useCallback } from "react";
import { useTeams } from "msteams-react-base-component";
import {
    Avatar, Card, Button, Flex, Grid, Input, Text
} from "@fluentui/react-northstar";
import { SearchIcon } from "@fluentui/react-icons-northstar";
import { getCurrentUser } from "../services/GraphService";
import { getApproverApprovals, getApproverByEmail, updateApprovalStatus } from "../services/PwCService";

export function ApprovalsView(props) {
    const [approvals, setApprovals] = useState<any[]>([]);
    const token = props.token;
    
    /**
     * 
     * Update Status for table_approvals  SudoCodeTest
     */
    const updateApprovalStatusApproved = useCallback(async () => {
        if (!token) { return; }
        const userResponse = await getCurrentUser(token)
        const userEmail = userResponse.mail; // Email of current user
        var status="Accept";
        const approverResponse = await updateApprovalStatus(status,userEmail);
        console.log("check test");

    }, [token]);

    /**
     * 
     * Update Status for table_approvals  SudoCodeTest
     */
    const updateApprovalStatusDennied = useCallback(async () => {
        if (!token) { return; }
        const userResponse = await getCurrentUser(token)
        const userEmail = userResponse.mail; // Email of current user
        var status="Reject";
        const approverResponse = await updateApprovalStatus(status,userEmail);
        console.log("check test");
    
    }, [token]);


    /**
     * Get the approvals for the current user
     */
    const getApprovals = useCallback(async () => {
        if (!token) { return; }

        const userResponse = await getCurrentUser(token)
        const userEmail = userResponse.mail; // Email of current user
        
        const approverResponse = await getApproverByEmail(userEmail); // Check if current user is an approver
        const approver = approverResponse.data[0];

        /** 
         * If they are an approver, find relevant approvals
         * TODO: Add splash screen if user is a non-approver, telling them they do not have access?
         */
        if (approver) {
            // Find approvals in database
            const responsePayload = await getApproverApprovals(approver.email);
            const approvalResponse = responsePayload.data.map((approval: any) => {
                return {
                    id: approval.id,
                    email: approval.UsersEmail,
                    team: approval.teams_channel
                };
            });
    
            setApprovals(approvalResponse);
        }
    }, [token]);

    useEffect(() => {
        getApprovals();
    }, [token]);

    return (
        <Fragment> 
            <Flex column fill={true} gap="gap.large">
                <Flex space="between">
                    <Input icon={<SearchIcon />} placeholder="Search for members" />
                </Flex>
                
                <Grid columns={3}>
                    {
                        approvals.map(approval => {
                            return (
                                <Card fluid id={`approval_${approval.id}`}>
                                    <Card.Header>
                                        <Flex gap="gap.small">
                                            <Avatar square name={approval.team} />
                                            <Flex column>
                                                <Text content={approval.email} weight="bold" />
                                                <Text content={approval.team} weight="bold" />
                                            </Flex>
                                        </Flex>
                                    </Card.Header>
                                    <Card.Footer>
                                        <Flex space="around">
                                            <Button content="Accept" onClick={updateApprovalStatusApproved}/>
                                            <Button content="Reject"  onClick={updateApprovalStatusDennied} />
                                        </Flex>
                                    </Card.Footer>
                                </Card>
                            );
                        })
                    }
                </Grid>
            </Flex>
        </Fragment>
    );
}
