import * as React from "react";
import { Fragment, useEffect, useState } from "react";
import {
    Button, Flex, Input, Form, FormField, Divider, Dialog,
    Text, Pill, PillGroup, TextArea, List, Checkbox
} from "@fluentui/react-northstar";
import { CloseIcon, ParticipantAddIcon } from "@fluentui/react-icons-northstar";
import { invite, addTeamMember, sendEmail, getCurrentUser } from "../services/GraphService";
import { getApproverByDomain, getUserByEmail, getApprovers, addApproval, getUserApprovalsById } from "../services/PwCService";
import { countMembersInTeam, requestAccess,createAccessPackagePolicy,addResourceRoleToAccessPackage, createAccessPackage, getResourcesRole, getCatalogResources, addGroupToCatalog, getCatalogID } from "../services/GraphService";

export function InviteDialog(props) {
    const [guestsInput, setGuestsInput] = useState<string>("");
    const [inviteMessage, setInviteMessage] = useState<string>("");
    const [guests, setGuests] = useState<string[]>([]);
    const [errors, setErrors] = useState<string[]>([]);
    const [invitedPayloads, setInvitedPayloads] = useState<any[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [approversNotify, setApproversNotify] = useState<any[]>([]);
    const [approversRequest, setApproversRequest] = useState<any[]>([]);
    const [approvalsCreate, setApprovalsCreate] = useState<any[]>([]);
    const [open, setOpen] = useState<boolean>(false);
    const token = props.token;
    const teamId = props.teamId;
    const teamName = props.teamName;
    
    const handleGuestInput = (event : any, data: any) => {
        setGuestsInput(data.value);
    };
    const handleMessageInput = (event : any, data: any) => {
        setInviteMessage(data.value);
    };

    /**
     * On form submission, guestInput will be separated out into individual emails
     * And undergo the invitation process
     */
    const handleSubmit = async() => {
        const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        const guestSplit = guestsInput.split(",");
        const addGuest: Set<string> = new Set();
        const approversValid: Set<any> = new Set();
        const approversInvalid: any[] = [];
        const approvedDomains: Set<string> = new Set();
        let rejectGuest: string = "";
        const error: string[] = [];
        
        const userData = await getCurrentUser(token)
        const userEmail = userData.mail; // email needed to get user specific data from db
        
        const userKey = await getUserByEmail(userEmail);
        const userParams = userKey.data[0]; // data from query that holds: id, firstname, lastname, email, permission

        for (let guest of guestSplit) {
            guest = guest.trim().toLowerCase();
            if (re.test(guest)) {
                let domain = guest.split("@").pop();
                if (domain) {
                    if (!approvedDomains.has(domain)) {
                        const approver = await getApproverByDomain(domain);  // see if we have stored the domain
                        const approverData = approver.data[0]; // get that data: id, firstname, lastname, email, company, domain

                        if (approverData) {
                            const userApprovals = await getUserApprovalsById(approverData.id,userParams.id); // check if the approval is already made

                            if (userApprovals.data.length > 0) {
                                if (userParams.permission.includes(approverData.id) && userApprovals.data[0].approval_status == 2) {
                                    addGuest.add(guest);
                                    approvedDomains.add(domain);
                                    // keep below
                                    approversValid.add({
                                        email: approverData.email,
                                        company: approverData.company,
                                        name: `${approverData.firstname} ${approverData.lastname}`
                                    });
                                }else if(userApprovals.data[0].approval_status == 1){
                                    error.push(`You are not approved to invite users for domain: ${domain}. Your approval is still pending.`);
                                    rejectGuest += `${guest}, `;
                                }else if(userApprovals.data[0].approval_status == 0){
                                    error.push(`You are not approved to invite users for domain: ${domain}. Your approval was denied.`);
                                    rejectGuest += `${guest}, `;
                                }
                            } else {

                                // notify that approval was made AND MAKE SURE WE DONT ADD ANOTHER: create get approver by id
                                // error.push(`You are not approved to invite users for domain: ${domain}. An approval has been made for you.`);
                                // rejectGuest += `${guest}, `;
                                if (approversInvalid.findIndex(approval => approval.domain === domain) === -1) {
                                    approversInvalid.push({
                                        app_id: approverData.id,
                                        use_id: userParams.id,
                                        channel: teamName,
                                        domain: domain,
                                        selected: false
                                    });
                                }
                                // const createApproval = await addApproval({
                                //     app_id: approverData.id,
                                //     use_id: userParams.id,
                                //     channel: teamName
                                // });
                                // keep below
                                // approversInvalid.add({
                                //     email: approverData.email,
                                //     company: approverData.company,
                                //     name: `${approverData.firstname} ${approverData.lastname}`
                                // });
                                // sendEmailApproverRequest({
                                //     email: approverData.email,
                                //     company: approverData.company,
                                //     name: `${approverData.firstname} ${approverData.lastname}`
                                // });
                            }
                        } else {
                            error.push(`Approver not found for domain: ${domain}. Contact an administrator for more information`);
                            rejectGuest += `${guest}, `;
                        }
                    } else {
                        console.log(`Approver found for domain: ${domain}`);
                        addGuest.add(guest);
                    }
                }
            } else {
                rejectGuest += `${guest}, `;
                error.push("Enter in valid emails, delimited by commas, as input");
            }
        }
        
        setErrors(error);
        setLoading(false);
        setGuests([...guests, ...Array.from(addGuest.values())]);
        setApproversNotify([...approversNotify, ...Array.from(approversValid.values())]);
        // setApproversRequest([...approversRequest, ...Array.from(approversInvalid.values())]);
        setApprovalsCreate(Array.from(approversInvalid.values()));
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

        console.log(approversNotify)
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
        setOpen(false);
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
                toRecipients: [{emailAddress: { address: approver.email }}],
                ccRecipients: [
                    {
                      emailAddress: {
                        address: 'se.nguyen.t@gmail.com'
                      }
                    }
                  ]
            },
            saveToSentItems: "true"
        };
        const emailResponse = await sendEmail(token, sendMail);
        console.log(emailResponse);
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
PLEASE NOTE: This is an automated email. A request will be made in the Collaboration bot. You can access this approval from any channel. \n
Contact the sending party for more information if needed.`
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
    
    const handleApprovalSelect = (domain) => {
        let approvals = [...approvalsCreate];
        let index =  approvals.findIndex(approval => approval.domain === domain);
        if (approvals[index].selected) {
            approvals[index].selected = false;
        } else {
            approvals[index].selected = true;
        }
        console.log(approvals[index]);
        setApprovalsCreate(approvals);
    }
    
    const handleApprovalSubmit = () => {
        const approvals = approvalsCreate.filter(approval => approval.selected);

        approvals.forEach(approval => addApproval({
            app_id: approval.app_id,
            use_id: approval.use_id,
            channel: teamName
        }))

        setApprovalsCreate([]);
    }

    const ApprovalChecks = () => {
        return (
            <Flex column gap="gap.large">
                <Text content="You were not approved to invite users from the following domains. Select domains you would like to create approvals for." />
                <Flex column gap="gap.small">
                    {
                        approvalsCreate.map(approval => 
                            <Checkbox 
                                checked={approval.selected} 
                                label={approval.domain} 
                                onClick={() => handleApprovalSelect(approval.domain)}
                            />
                        )
                    }
                </Flex>
                <Flex gap="gap.medium" hAlign="end">
                    <Button content="Cancel" onClick={() => setApprovalsCreate([])} />    
                    <Button content="Create Approvals" primary onClick={() => handleApprovalSubmit()} />
                </Flex>
            </Flex>
        );
    }

    return (
        <Dialog
            open={open}
            onOpen={() => setOpen(true)}
            onCancel={() => setOpen(false)}
            header={`Add member to ${teamName}`}
            headerAction={{
                icon: <CloseIcon />,
                title: 'Close',
                onClick: () => setOpen(false),
              }}
            content={
                <Flex column fill={true}>
                    { approvalsCreate.length === 0 && (
                        <Fragment>
                            <Form onSubmit={handleSubmit}>
                                <Text content="Enter emails, separated by commas, to add new members to your team." />
                                <FormField>
                                    <Flex fill={true} gap="gap.medium">
                                    <Flex.Item>
                                        <Fragment>
                                            {errors.length !== 0 && (
                                                <Input fluid error value={guestsInput} placeholder='Enter guests' onChange={handleGuestInput}/>
                                            )}
                                            {errors.length === 0 && (
                                                <Input fluid value={guestsInput} placeholder='Enter guests' onChange={handleGuestInput}/>
                                            )}
                                        </Fragment>
                                    </Flex.Item>
                                    <Flex.Item size="size.quarter">
                                        <Button>Add</Button>
                                    </Flex.Item>
                                    </Flex>
                                </FormField>
                            </Form>
                            { errors.map(err => <Text error content={err} />)}
                            
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
                                    placeholder='Enter a reason why you would like to collaborate with these external users.' 
                                    onChange={handleMessageInput}
                                />
                                <Button primary loading={loading} content={loading ? "Inviting" : "Invite Users"} onClick={triggerInvite}/>
                                </Fragment>
                            )}
                            </Flex>
                        </Fragment>
                    )}

                    { approvalsCreate.length !== 0 && (
                        <ApprovalChecks />
                    )}
                </Flex> 
            }
            trigger={<Button icon={<ParticipantAddIcon />} content="Add Member" iconPosition="after" primary />}
        />
    );
}

// const handleCreatingAccessPackage= async(token,userID) =>{
//     //check if there is an access package exist or not by checking amount of team member
//     //if there is only one person in a group --->Need to create an AccessPackage 
//     var numbersOfMemberInGroup = countMembersInTeam(token,teamId);
//     if (Number(numbersOfMemberInGroup)<=1){
//         //1. starting create Catalog
//         var catalogID = getCatalogID(token);
//         console.log(catalogID);
//         //2. Add group to the catalog
//         var description = teamName + "'s Catalog";
//         var response_check = addGroupToCatalog(token,teamName,catalogID,teamId,description);
//         console.log(response_check);
//         //3. GetCatalogResourcesID
//         var groupResourceID= getCatalogResources(token,catalogID,teamName);
//         console.log(groupResourceID);
//         //4. GetResourceRole
//         var resourcesRoles = getResourcesRole(token,catalogID,groupResourceID);
//         var memberOriginID = resourcesRoles["memberOriginID"];
//         var packageResourceID = resourcesRoles["accessPackageResourceID"];
//         var packageResourceType=resourcesRoles["packageResourceType"];
//         //5.CreateAccessPackage
//         var packageName = teamName;
//         var packageDescription = teamName + "'s Access Package";
//         var accessPackageID = createAccessPackage(token,packageName,catalogID,packageDescription);
//         //6.  addResourceRoleToAccessPackage
//         var response_adding = addResourceRoleToAccessPackage(token, memberOriginID,accessPackageID,groupResourceID, packageResourceID,packageResourceType);
//         //7. Creating access package policy
//         var policyID = createAccessPackagePolicy(token,accessPackageID,userID);
//         console.log("New Access Package has been created!");

//     }else{
//         console.log("No access package created.");
//         console.log(numbersOfMemberInGroup);
//     }
//     //var requestID = requestAccess(token,accessPackageID,userID,policyID);

// };
