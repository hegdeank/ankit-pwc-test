import * as React from "react";
import { Provider, Flex, Text, Button, Header, List } from "@fluentui/react-northstar";
import { Fragment, useState, useEffect, useCallback } from "react";
import { useTeams } from "msteams-react-base-component";
import * as microsoftTeams from "@microsoft/teams-js";
import jwtDecode from "jwt-decode";

import { NavMenu } from "./components/NavMenu";
import { GuestForm } from "./components/GuestForm";

/**
 * The Main Tab View
 */
export const PwcCollabTab = () => {
  const [{ inTeams, theme, context }] = useTeams();
  const [entityId, setEntityId] = useState<string | undefined>();
  const [name, setName] = useState<string>();
  const [error, setError] = useState<string>();
  const [selectedMenuItem, setSelectedMenuItem] = useState('add');

  const [ssoToken, setSsoToken] = useState<string>();
  const [msGraphOboToken, setMsGraphOboToken] = useState<string>();
  const [recentMail, setRecentMail] = useState<any[]>();
  const [users, setUsers] = useState<any[]>();

  /**
   * Initially checks to see if the app is running in an instance of Teams
   */
  useEffect(() => {
    if (inTeams === true) {
      microsoftTeams.authentication.getAuthToken({
        // If the app is able to successfully retrieve an AuthToken, it will 
        // save it to state
        successCallback: (token: string) => {
          const decoded: { [key: string]: any; } = jwtDecode(token) as { [key: string]: any; };
          setName(decoded!.name);
          setSsoToken(token);
          microsoftTeams.appInitialization.notifySuccess();
        },
        failureCallback: (message: string) => {
          setError(message);
          microsoftTeams.appInitialization.notifyFailure({
            reason: microsoftTeams.appInitialization.FailedReason.AuthFailed,
            message
          });
        },
        resources: [process.env.TAB_APP_URI as string]
      });
    } else {
      setEntityId("Not in Microsoft Teams");
    }
  }, [inTeams]);

  /**
   * Get context of the Teams tab
   */
  useEffect(() => {
    if (context) {
      setEntityId(context.entityId);
    }
  }, [context]);

  /**
   * Sets the MsGraphOboToken for the Graph API
   */
  const exchangeSsoTokenForOboToken = useCallback(async () => {
    const response = await fetch(`/exchangeSsoTokenForOboToken/?ssoToken=${ssoToken}`);
    const responsePayload = await response.json();
    if (response.ok) {
      setMsGraphOboToken(responsePayload.access_token);
    } else {
      if (responsePayload!.error === "consent_required") {
        setError("consent_required");
      } else {
        setError("unknown SSO error");
      }
    }
  }, [ssoToken]);

  useEffect(() => {
  // if the SSO token is defined...
    if (ssoToken && ssoToken.length > 0) {
      exchangeSsoTokenForOboToken();
    }
  }, [exchangeSsoTokenForOboToken, ssoToken]);


  /**
   * Test function to GET emails of current user
   */
  const getRecentEmails = useCallback(async () => {
    if (!msGraphOboToken) { return; }

    const endpoint = "https://graph.microsoft.com/v1.0/me/messages?$select=receivedDateTime,subject&$orderby=receivedDateTime&$top=10";
    const requestObject = {
      method: "GET",
      headers: {
        authorization: "bearer " + msGraphOboToken
      }
    };

    const response = await fetch(endpoint, requestObject);
    const responsePayload = await response.json();

    if (response.ok) {
      const recentMail = responsePayload.value.map((mail: any) => ({
        key: mail.id,
        header: mail.subject,
        headerMedia: mail.receivedDateTime
      }));
      setRecentMail(recentMail);
    }
  }, [msGraphOboToken]);

  /**
   * Test function to GET users of organization
   * Runs once the msGraphOboToken is fetched
   */
  const getUsers = useCallback(async () => {
    if (!msGraphOboToken) { return; }

    // Endpoint fetches users and selects ID, display name, user type, and user state
    const endpoint = "https://graph.microsoft.com/v1.0/users?$select=id,displayName,userType,externalUserState";
    const requestObject = {
      method: "GET",
      headers: {
        authorization: "bearer " + msGraphOboToken
      }
    };

    // Fetch response
    const response = await fetch(endpoint, requestObject);
    const responsePayload = await response.json();

    // Parse response and save to state
    if (response.ok) {
      const userResponse = responsePayload.value.map((user: any) => ({
        key: user.id,
        header: user.displayName,
        headerMedia: user.userType
      }));
      setUsers(userResponse);
    }
  }, [msGraphOboToken]);

  /**
   * Automatic API calls
   * Runs once msGraphOboToken is set
   */
  useEffect(() => {
    getRecentEmails();
    getUsers();
  }, [msGraphOboToken]);

  /**
   * Handles the menu
   */
  const handleMenuSelect = (selected) => {
    setSelectedMenuItem(selected);
  }

  /**
   * The render() method to create the UI of the tab
   */
  return (
    <Provider theme={theme}>
      <Flex fill={true} column styles={{
        padding: ".8rem 0 .8rem .5rem"
      }}>
        <Flex.Item>
          <Header content="Guest Collaboration" />
        </Flex.Item>
        <Text weight="semibold" content={`Current User: ${name}`} />
        {error && <div><Text content={`An SSO error occurred ${error}`} /></div>}
      </Flex>

      <NavMenu selected={selectedMenuItem} callback={handleMenuSelect} />

      <Flex styles={{
        padding: ".8rem 1rem .8rem .8rem"
      }}>
        {selectedMenuItem === "add" && (
          <div style={{
            width: "100%"
          }}>
            <GuestForm />
          </div>
        )}

        {selectedMenuItem === "status" && (
          <Fragment>{users && <div><h3>Your users:</h3><List items={users} /></div>}</Fragment>
        )}

        {selectedMenuItem === "faq" && (
          <Fragment>Add Documentation here</Fragment>
        )}
      </Flex>
    </Provider>
  );
};
