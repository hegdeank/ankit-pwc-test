export async function getApprovers() {
    let endpoint = "/getApprover";
    const requestObject = {
        method: "GET",
        headers: {
            "content-type": "application/json"
        }
    };

    // Fetch response
    const response = await fetch(endpoint, requestObject);
    if (response.ok) {
        return await response.json();
    }
}

export async function getApproverByDomain(domain) {
    let endpoint = `/getApprover/${domain}`;
    const requestObject = {
        method: "GET",
        headers: {
            "content-type": "application/json"
        }
    };

    // Fetch response
    const response = await fetch(endpoint, requestObject);
    if (response.ok) {
        return await response.json();
    }
}

export async function addApprover(approver) {
    let endpoint = "/addApprover";
    const requestObject = {
        method: "POST",
        headers: {
            "content-type": "application/json"
        },
        body: JSON.stringify(approver)
    };

    // Fetch response
    const response = await fetch(endpoint, requestObject);
    if (response.ok) {
        return await response.json();
    }
}

export async function getUserByEmail(email) {
    let endpoint = `/getUserByEmail/${email}`;
    const requestObject = {
        method: "GET",
        headers: {
            "content-type": "application/json"
        }
    };

    // Fetch response
    const response = await fetch(endpoint, requestObject);
    if (response.ok) {
        //console.log("worked with: "+response.json());
        return await response.json();
    }
}

export async function addApproval(approval) {
    let endpoint = "/addApproval";
    const requestObject = {
        method: "POST",
        headers: {
            "content-type": "application/json"
        },
        body: JSON.stringify(approval)
    };

    // Fetch response
    const response = await fetch(endpoint, requestObject);
    if (response.ok) {
        return await response.json();
    }
}

export async function getApproverApprovals(email) {
    let endpoint = `/getApproverApprovals/${email}`;
    const requestObject = {
        method: "GET",
        headers: {
            "content-type": "application/json"
        }
    };

    // Fetch response
    const response = await fetch(endpoint, requestObject);
    if (response.ok) {
        return await response.json();
    }
}

export async function getUserApprovals(email) {
    let endpoint = `/getUserApprovals/${email}`;
    const requestObject = {
        method: "GET",
        headers: {
            "content-type": "application/json"
        }
    };

    // Fetch response
    const response = await fetch(endpoint, requestObject);
    if (response.ok) {
        return await response.json();
    }
}