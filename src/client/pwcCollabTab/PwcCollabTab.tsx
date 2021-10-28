import * as React from "react";
import { Provider, Flex, Text, Button } from "@fluentui/react-northstar";
import { useState, useEffect, useCallback } from "react";
import { useTeams } from "msteams-react-base-component";
import * as microsoftTeams from "@microsoft/teams-js";
import jwtDecode from "jwt-decode";
import { getCurrentUser } from "./services/GraphService";
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
    const [userType, setUserType] = useState<number | undefined>();
    const [ssoToken, setSsoToken] = useState<string>();
    const [msGraphOboToken, setMsGraphOboToken] = useState<string>();
    const [adminVisible, setAdminVisible] = useState<boolean>(true);

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
                setError("Consent required");
            } else {
                setError(`Unknown SSO error: ${responsePayload!.error}`);
            }
        }

    }, [ssoToken]);

    /**
     * Sets the user type
     * A user is valid if the current user's email is found in the database
     */
    const getUserType = useCallback(async () => {
        const userResponse = await getCurrentUser(msGraphOboToken)
        const user = await getUserByEmail(userResponse.mail);
        setUserType(user.data.length); // 0 is not a user, 1 is a user
    }, [msGraphOboToken]);

    useEffect(() => {
    // if the SSO token is defined...
        if (ssoToken && ssoToken.length > 0) {
            exchangeSsoTokenForOboToken();
        }
    }, [exchangeSsoTokenForOboToken, ssoToken]);

    useEffect(() => {
        getUserType();
    }, [getUserType, msGraphOboToken])

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
            {adminVisible &&
                <Flex 
                    hAlign="end"
                    gap="gap.small"
                    styles={{
                        padding: "1rem 2rem 0 2rem"
                    }}
                >
                    <Button content="Toggle User Type" onClick={
                        () => {
                            if (userType === 1) {
                                setUserType(0);
                            } else {
                                setUserType(1);
                            }
                        }
                    } />
                    <Button content="DB Test Page" onClick={
                        () => setSelectedMenuItem("dbtest")
                    } />
                    <Button content="Hide Admin Options" onClick={
                        () => setAdminVisible(false)
                    } />
                </Flex>
            }
            
            <Flex column gap="gap.smaller" padding="padding.medium" hAlign="center">
                {error && <div><Text content={`An SSO error occurred ${error}`} /></div>}
                {userType === 1 && 
                    <NavMenu 
                        selected={selectedMenuItem} 
                        callback={handleMenuSelect}
                    />
                }
            </Flex>
            <Flex gap="gap.large" padding="padding.medium"
                styles={{
                    padding: "1rem 2rem 4rem 4rem"
                }}>
                {selectedMenuItem === "members" &&(
                    <MembersView 
                        token={msGraphOboToken}
                        teamId={teamId}
                        teamName={teamName}
                        userType={userType}
                    />
                )}

                {selectedMenuItem === "approvals" &&(
                    <ApprovalsView 
                        token={msGraphOboToken}
                        teamId={teamId}
                        teamName={teamName}
                    />
                )}

                {selectedMenuItem === "dbtest" && (
                    <DatabaseTest />
                )}
            </Flex>
        </Provider>
    );
};
