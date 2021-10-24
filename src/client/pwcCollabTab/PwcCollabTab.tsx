import * as React from "react";
import { Provider, Flex, Text, Header, Divider, Button} from "@fluentui/react-northstar";
import { Fragment, useState, useEffect, useCallback } from "react";
import { useTeams } from "msteams-react-base-component";
import * as microsoftTeams from "@microsoft/teams-js";
import jwtDecode from "jwt-decode";
import {getCurrentUser} from "./services/GraphService";
import { getUserByEmail } from "./services/PwCService";
import { NavMenu } from "./components/NavMenu";
import { MembersView } from "./components/MembersView";
import { DatabaseTest } from "./components/DatabaseTest";
import { ApprovalsView } from "./components/ApprovalsView";

/**
 * The Main Tab View
 */
export const PwcCollabTab = () => {
    const [{ inTeams, theme, context }] = useTeams();
    const [entityId, setEntityId] = useState<string | undefined>();
    const [teamId, setTeamId] = useState<string | undefined>();
    const [teamName, setTeamName] = useState<string>();
    const [error, setError] = useState<string>();
    const [selectedMenuItem, setSelectedMenuItem] = useState("members");
    const [activeType, setActiveStatus] = useState<string[]>([]);
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
            // setName(decoded!.name);
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
            setTeamName(context.teamName);
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
        // below is to set the permissions for who can see what - working on it
        /**
        const userData = await getCurrentUser(msGraphOboToken)
        const userEmail = userData.mail; // email needed to get user specific data from db
        
        const userKey = await getUserByEmail(userEmail);
        const userParams = userKey.data.length; // data from query that holds: id, firstname, lastname, email, permission
        let panels: string[] = [];
        console.log("User Status, If 1 then internal, if 0 then external: "+ userParams);
        if(userParams){
            panels.push("members");
            panels.push("approvals");
            
        }else{
            panels.push("members");
        }
        setActiveStatus(panels);
        console.log(activeType)
        */
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
        <Flex column gap="gap.smaller" padding="padding.medium" hAlign="center">
            {error && <div><Text content={`An SSO error occurred ${error}`} /></div>}
            <NavMenu selected={selectedMenuItem} actType={activeType} callback={handleMenuSelect} />
        </Flex>
        <Flex gap="gap.large" padding="padding.medium"
            styles={{
            padding: '1rem 2rem 4rem 4rem'
            }}>
            {selectedMenuItem === "members" &&(
                <MembersView token={msGraphOboToken} teamId={teamId} teamName={teamName}/>
            )}

            {selectedMenuItem === "approvals" &&(
                <ApprovalsView token={msGraphOboToken} teamId={teamId} teamName={teamName}/>
            )}

            {selectedMenuItem === "dbtest" && (
                <DatabaseTest />
            )}
        </Flex>
        </Provider>
    );
};
