import * as React from 'react';
import { useState } from "react";
import { Menu } from "@fluentui/react-northstar";

export function NavMenu(props) {
  const [selected, setSelected] = useState(props.selected);
  
  const steps = ['add', 'status', 'faq'];
  const stepNames: { [key: string]: string } = {
    add: 'Invite Guest',
    status: 'View Guests',
    faq: 'FAQ'
  };

  const menuItems = steps.map(step => {
    return {
      key: step,
      content: stepNames[step] || '',
      onClick: () => {
        setSelected(step);
        props.callback(step);
      }
    };
  });

  return (
    <Menu defaultActiveIndex={0} items={menuItems} vertical pointing />
  );
}