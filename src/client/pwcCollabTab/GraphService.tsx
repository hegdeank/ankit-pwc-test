// import { User } from 'microsoft-graph';

const baseUrl = "https://graph.microsoft.com/v1.0/";

export async function getUsers(token, select) {
  const endpoint = `${baseUrl}users?$select=${select}`;
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
  return;
}

export async function getUser(token, userId, select) {
  const endpoint = `${baseUrl}users/${userId}?$select=${select}`;
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
  return;
}

export async function invite(token, invitation): Promise<any> {
  const endpoint = `${baseUrl}invitations`;
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

export async function addTeamMember(token, teamId, userId): Promise<any> {
  const endpoint = `${baseUrl}teams/${teamId}/members`;

  const requestObject = {
    method: "POST",
    headers: {
      authorization: `bearer ${token}`,
      "content-type": "application/json"
    },
    body: JSON.stringify({
      '@odata.type': '#microsoft.graph.aadUserConversationMember',
      roles: ['guest'],
      'user@odata.bind': `${baseUrl}users('${userId}')`
    })
  };

  // Fetch response
  const response = await fetch(endpoint, requestObject);
  return await response.json();
}

export async function getTeamMembers(token, teamId, select): Promise<any> {
  const endpoint = `${baseUrl}teams/${teamId}/members`;

  const requestObject = {
    method: "GET",
    headers: {
      authorization: `bearer ${token}`,
      "content-type": "application/json"
    }
  };

  // Fetch response
  const response = await fetch(endpoint, requestObject);
  return await response.json();
}