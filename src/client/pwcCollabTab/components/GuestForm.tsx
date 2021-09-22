import * as React from "react";
import { Fragment, useEffect, useState } from "react";
import { Button, Flex, Input, List, Form, FormField, FormLabel, FormMessage, Text, Header, Pill, PillGroup } from "@fluentui/react-northstar";
import { CloseIcon } from '@fluentui/react-icons-northstar'
import { invite } from "../GraphService";

export function GuestForm(props) {
  const [guestsInput, setGuestsInput] = useState<string>(""); // String input
  const [guests, setGuests] = useState<string[]>([]);     // Array of Guests
  const [error, setError] = useState<string>("");
  const token = props.token;
  
  const handleInput = (event : any, behavior: any) => {
    setGuestsInput(behavior.value);
  }

  // On submit, guestInput will be separated out into individual strings,
  // delimited by commas, and added into guests.
  const handleSubmit = () => {
    const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    const guestSplit = guestsInput.split(',');
    let addGuest: string[] = [];
    let rejectGuest: string = "";

    for (let guest of guestSplit) {
      guest = guest.trim().toLowerCase();
      if (re.test(guest)) {
        addGuest.push(guest);
      } else {
        rejectGuest += guest + ", ";
      }
    }

    if (rejectGuest !== "") {
      setError("Enter in valid emails, delimited by commas, as input")
    } else {
      setError("");
    }

    setGuests([...guests, ...addGuest]);
    setGuestsInput(rejectGuest.slice(0, -2));
  }

  // When a List Item is clicked, this function is called to remove the
  // selected item. The click event carries the name of the guest, and that
  // name is filtered out from the guests list.
  const handleRemove = (event : any, data: any) => {
    setGuests(guests.filter(guest => guest !== data.children));
  }

  const triggerInvite = async () => {
    if (!token) { return; }

    for (let guest of guests) {
      const invitation = {
        invitedUserEmailAddress: guest,
        sendInvitationMessage: true,
        inviteRedirectUrl: 'https://localhost:3000'
      }
  
      const responsePayload = await invite(token, invitation);
      console.log(responsePayload);
    }

    setGuests([]);
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
              {error && (
                <Input fluid error value={guestsInput} placeholder='Enter guests' onChange={handleInput}/>
              )}
              {!error && (
                <Input fluid value={guestsInput} placeholder='Enter guests' onChange={handleInput}/>
              )}
              <Button>Submit</Button>
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
        <Flex hAlign="center">
          {guests.length > 0 && (
            <Button primary content="Invite Users" onClick={triggerInvite}/>
          )}
        </Flex>
      </Flex>
    </Fragment>
  );
}