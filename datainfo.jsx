const mysql = require("mysql")
const conn  = mysql.createConnection({
    host     : "pwc-examplesource.mysql.database.azure.com",
    user     : "capstoneteam@pwc-examplesource",
    password : "pwcteam$21",
    database : "dbpwc"
});
 
conn.connect();
let query = "SELECT table_approvals.id, table_approver.email as ApproverEmail, table_users.email as UsersEmail, table_approvals.teams_channel, table_approvals.approval_status FROM dbpwc.table_approvals INNER JOIN dbpwc.table_approver ON dbpwc.table_approvals.approver_id=dbpwc.table_approver.id INNER JOIN dbpwc.table_users ON dbpwc.table_approvals.user_id=dbpwc.table_users.id WHERE table_approver.email = 'Nguye610@pwcteamsbot.onmicrosoft.com'";
query = "SELECT * FROM table_approvals";
// query = "SELECT * FROM table_users WHERE id=4";
conn.query(query, function (error, results, fields) {
    if (error) throw error;
    const rows = JSON.stringify(results);
    console.log(query);
    console.log(JSON.parse(rows));
});

conn.query("SHOW WARNINGS", function (error, results, fields) {
    if (error) throw error;
    const rows = JSON.stringify(results);
    console.log(JSON.parse(rows));
});

conn.end();