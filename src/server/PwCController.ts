import * as debug from "debug";
// Initialize debug logging module
const log = debug("msteams");

const mysql = require("mysql");

const dbHost = process.env.DB_HOST as string;
const dbUser = process.env.DB_USER as string;
const dbPass = process.env.DB_PASS as string;
const dbName = process.env.DB_NAME as string;

const conn = mysql.createPool({
    host: dbHost,
    user: dbUser,
    password: dbPass,
    database: dbName
});

export const getApprovers = async (req, res) => {
    conn.query(
        "SELECT * FROM table_approver",
        function (err, results) {
            if (err) throw err;
            const ret = JSON.stringify(results);
            const json = JSON.parse(ret);
            log(ret);
            res.setHeader("Content-Type", "application/json");
            res.status(200).send({ data: json });
        }
    );
};

export const getApproverByDomain = async (req, res) => {
    log(req.params.domain);
    conn.query(
        "SELECT * FROM table_approver WHERE domain=?",
        [req.params.domain],
        function (err, results) {
            if (err) throw err;
            const ret = JSON.stringify(results);
            const json = JSON.parse(ret);
            log(ret);
            res.setHeader("Content-Type", "application/json");
            res.status(200).send({ data: json });
        }
    );
};

export const addApprover = async (req, res) => {
    log(req.body);
    conn.query(
        "INSERT INTO table_approver (firstname, lastname, email, domain, company) VALUES (?,?,?,?,?)",
        [req.body.firstname, req.body.lastname, req.body.email, req.body.domain, req.body.company],
        function (err, results) {
            if (err) throw err;
            const ret = JSON.stringify(results);
            const json = JSON.parse(ret);
            log(ret);
            res.setHeader("Content-Type", "application/json");
            res.status(200).send({ data: json });
        }
    );
};


//Building additional functions needed

// We must assume

// Use this to get a user by an email for when starting a request

//1. First using Azure if they are apart of the org with an email domain of : @pwcteamsbot.onmicrosoft.com, if so proceed otherwise fail
//2. Now check if the emails they enter are emails we have stored: Use getApproverByDomain, if so proceed otherwise fail
//3. Also if the emails have an approver, check if the user has access to the approver by their email. Before - store the id of approver in var, then use below to check if permission contains the number.(Split multi on , )
// continue below

export const getUserByEmail = async (req, res) => {
    log(req.params.domain);
    conn.query(
        "SELECT * FROM table_approver WHERE email=?",
        [req.params.email],
        function (err, results) {
            if (err) throw err;
            const ret = JSON.stringify(results);
            const json = JSON.parse(ret);
            log(ret);
            res.setHeader("Content-Type", "application/json");
            res.status(200).send({ data: json });
        }
    );
};

//3. If they do not have access - display message alerting them a request was made. Use statement below to create request(sendEmailApproverRequest). Clear all data********* (Use below) Alert approver of request
//3. Note that for approval_status
    //0 = deny
    //1 = pending
    //2 = accepted

export const addApproval = async (req, res) => {
    log(req.body);
    conn.query(
        "INSERT INTO table_approvals (approver_id, user_id, teams_channel, approval_status) VALUES (?,?,?,?)",
        [req.body.app_id, req.body.use_id, req.body.channel,1],
        function (err, results) {
            if (err) throw err;
            const ret = JSON.stringify(results);
            const json = JSON.parse(ret);
            log(ret);
            res.setHeader("Content-Type", "application/json");
            res.status(200).send({ data: json });
        }
    );
};



// update an approval 2 steps - update the table_approvals and update the table_users 

//update the approval (Accept)
//"UPDATE table_approvals SET approval_status = 2 WHERE approver_id = ? AND user_id = ?;"

//update the user - need to first get the permissions then add them
//"UPDATE table_users SET permissions = ? WHERE lastname = ? AND email = ?;"

//3. If they do have access only alert approver of adding (sendEmailApproverNotify)



