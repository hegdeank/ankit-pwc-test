const baseUrl = "https://graph.microsoft.com/v1.0/";
const betaUrl = "https://graph.microsoft.com/beta/";

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
    const endpoint = `${betaUrl}teams/${teamId}/members`;

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
    // const endpoint = `${baseUrl}users/TeamsBot@pwcteamsbot.onmicrosoft.com/sendMail`
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

// get the current user who is using the app - need this for their email
export async function getCurrentUser(token) {
    const endpoint = `${baseUrl}me?$select=mail`;
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

//create a catalog and return the id of the catalog
export async function getCatalogID(token){
    const endpoint = `${baseUrl}identityGovernance/entitlementManagement/accessPackageCatalogs?$filter=(displayName eq 'General')`;
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
        var raw_data=await response.json();
        var  json= JSON.stringify(raw_data);
        var data = JSON.parse(json);
        var value=data.value[0];
        var id = value.id;
        return id;
    }
    return;
}

// Need to find the group id you created
// First find all your joined groups
// Then find the team ID where displayteamName = input_team_name
//return group id and description
export async function getGroupID(token, team_name): Promise<any> {
    const endpoint = `${baseUrl}me/transitiveMemberOf/microsoft.graph.group?$count=true`;
    const requestObject = {
        method: "POST",
        headers: {
            authorization: `bearer ${token}`,
            "content-type": "application/json"
        },
        body: JSON.stringify(team_name)   //????
    };

    // Fetch response
    const response = await fetch(endpoint, requestObject);
    if (response.ok) {
        var raw_data=await response.json();
        var  json= JSON.stringify(raw_data);
        var data = JSON.parse(json);
        var value=data.value;
        for (var idx in value){
            var group = value[idx];
            var team = group.displayName;
            var id = group.id;
            var description = group.description;
            console.log(team);
            console.log(id);
            if (team == team_name){  // find the id
                return {id,description};
            }
        }
    }
}

// export async function addGroupToCatalog(token, team_name,catalogID,groupID,description): Promise<any> {
//     const endpoint = `${baseUrl}me/transitiveMemberOf/microsoft.graph.group?$count=true`;
//     const requestObject = {
//         method: "POST",
//         headers: {
//             authorization: `bearer ${token}`,
//             "content-type": "application/json"
            
//         },
//         body: {
//             "catalogId": `${catalogID}`,
//             "requestType": "AdminAdd",
//             "justification": "",
//             "accessPackageResource": {
//               "displayName": `${description}`,
//               "description": `${team_name}`,
//               "resourceType": "AadGroup",
//               "originId": `${groupID}`,
//               "originSystem": "AadGroup"
//             }
//           }   
//         };

//     // Fetch response
//     const response = await fetch(endpoint, requestObject);
//     if (response.ok) {
//         var raw_data=await response.json();
//         var  json= JSON.stringify(raw_data);
//         var data = JSON.parse(json);
//         var value=data.value;
//     }
//     return;

// }