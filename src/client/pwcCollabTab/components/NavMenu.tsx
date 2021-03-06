import * as React from "react";
import { useState } from "react";
import { Menu } from "@fluentui/react-northstar";

export function NavMenu(props) {
    const [selected, setSelected] = useState(props.selected);
    //const steps : string[] = props.actType
    // if above populates, then comment out the below for steps
    const steps = ["members", "approvals"];
    const stepNames: { [key: string]: string } = {
        members: "View Guests",
        approvals: "View Requests"
    };

    const menuItems = steps.map(step => {
        return {
            key: step,
            content: stepNames[step] || "",
            onClick: () => {
                setSelected(step);
                props.callback(step);
            }
        };
    });

    return (
        <Menu defaultActiveIndex={0} items={menuItems} underlined primary />
    );
}
