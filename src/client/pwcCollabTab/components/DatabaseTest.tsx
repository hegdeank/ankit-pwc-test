import * as React from "react";
import { Fragment, useEffect, useState } from "react";
import { useTeams } from "msteams-react-base-component";
import {
    Button, Table, FlexItem,
    Header, Flex, Loader, Form, FormInput, FormButton
} from "@fluentui/react-northstar";
import { MoreIcon } from "@fluentui/react-icons-northstar";

import { getApprovers, getApproverByDomain, addApprover } from "../services/PwCService";

export function DatabaseTest(props) {
    const [{ theme, context }] = useTeams();
    const [rows, setRows] = useState<any[]>([]);
    const [firstName, setFirstName] = useState<string | undefined>("");
    const [lastName, setLastName] = useState<string | undefined>("");
    const [email, setEmail] = useState<string | undefined>("");
    const [domain, setDomain] = useState<string | undefined>("");
    const [company, setCompany] = useState<string | undefined>("");
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
                content: "Domain",
                key: "domain"
            },
            {
                content: "Company",
                key: "company"
            },
            {
                key: "more options",
                "aria-label": "options"
            }
        ]
    };

    useEffect(() => {
        getApproverRows();
    }, []);

    const getApproverRows = async () => {
        const responsePayload = await getApprovers();
        const approverRows = responsePayload.data.map(approver => ({
            key: approver.id,
            items: [
                {
                    content: `${approver.firstname} ${approver.lastname}`,
                    key: `name-${approver.id}`
                },
                {
                    content: `${approver.email}`,
                    key: `email-${approver.id}`
                },
                {
                    content: `${approver.domain}`,
                    key: `domain-${approver.id}`
                },
                {
                    content: `${approver.company}`,
                    key: `company-${approver.id}`
                },
                {
                    key: `more-${approver.id}`,
                    content: <Button tabIndex={-1} icon={<MoreIcon />} circular text iconOnly title="More options" />,
                    truncateContent: true
                }
            ]
        }));
        setRows(approverRows);
        console.log(responsePayload);
    };

    const handleSubmit = async (event : any, data: any) => {
        const responsePayload = await addApprover({
            firstname: firstName,
            lastname: lastName,
            email: email,
            domain: domain,
            company: company
        });
        setFirstName("");
        setLastName("");
        setEmail("");
        setDomain("");
        setCompany("");
        getApproverRows();
    }

    return (
        <Fragment>
            <Flex column fill={true}>
                <Header as="h2" content="Database Test for Approvers" />
                
                <Flex>
                    <Flex.Item size="size.quarter">
                        <Form onSubmit={handleSubmit}>
                            <Header as="h3" content="Add new approver" />
                            <FormInput
                                label="First Name"
                                name="firstname"
                                id="first-name"
                                value={firstName}
                                onChange={(e, value) => setFirstName(value?.value)}
                                required
                            />
                            <FormInput
                                label="Last Name"
                                name="lastname"
                                id="last-name"
                                value={lastName}
                                onChange={(e, value) => setLastName(value?.value)}
                                required
                            />
                            <FormInput
                                label="Email"
                                name="email"
                                id="email"
                                value={email}
                                onChange={(e, value) => setEmail(value?.value)}
                                required
                            />
                            <FormInput
                                label="Domain"
                                name="domain"
                                id="domain"
                                value={domain}
                                onChange={(e, value) => setDomain(value?.value)}
                                required
                            />
                            <FormInput
                                label="Company"
                                name="company"
                                id="company"
                                value={company}
                                onChange={(e, value) => setCompany(value?.value)}
                                required
                            />
                            <FormButton content="Submit" />
                        </Form>
                    </Flex.Item>

                    <Flex.Item>
                        <Table
                            variables={{
                                cellContentOverflow: "none"
                            }}
                            header={header}
                            rows={rows}
                            styles={{
                                width: "100%"
                            }}
                        />
                    </Flex.Item>
                </Flex>
                
            </Flex>
        </Fragment>
    );
}
