//Method1: connecting the database
//Reminder:!!!!!!!!
//test-command: node datainfo.jsx
//first need to npm install mysql
//if module not found-->NEED TO DO npm install mysql
var mysql      = require("mysql")
var connection = mysql.createConnection({
  //connection info for Azure mysql database
  host:'pwcmysql.mysql.database.azure.com',
  user     : 'azureroot@pwcmysql',
  password : 'ASD@2021',
  //port:'3306',
  database:"dbpwc"
});
 
connection.connect();
 

connection.query('SELECT * FROM table_approver', function (error, results, fields) {
  if (error) throw error;
  var ret =JSON.stringify(results);
  var json = JSON.parse(ret);
  console.log('The solution is: ', json);  //json[0]['email]
});
connection.end();
//module.exports=datainfo;