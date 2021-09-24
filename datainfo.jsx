//Method1: connecting the database
//Reminder: 
//test-command: node datainfo.jsx
//first need to npm install mysql
var mysql      = require("mysql")
var connection = mysql.createConnection({
  //connection info for Phpmyadmin
  /*
  host:'mysql-user.cse.msu.edu',
  user     : 'shuxinyu@web3.cse.msu.edu',
  password : 'MSU@2021',
  database:"shuxinyu"
  */
  host:"localhost",
  user:"root",
  password:"12345678",
  database:"pwc"
});
 
connection.connect();
 
connection.query('SELECT * FROM manager', function (error, results, fields) {
  if (error) throw error;
  var ret =JSON.stringify(results);
  var json = JSON.parse(ret);
  console.log('The solution is: ', json[0]["email"]);
});
connection.end();
//module.exports=datainfo;