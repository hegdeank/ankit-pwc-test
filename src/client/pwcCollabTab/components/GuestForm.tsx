import * as React from 'react';
import { Fragment, useEffect, useState } from "react";
import { Button, Flex, Input, List } from "@fluentui/react-northstar";
import { CloseIcon } from '@fluentui/react-icons-northstar'

export function GuestForm() {
  const [guestsInput, setGuestsInput] = useState('');     // String input
  const [guests, setGuests] = useState<string[]>([]);     // Array of Guests
  const [listItems, setListItems] = useState<any[]>([]);  // Array of List Items
  
  const handleInput = (event : any, behavior: any) => {
    setGuestsInput(behavior.value);
  }

  // On submit, guestInput will be separated out into individual strings,
  // delimited by commas, and added into guests.
  const handleSubmit = () => {
    setGuests([...guests, ...guestsInput.split(',')]);
    setGuestsInput('');
  }

  // When guests is updated, update listItems
  // Create new listItems from the state of guests
  useEffect(() => {
    setListItems(guests.map((guest, index) => {
      return (
        {
          key: index,
          content: guest,
          endMedia: <CloseIcon size="smallest" />,
          onClick: handleRemove
        }
      );
    }))
  }, [guests])

  // When a List Item is clicked, this function is called to remove the
  // selected item. The click event carries the name of the guest, and that
  // name is filtered out from the guests list.
  const handleRemove = (event : any, behavior: any) => {
    setGuests(guests.filter(guest => guest !== behavior.content));
  }

  // Internal users are added and created into a team
  // Invite guests to be added to this existing team

  // const invite = async () => {
  //   const invitation = {
  //     invitedUserEmailAddress: 'nguye610@msu.edu',
  //     sendInvitationMessage: true,
  //     inviteRedirectUrl: 'https://localhost:3000'
  //   }

  //   graph.api('invitations').post(invitation).then(() => {
  //     setInvited(true);
  //   });
  // }

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
      <Flex gap='gap.small' hAlign='center' vAlign='center'>
        <Input fluid id='guests' value={guestsInput} placeholder='Enter guests' onChange={handleInput}/>
        <Button primary content="Enter" onClick={handleSubmit}/>
      </Flex>
      <List selectable items={listItems} horizontal />
    </Fragment>
  );
}