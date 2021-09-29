import * as React from "react";


export function GetManager(){
    const name="test_manager";
    const email="testmanager@email";
    var raw_data = require('./information.json');
    var  json= JSON.stringify(raw_data);
    var data = JSON.parse(json);
    //var output=data["2"]["email"];  test
    var ret =new Map();
    for (var i in data){
        var allinfo =Array();
        var info_email = data[i]["email"];
        var info_name =data[i]["firstname"]+","+data[i]["lastname"];
        var domain = i;
        allinfo.push(info_name);
        allinfo.push(info_email);
        console.log(allinfo);   //test
        ret.set(domain,allinfo);
    }
    
    //testing
    return (
        <div className="GetManager">
            <p>{email}</p>
            <p>{name}</p>
            <p>{ret}</p>
        </div>
      );
    
    return ret;   // --->return the map
    
}

