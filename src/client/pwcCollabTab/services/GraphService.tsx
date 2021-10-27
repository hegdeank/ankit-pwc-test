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

export async function getUserPhoto(token, userID) {
    const endpoint = `${baseUrl}users/${userID}/photo/$value`;
    //const endpoint = `https://graph.microsoft.com/v1.0/users/b89c308f-a5ea-475c-a6f4-ee58e918a202/photo/$value`
    const requestObject = {
        method: "GET",
        headers: {
            authorization: `bearer ${token}`,
            "content-type": "image/jpeg"
        }
    };

    let burl = 'https://fabricweb.azureedge.net/fabric-website/assets/images/avatar/CameronEvans.jpg';
    
    return await fetch(endpoint, requestObject)
    .then( function (response) {
        if (response.ok) {
            return response.blob();
        }
    })
    .then(
        function (photoBlob) {
            if (photoBlob) {
                return URL.createObjectURL(photoBlob);
            } else {
                return "";
            }
        }
    );
    
}

export async function getUserPresence(token, userId) {
    const endpoint = `${baseUrl}users/${userId}/presence`;
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
// TESTED it in graph-explorer--->ok
// TESTED getting id from response json file -->ok
export async function getCatalogID(token){
    const endpoint = `${betaUrl}identityGovernance/entitlementManagement/accessPackageCatalogs?$filter=(displayName eq 'General')`;
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
// since a user can join in multiple teams, we need to find the one fetched by team_name
// return group id and description
// TESTED it in graph-explorer--->ok
// TESTED getting id from response json file -->ok
export async function getGroupID(token, team_name): Promise<any> {
    const endpoint = `${baseUrl}me/transitiveMemberOf/microsoft.graph.group?$count=true`;
    const requestObject = {
        method: "GET",
        headers: {
            authorization: `bearer ${token}`,
            "content-type": "application/json"
        },
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
                return {"id":id,"descripption":description};
            }
        }
    }
}

//https://graph.microsoft.com/beta/identityGovernance/entitlementManagement/accessPackageResourceRequests
//Since this function is just add group to Catalog
//we do not need to return anything
//This response will have 3 cases: 1. Ok 2. AlreadyAddedError 3. Other Errors
// TESTED it in graph-explorer--->ok
// TESTED getting id from response json file -->ok
export async function addGroupToCatalog(token, team_name,catalogID,groupID,description): Promise<any> {
    const endpoint = `${betaUrl}identityGovernance/entitlementManagement/accessPackageResourceRequests`;
    const bodyObject={
        "catalogId": `${catalogID}`,
        "requestType": "AdminAdd",
        "justification": "",
        "accessPackageResource": {
          "displayName": `${description}`,
          "description": `${team_name}`,
          "resourceType": "AadGroup",
          "originId": `${groupID}`,
          "originSystem": "AadGroup"
        }
    };
    const requestObject = {
        method: "POST",
        headers: {
            authorization: `bearer ${token}`,
            "content-type": "application/json"
            
        },
        body: JSON.stringify(bodyObject)   
    };

    // Fetch response
    const response = await fetch(endpoint, requestObject);
    if (response.ok) {
        return await response.json();
    }
    return;
}

//https://graph.microsoft.com/beta/identityGovernance/entitlementManagement/accessPackageCatalogs/cec5d6ab-c75d-47c0-9c1c-92e89f66e384/accessPackageResources?$filter=(displayName eq 'Marketing resources')
//"cec5d6ab-c75d-47c0-9c1c-92e89f66e384"--->CatalogID
//'Marketing resources'--->displayTeamName
//get the Catalog Resources by catalog id
// Return groupResourceID
// TESTED it in graph-explorer--->ok
// TESTED getting id from response json file -->ok
export async function getCatalogResources(token, catalogID,displayTeamName): Promise<any>{
    const endpoint = `${betaUrl}identityGovernance/entitlementManagement/accessPackageCatalogs/${catalogID}/accessPackageResources?$filter=(displayName eq '${displayTeamName}')`;
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
        var id = data.value[0].id;
        //console.log(data.value[0].id);
        return id;      //return groupResourceID (Tested: getting id from json file)
    }
    return;
}

