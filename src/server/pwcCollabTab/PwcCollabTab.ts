import { PreventIframe } from "express-msteams-host";

/**
 * Used as place holder for the decorators
 */
@PreventIframe("/pwcCollabTab/index.html")
@PreventIframe("/pwcCollabTab/config.html")
@PreventIframe("/pwcCollabTab/remove.html")
export class PwcCollabTab {
}
