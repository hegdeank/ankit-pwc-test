const data = require('../../data/information.json');

export function getApprover(domain) {
    let payload;
    try {
        payload = data[domain];
    } catch (error) {
        console.error(error);
    } finally {
        return payload;
    }
}

export function getAllApprovers() {
    return data;
}