//GET https://graph.microsoft.com/beta/identityGovernance/entitlementManagement/accessPackageCatalogs/cec5d6ab-c75d-47c0-9c1c-92e89f66e384/accessPackageResourceRoles?$filter=(originSystem+eq+%27AadGroup%27+and+accessPackageResource/id+eq+%274a1e21c5-8a76-4578-acb1-641160e076e8%27+and+displayName+eq+%27Member%27)&$expand=accessPackageResource
//"cec5d6ab-c75d-47c0-9c1c-92e89f66e384"-->CatalogID
//"4a1e21c5-8a76-4578-acb1-641160e076e8"-->GroupResourcesID
//Return Member OriginID , PackageResourceOriginID, Package Resource Type
// TESTED it in graph-explorer--->ok
// TESTED getting id from response json file -->ok
export async function getResourcesRole(token,catalogID,groupResourcesID): Promise<any>{
    const endpoint = `${betaUrl}identityGovernance/entitlementManagement/accessPackageCatalogs/${catalogID}/accessPackageResourceRoles?$filter=(originSystem+eq+%27AadGroup%27+and+accessPackageResource/id+eq+%27${groupResourcesID}%27+and+displayName+eq+%27Member%27)&$expand=accessPackageResource`;
    const requestObject = {
        method: "GET",
        headers: {
            authorization: `bearer ${token}`,
            "content-type": "application/json"
        }
    };
    // Fetch response
    // If successful, a single value is returned, which represents the 
    // Member role of that group. If no roles are returned, check the id values 
    // of the catalog and the access package resource. 
    const response = await fetch(endpoint, requestObject);
    if (response.ok) {
        var raw_data = await response.json();
        var  json = JSON.stringify(raw_data);
        var data = JSON.parse(json);
        var memberOriginID = data.value[0].originId;
        var packageResourceID = data.value[0].accessPackageResource.originId;
        var packageResourceType = data.value[0].accessPackageResource.resourceType;
        //console.log(memberOriginID)
        return {"memberOriginID":memberOriginID,"accessPackageResourceID":packageResourceID,
                "packageResourceType":packageResourceType
        };      
        //return Member Origin ID,access package resource originID and package resource type (Tested: getting id from json file)
    }
    return;
}

//POST https://graph.microsoft.com/beta/identityGovernance/entitlementManagement/accessPackages
// Return ID of the access package
// TESTED it in graph-explorer--->ok
// TESTED getting id from response json file -->ok
export async function createAccessPackage(token, name,catalogID,description): Promise<any> {
    const endpoint = `${betaUrl}identityGovernance/entitlementManagement/accessPackages`;
    const bodyObject={
        "catalogId": `${catalogID}`,
        "displayName": `${name}`,                   //eg. "Marketing Campaign" as the tutorial shows, it is not team_name
        "description": `${description}`             // eg."Access to resources for the campaign" as the tutorial shows, it is not team_description
    };
    const requestObject = {
        method: "POST",
        headers: {
            authorization: `bearer ${token}`,
            "content-type": "application/json"
            
        },
        body: JSON.stringify(bodyObject)   
    };

    // Fetch response
    const response = await fetch(endpoint, requestObject);
    if (response.ok) {
        var raw_data=await response.json();
        var  json= JSON.stringify(raw_data);
        var data = JSON.parse(json);
        var accessPackageID = data.id;
        //console.log(data.id);
        return accessPackageID;   // Return ID of the just created access package (Tested: getting id from json file)
    }
    return;
}

//https://graph.microsoft.com/beta/identityGovernance/entitlementManagement/accessPackages/88203d16-0e31-41d4-87b2-dd402f1435e9/accessPackageResourceRoleScopes
//Purpose:After this function call, the access package now has one resource role, which is group membership. 
//The role is assigned to any user who has the access package.
// we do not need to record any informations from the response
// TESTED it in graph-explorer--->ok
export async function addResourceRoleToAccessPackage(token, accessPackageID,memberOriginID,groupResourcesID,packageResourceOriginID,resourceType): Promise<any> {
    const endpoint = `${betaUrl}identityGovernance/entitlementManagement/accessPackages/${accessPackageID}/accessPackageResourceRoleScopes`;
    
    //body object
    // id -->groupResourceID;
    // resourceType--> accessPackageResourcesType get from GetResourceRole function
    //originID --> package resources originID get from GetResourceRole function
    const bodyObject={
        "accessPackageResourceRole": {
          "originId": `${memberOriginID}`,   //memberOriginID
          "displayName":"Member",
          "originSystem":"AadGroup",
          "accessPackageResource": {
            "id":`${groupResourcesID}`,"resourceType":`${resourceType}`,  
            "originId":`${packageResourceOriginID}`,"originSystem":"AadGroup"
          }
        },
        "accessPackageResourceScope": {
          "originId":`${packageResourceOriginID}`,"originSystem":"AadGroup"
        }
    };

    //request object
    const requestObject = {
        method: "POST",
        headers: {
            authorization: `bearer ${token}`,
            "content-type": "application/json"
            
        },
        body: JSON.stringify(bodyObject)   
    };

    // Fetch response
    const response = await fetch(endpoint, requestObject);
    if (response.ok) {
        return await response.json();
        // we do not need to record any informations from the response
    }
    return;
}