//Creating SQL statement for joining 3 tables and getting the specific users approvals - this is for the approver
//Select table_approvals.id, table_approver.email as ApproverEmail, table_users.email as UsersEmail, table_approvals.teams_channel, table_approvals.approval_status 
//FROM dbpwc.table_approvals 
//INNER JOIN dbpwc.table_approver ON dbpwc.table_approvals.approver_id=dbpwc.table_approver.id
//INNER JOIN dbpwc.table_users ON dbpwc.table_approvals.user_id=dbpwc.table_users.id
//WHERE table_approver.email = ?;


export const getApproverApprovals = async (req, res) => {
    log(req.params.domain);
    conn.query(
        "SELECT table_approvals.id, table_approver.email as ApproverEmail, table_users.email as UsersEmail, table_approvals.teams_channel, table_approvals.approval_status FROM dbpwc.table_approvals INNER JOIN dbpwc.table_approver ON dbpwc.table_approvals.approver_id=dbpwc.table_approver.id INNER JOIN dbpwc.table_users ON dbpwc.table_approvals.user_id=dbpwc.table_users.id WHERE table_approver.email = ?;",
        [req.params.email],
        function (err, results) {
            if (err) throw err;
            const ret = JSON.stringify(results);
            const json = JSON.parse(ret);
            log(ret);
            res.setHeader("Content-Type", "application/json");
            res.status(200).send({ data: json });
        }
    );
};


// THis is for getting all the approval requests for a specific user that is waiting on an approver --- for a user

//Select table_approvals.id, table_approver.email as ApproverEmail, table_users.email as UsersEmail, table_approvals.teams_channel, table_approvals.approval_status 
//FROM dbpwc.table_approvals 
//INNER JOIN dbpwc.table_approver ON dbpwc.table_approvals.approver_id=dbpwc.table_approver.id
//INNER JOIN dbpwc.table_users ON dbpwc.table_approvals.user_id=dbpwc.table_users.id
//WHERE table_users.email = ?;

//Process to show data

export const getUserApprovals = async (req, res) => {
    log(req.params.domain);
    conn.query(
        "SELECT table_approvals.id, table_approver.email as ApproverEmail, table_users.email as UsersEmail, table_approvals.teams_channel, table_approvals.approval_status FROM dbpwc.table_approvals INNER JOIN dbpwc.table_approver ON dbpwc.table_approvals.approver_id=dbpwc.table_approver.id INNER JOIN dbpwc.table_users ON dbpwc.table_approvals.user_id=dbpwc.table_users.id WHERE table_users.email = ?;",
        [req.params.email],
        function (err, results) {
            if (err) throw err;
            const ret = JSON.stringify(results);
            const json = JSON.parse(ret);
            log(ret);
            res.setHeader("Content-Type", "application/json");
            res.status(200).send({ data: json });
        }
    );
};

//Get the UserID by email for updating the approval_status
export const getUserID = async (req, res) => {
    log(req.params.email);
    conn.query(
        "SELECT * FROM table_users WHERE email=?",
        [req.params.email],
        function (err, results) {
            if (err) throw err;
            const ret = JSON.stringify(results);
            const json = JSON.parse(ret);
            log(ret);
            res.setHeader("Content-Type", "application/json");
            res.status(200).send({ data: json });
        }
    );
};

//May not be req.param.status, or the response message may not be just "yes" or "no".
//Right now just assume is "yes" or "no"
//Update the approval_status by userId
// 0->deny; 1->pending; 2->yes;
export const updateApprovalStatus = async (req, res) => {
    var user_id=getUserID(req,res);   //get userid from table_users table
    var status = 1;                   //approval_status=1 -->pending/default
    if (req.param.status=="no"){    //approval_status=0 --> deny
        status=0;
    }
    if (req.param.status=="yes"){   //approval_status=2 -->approved
         status=2;
     }
    conn.query(
        "UPDATE table_approvals SET approval_status=? where user_id=?",
        [status,user_id],
        function (err, results) {
            if (err) throw err;
            const ret = JSON.stringify(results);
            const json = JSON.parse(ret);
            log(ret);
            res.setHeader("Content-Type", "application/json");
            res.status(200).send({ data: json });
        }
    );
};
