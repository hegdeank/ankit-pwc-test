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