// POST https://graph.microsoft.com/beta/identityGovernance/entitlementManagement/accessPackageAssignmentPolicies
// Purpose: Now that you created the access package and added resources and roles, 
//          you can decide who can access it by creating an access package policy. 
//          In this tutorial, you enable the Requestor1 account that you created to 
//          request access to the resources in the access package.
//param:   id of the access package from return of CreateAccessPackage function call
//param:   id of the Requestor1 user account or userID
//return:  PolicyID
// TESTED getting id from response json file -->ok
// TESTED it in graph-explorer--->ok
export async function createAccessPackagePolicy(token, accessPackageID,userID): Promise<any> {
    const endpoint = `${betaUrl}identityGovernance/entitlementManagement/accessPackageAssignmentPolicies`;
    
    //body object
    //@ts-check ?????? amount of Duration Days
    const bodyObject={
        "accessPackageId": `${accessPackageID}`,
        "displayName": "Specific users",
        "description": "Specific users can request assignment",
        "accessReviewSettings": null,
        "durationInDays": 30,
        "requestorSettings": {
          "scopeType": "SpecificDirectorySubjects",
          "acceptRequests": true,
          "allowedRequestors": [
             {
               "@odata.type": "#microsoft.graph.singleUser",
               "isBackup": false,
               "id": `${userID}`,
               "description": "Requestor1"
             }
          ]
        },
        "requestApprovalSettings": {
          "isApprovalRequired": false,
          "isApprovalRequiredForExtension": false,
          "isRequestorJustificationRequired": false,
          "approvalMode": "NoApproval",
          "approvalStages": []
        }
      };

    //request object
    const requestObject = {
        method: "POST",
        headers: {
            authorization: `bearer ${token}`,
            "content-type": "application/json"
            
        },
        body: JSON.stringify(bodyObject)   
    };

    // Fetch response
    const response = await fetch(endpoint, requestObject);
    if (response.ok) {
        var raw_data=await response.json();
        var  json= JSON.stringify(raw_data);
        var data = JSON.parse(json);
        var policyID=data.id;
        console.log(data.id);
        return policyID;
        
    }
    return;
}

//POST https://graph.microsoft.com/beta/identityGovernance/entitlementManagement/accessPackageAssignmentRequests
//Purpose: the Requestor1 user account requests access to the resources in the access package
//return: requestStatusID
// TESTED getting id from response json file -->ok
// TESTED it in graph-explorer--->ok
export async function requestAccess(token, accessPackageID,userID,policyID): Promise<any> {
    const endpoint = `${betaUrl}identityGovernance/entitlementManagement/accessPackageAssignmentRequests`;
    
    //body object
    //assignmentPolicyId --> PolicyID from return of createPolicy function
    //accessPackageId --> id of the access package from return of CreateAccessPackage function call
    //targetID --> userID/requestorID
    const bodyObject={
        "requestType": "UserAdd",
        "accessPackageAssignment":{
           "targetId":`${userID}`,
           "assignmentPolicyId":`${policyID}`,
           "accessPackageId":`${accessPackageID}`
        }
    };

    //request object
    const requestObject = {
        method: "POST",
        headers: {
            authorization: `bearer ${token}`,
            "content-type": "application/json"
            
        },
        body: JSON.stringify(bodyObject)   
    };

    // Fetch response
    const response = await fetch(endpoint, requestObject);
    if (response.ok) {
        var raw_data=await response.json();
        var  json= JSON.stringify(raw_data);
        var data = JSON.parse(json);
        var requestStatusID=data.id;
        var requestState=data.requestState;  //Submitted
        var requestStatus=data.requestStatus; //Approved
        if (requestState != "Submitted" || requestStatus!="Approved"){   //checking error during giving permission to user
            return "Error Occurs during requesting";
        }
        console.log(data.id);
        return requestStatusID;  // this id will use it later for tracking the status of request
        
    }
    return;
}


//revoke the assignment for a user/requestor
//https://graph.microsoft.com/beta/identityGovernance/entitlementManagement/accessPackageAssignmentRequests
export async function removeAnAssignment(token,requestID): Promise<any> {
    const endpoint = `${betaUrl}identityGovernance/entitlementManagement/accessPackageAssignmentRequests`;
    
    //body object
    //id-->requestID
    const bodyObject={
        "requestType": "AdminRemove",
        "accessPackageAssignment":{
           "id": `${requestID}`
        }
      };

    //request object
    const requestObject = {
        method: "POST",
        headers: {
            authorization: `bearer ${token}`,
            "content-type": "application/json"
            
        },
        body: JSON.stringify(bodyObject)   
    };

    // Fetch response
    const response = await fetch(endpoint, requestObject);
    if (response.ok) {
        var raw_data=await response.json();
        var  json= JSON.stringify(raw_data);
        var data = JSON.parse(json);
        var requestState=data.requestState;  //Submitted
        var requestStatus=data.requestStatus; //Approved
        if (requestState != "Submitted" || requestStatus!="Approved"){   //checking error during giving permission to user
            return "Error Occurs during requesting";
        }
        return true;
        
    }
    return;
}