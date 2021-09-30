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

export async function deleteUser(token, userId) {
    const endpoint = `${baseUrl}users/${userId}`;
    const requestObject = {
        method: "DELETE",
        headers: {
            authorization: `bearer ${token}`,
            "content-type": "application/json"
        }
    };

    // Fetch response
    const response = await fetch(endpoint, requestObject);
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
    if (response.ok) {
        return await response.json();
    }
    return;
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

export async function getTeamMembers(token, teamId): Promise<any> {
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
    if (response.ok) {
        return await response.json();
    }
    return;
}

export async function removeTeamMember(token, teamId, memberId): Promise<any> {
    const endpoint = `${baseUrl}teams/${teamId}/members/${memberId}`;

    const requestObject = {
        method: "DELETE",
        headers: {
            authorization: `bearer ${token}`
        }
    };

    // Fetch response
    const response = await fetch(endpoint, requestObject);
}

// used for sending email to needed approver for either a request to be allowed to add or for notifying that we have added
export async function sendEmail(token, sendMail): Promise<any> {
    const endpoint = `${baseUrl}me/sendMail`;
    const requestObject = {
        method: "POST",
        headers: {
            authorization: `bearer ${token}`,
            "content-type": "application/json"
        },
        body: JSON.stringify(sendMail)
    };

    // Fetch response
    const response = await fetch(endpoint, requestObject);
    if (response.ok) {
        return await response;
    }
}