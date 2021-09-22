// import { User } from 'microsoft-graph';

const graphUrl = "https://graph.microsoft.com/v1.0/";

export async function getUsers(token, select) {
  if (!token) { return; }

  const endpoint = `https://graph.microsoft.com/v1.0/users?$select=${select}`;
  const requestObject = {
    method: "GET",
    headers: {
      authorization: `bearer ${token}`,
      "content-type": "application/json"
    }
  };

  // Fetch response
  const response = await fetch(endpoint, requestObject);
  if (response.ok) {
    return await response.json();
  }
  return "";
}

export async function invite(token, invitation): Promise<any> {
  // Endpoint fetches users and selects ID, display name, user type, and user state
  let endpoint = graphUrl + "invitations";

  const data = {
    invitedUserEmailAddress: 'nguye610@msu.edu',
    sendInvitationMessage: true,
    inviteRedirectUrl: 'https://localhost:3000'
  }

  const requestObject = {
    method: "POST",
    headers: {
      authorization: `bearer ${token}`,
      "content-type": "application/json"
    },
    body: JSON.stringify(invitation)
  };

  // Fetch response
  const response = await fetch(endpoint, requestObject);
  return await response.json();
}