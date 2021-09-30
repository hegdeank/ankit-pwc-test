import * as React from "react";
import { Fragment, useEffect, useState } from "react";
import {
    Button, Flex, Input, Form, FormField, Divider,
    Text, Header, Pill, PillGroup, TextArea
} from "@fluentui/react-northstar";
import { invite, addTeamMember,sendEmail } from "../GraphService";
import { getApprover } from "../PwCService";

export function GuestForm(props) {
    const [guestsInput, setGuestsInput] = useState<string>("");
    const [inviteMessage, setInviteMessage] = useState<string>("");
    const [guests, setGuests] = useState<string[]>([]);
    const [error, setError] = useState<string>("");
    const [invitedPayloads, setInvitedPayloads] = useState<any[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const token = props.token;
    const teamId = props.teamId;
    let appEmail; // the approver email (grabbing from handelSubmit)
    let appCompany; // the approver email (grabbing from handelSubmit)
    let appName; // the approvers name (grabbing from handelSubmit)

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
        let rejectGuest: string = "";
        let error: string = "";
        
        for (let guest of guestSplit) {
            guest = guest.trim().toLowerCase();
            if (re.test(guest)) {
                let domain = guest.split("@").pop();
                if (domain) {
                    if (!approvedDomains.has(domain)) {
                        const approver = getApprover(domain);
                        if (approver) {
                            console.log(`Approver found: ${approver.email}`)
                            appEmail = approver.email;
                            appCompany = approver.company;
                            appName = approver.firstname + " " + approver.lastname;
                            addGuest.add(guest);
                            approvedDomains.add(domain);
                        } else {
                            console.log(`Approver not found for domain: ${domain}`);
                            rejectGuest += `${guest}, `;
                            unapprovedDomains.add(domain);
                        }
                    } else {
                        console.log(`Approver found for domain: ${domain}`)
                        addGuest.add(guest);
                    }
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
        sendEmailApproverRequest(); // used for testing
        sendEmailApproverNotify(); // used for testing
        console.log("ATTEMPED TO SEND"); // used for testing
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
    // Does not work yet ************************************************************************
    // Link: https://docs.microsoft.com/en-us/graph/api/user-sendmail?view=graph-rest-1.0&tabs=javascript
 
    const sendEmailApproverNotify = async () =>{
        
       
        const sub = "Inviting Guest user from "+ appCompany;
        const type = "Text";
        const emailMessage ='Hello ' + appName + ',\n I will be adding guest users from '+ appCompany + ' to my team for collabrotaion on our project. \n\n\n '+
           'PLEASE NOTE: This is an automated email. Contact the sending party for more information if needed. ';
        const sendTo = appEmail;

        const sendMail = {
            message: {
              subject: sub,
              body: {
                  contentType: type,
                  content: emailMessage
                },
              toRecipients: [
                  {
                      emailAddress: {
                          address: appEmail
                        }
                    }
                ]
            },
            saveToSentItems: 'true'
        };

        const responsePayload = await sendEmail(token, sendMail);
        setInvitedPayloads([...invitedPayloads, ...[responsePayload]]); // this may be the error
        console.log("ATTEMPED TO SEND Notify");

    }

    



    // Email the approver to ask about inviting users
    // Does not work yet ************************************************************************
    // Link: https://docs.microsoft.com/en-us/graph/api/user-sendmail?view=graph-rest-1.0&tabs=javascript
 
    const sendEmailApproverRequest = async () =>{
        
       
       
        const sub = "Allow for connecting with "+ appCompany;
        const type = "Text";
        const emailMessage ='Hello ' + appName + ',\n I would like to be able to collaborate with '+ appCompany + ' on our project. \n\n\n '+
           'PLEASE NOTE: This is an automated email. Contact the sending party for more information if needed. ';
        const sendTo = appEmail;

        const sendMail = {
            message: {
                subject: sub,
                body: {
                    contentType: type,
                    content: emailMessage
                  },
                toRecipients: [
                    {
                        emailAddress: {
                            address: appEmail
                          }
                      }
                  ]
              },
              saveToSentItems: 'true'
          };

        const responsePayload = await sendEmail(token, sendMail);
        setInvitedPayloads([...invitedPayloads, ...[responsePayload]]); // this may be the error
        
        console.log("ATTEMPED TO SEND request");


    }
 


    // 6 external guests to invite (names & emails)
    // Keep GRP in automated -> test with static API
    // Dialogue to bring up GRP that they will need to approve
    // GRP can be related to multiple companies
    // Input a domain -> output email of GRP

    //Approver api

    // Once invitation is accepted, adding them to the team

    // The status of the invite
    // List of users in progress

    // Make tab visible to users, but only functional depending on who's looking

    // Return the HTML for the component
    // One component can include other components within! 
    // (As evidenced by <Flex>, <Input /> and <Button />)
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
