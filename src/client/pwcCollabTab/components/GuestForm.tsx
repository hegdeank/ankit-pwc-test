import * as React from "react";
import { Fragment, useEffect, useState } from "react";
import {
    Button, Flex, Input, Form, FormField, Divider,
    Text, Header, Pill, PillGroup, TextArea
} from "@fluentui/react-northstar";
import { invite, addTeamMember, sendEmail } from "../services/GraphService";
// import { getApprover } from "../PwCService";

export function GuestForm(props) {
    const [guestsInput, setGuestsInput] = useState<string>("");
    const [inviteMessage, setInviteMessage] = useState<string>("");
    const [guests, setGuests] = useState<string[]>([]);
    const [error, setError] = useState<string>("");
    const [invitedPayloads, setInvitedPayloads] = useState<any[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [approversNotify, setApproversNotify] = useState<any[]>([]);
    const [approversRequest, setApproversRequest] = useState<any[]>([]);
    const token = props.token;
    const teamId = props.teamId;

    const handleGuestInput = (event : any, data: any) => {
        setGuestsInput(data.value);
    };
    const handleMessageInput = (event : any, data: any) => {
        setInviteMessage(data.value);
    };

    // On submit, guestInput will be separated out into individual strings,
    // delimited by commas, and added into guests.
    const handleSubmit = () => {
        const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        const guestSplit = guestsInput.split(",");
        const addGuest: Set<string> = new Set();
        const approvedDomains: Set<string> = new Set();
        let unapprovedDomains: Set<string> = new Set();
        const approversValid: Set<any> = new Set();
        let rejectGuest: string = "";
        let error: string = "";
        
        for (let guest of guestSplit) {
            guest = guest.trim().toLowerCase();
            if (re.test(guest)) {
                let domain = guest.split("@").pop();
                if (domain) {
                    addGuest.add(guest);
                    // if (!approvedDomains.has(domain)) {
                    //     const approver = getApprover(domain);
                    //     if (approver) {
                    //         console.log(`Approver found: ${approver.email}`);

                    //         addGuest.add(guest);
                    //         approvedDomains.add(domain);
                    //         approversValid.add({
                    //             email: approver.email,
                    //             company: approver.company,
                    //             name: `${approver.firstname} ${approver.lastname}`
                    //         });
                    //     } else {
                    //         console.log(`Approver not found for domain: ${domain}`);
                    //         rejectGuest += `${guest}, `;
                    //         unapprovedDomains.add(domain);
                    //     }
                    // } else {
                    //     console.log(`Approver found for domain: ${domain}`)
                    //     addGuest.add(guest);
                    // }
                }
            } else {
                rejectGuest += `${guest}, `;
            }
        }

        if (rejectGuest !== "") {
            error = "Enter in valid emails, delimited by commas, as input";
        } 
        if (unapprovedDomains.size !== 0) {
            if (error !== "") {
                error += ". ";
            }
            let formattedDomains = "";
            for (let domain of unapprovedDomains.values()) {
                formattedDomains += `${domain}, `
            }
            error += `Following domains are not yet approved: ${formattedDomains.slice(0, -2)}`;
        }
        
        setError(error);
        setLoading(false);
        setGuests([...guests, ...Array.from(addGuest.values())]);
        setApproversNotify([...approversNotify, ...Array.from(approversValid.values())]);
        setGuestsInput(rejectGuest.slice(0, -2));
    }

    // When a List Item is clicked, this function is called to remove the
    // selected item. The click event carries the name of the guest, and that
    // name is filtered out from the guests list.
    const handleRemove = (event : any, data: any) => {
        setGuests(guests.filter(guest => guest !== data.children));
    }

    // Here we can manipulate the message we are going to be sending to the user
    // make sure you check the grammer before changing it
    // Link: https://docs.microsoft.com/en-us/graph/api/resources/invitedusermessageinfo?view=graph-rest-1.0#json-representation
    const triggerInvite = async () => {
        if (!token) { return; }

        setLoading(true);

        for (let guest of guests) {
            const invitation = {
                invitedUserEmailAddress: guest,
                invitedUserMessageInfo: { customizedMessageBody: inviteMessage },
                sendInvitationMessage: true,
                inviteRedirectUrl: 'https://localhost:3000'
            }

            const responsePayload = await invite(token, invitation);
            setInvitedPayloads([...invitedPayloads, ...[responsePayload]]);
        }

        for (let approver of approversNotify) {
            console.log(approver);
            sendEmailApproverNotify(approver);
        }

        // sendEmailApproverRequest(); // used for testing
        // sendEmailApproverNotify(); // used for testing
        setApproversNotify([]);
        setApproversRequest([]);
        setGuests([]);
        setInviteMessage("");
    }

    useEffect(() => {
        async function addUser() {
            for (let guest of invitedPayloads) {
                guest = guest.invitedUser.id;
                const responsePayload = await addTeamMember(token, teamId, guest);
            }
        }
        addUser();
    }, [invitedPayloads]);


    // Email the approver about the invataions
    // Link: https://docs.microsoft.com/en-us/graph/api/user-sendmail?view=graph-rest-1.0&tabs=javascript
    const sendEmailApproverNotify = async (approver) => {
        const sendMail = {
            message: {
                subject: `Inviting Guest user from ${approver.company}`,
                body: {
                    contentType: "Text",
                    content: `Hello ${approver.name},\n
I will be adding guest users from ${approver.company} to my team for collaboration on our project.\n\n\n
PLEASE NOTE: This is an automated email. Contact the sending party for more information if needed.
`
                },
                toRecipients: [
                    {
                        emailAddress: {
                            address: approver.email
                            }
                        }
                    ]
                },
                saveToSentItems: "true"
        };
        await sendEmail(token, sendMail);
    }

    // Email the approver to ask about inviting users
    // Link: https://docs.microsoft.com/en-us/graph/api/user-sendmail?view=graph-rest-1.0&tabs=javascript
 
    const sendEmailApproverRequest = async (approver) => {
        const sendMail = {
            message: {
                subject: `Allow for connecting with ${approver.company}`,
                body: {
                    contentType: "Text",
                    content: `Hello ${approver.name},\n
I would like to be able to collaborate with ${approver.company} on our project.\n\n\n
PLEASE NOTE: This is an automated email. Contact the sending party for more information if needed.`
                },
                toRecipients: [
                    {
                        emailAddress: {
                            address: approver.email
                            }
                        }
                    ]
                },
                saveToSentItems: "true"
        };
        await sendEmail(token, sendMail);
    }

    return (
        <Fragment>
            <Flex column fill={true}>
                <Form onSubmit={handleSubmit}>
                    <Header as="h2" content="Invite external users" />
                    <Text content="Enter external users' emails one by one, or separated by commas." />
                    <FormField>
                        <Flex fill={true} gap="gap.medium">
                        <Flex.Item>
                            <Fragment>
                                {error && (
                                    <Input fluid error value={guestsInput} placeholder='Enter guests' onChange={handleGuestInput}/>
                                )}
                                {!error && (
                                    <Input fluid value={guestsInput} placeholder='Enter guests' onChange={handleGuestInput}/>
                                )}
                            </Fragment>
                        </Flex.Item>
                        <Flex.Item size="size.quarter">
                            <Button>Add Guests</Button>
                        </Flex.Item>
                        </Flex>
                    </FormField>
                </Form>
                {error && (
                <Text error content={error}/>
                )}
                
                <PillGroup>
                {
                    guests.map(guest =>
                    <Pill
                        actionable
                        onDismiss={handleRemove}
                    >
                        {guest}
                    </Pill>
                    )
                }
                </PillGroup>

                <Flex column hAlign="center" gap="gap.medium">
                {guests.length > 0 && (
                    <Fragment>
                    <Divider />
                    <TextArea 
                        resize="both" 
                        fluid 
                        value={inviteMessage} 
                        placeholder='Enter a message to send to guests' 
                        onChange={handleMessageInput}
                    />
                    <Button primary loading={loading} content={loading ? "Inviting" : "Invite Users"} onClick={triggerInvite}/>
                    </Fragment>
                )}
                </Flex>
            </Flex>
        </Fragment>
    );
}
