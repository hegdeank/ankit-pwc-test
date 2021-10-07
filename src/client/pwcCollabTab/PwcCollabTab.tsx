import * as React from "react";
import { Provider, Flex, Text, Header, Divider, Button} from "@fluentui/react-northstar";
import { Fragment, useState, useEffect, useCallback } from "react";
import { useTeams } from "msteams-react-base-component";
import * as microsoftTeams from "@microsoft/teams-js";
import jwtDecode from "jwt-decode";

import { NavMenu } from "./components/NavMenu";
import { GuestForm } from "./components/GuestForm";
import { GuestList } from "./components/GuestList";
import { DatabaseTest } from "./components/DatabaseTest";
import { getApprovers, getApproverByDomain } from "./services/PwCService";

// var mysql = require("mysql");

/**
 * The Main Tab View
 */
export const PwcCollabTab = () => {
    const [{ inTeams, theme, context }] = useTeams();
    const [entityId, setEntityId] = useState<string | undefined>();
    const [teamId, setTeamId] = useState<string | undefined>();
    const [name, setName] = useState<string>();
    const [error, setError] = useState<string>();
    const [selectedMenuItem, setSelectedMenuItem] = useState('add');

    const [ssoToken, setSsoToken] = useState<string>();
    const [msGraphOboToken, setMsGraphOboToken] = useState<string>();

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
            setTeamId(context.groupId);
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
        <Flex column gap="gap.smaller" padding="padding.medium">
            <Header content="External Guest Collaboration" />
            {error && <div><Text content={`An SSO error occurred ${error}`} /></div>}
        </Flex>
        <Divider />
        <Flex gap="gap.large" padding="padding.medium"
            styles={{
            padding: '1rem 4rem 4rem 1rem'
            }}>
            <NavMenu selected={selectedMenuItem} callback={handleMenuSelect} />
            {selectedMenuItem === "add" && (
                <GuestForm token={msGraphOboToken} teamId={teamId}/>
            )}

            {selectedMenuItem === "status" && (
                <GuestList token={msGraphOboToken} teamId={teamId} />
            )}

            {selectedMenuItem === "faq" && (
                <Fragment>Add Documentation here</Fragment>
            )}

            {selectedMenuItem === "dbtest" && (
                <DatabaseTest />
            )}
        </Flex>
        </Provider>
    );
};


// Deny guests by default, allow by specified basis through domain
// Deny by domain, create access packages through manage identities