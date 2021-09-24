import * as React from "react";


export function GetManager(){
    const name="manager";
    const email="testmanager@email";
    const id="";
    var raw_data = require('./information.json');
    var  json= JSON.stringify(raw_data);
    var data = JSON.parse(json);
    var output=data["2"]["email"];
    var allEmails =Array();
    for (var i in data){
        var info = data[i]["email"];
        console.log(info);
        allEmails.push(info);
    }
    
    return (
        <div className="GetManager">
            <p>{email}</p>
            <p>{name}</p>
            <p>{allEmails}</p>
        </div>
      );
    
}
