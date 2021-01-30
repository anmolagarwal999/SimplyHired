import React from 'react';
import { Route, Redirect } from 'react-router-dom';

const VerifyAccess = (props_sent) => {
    let is_really_LoggedIn = true;
    if (!props_sent.is_logged_in) {
        return <Redirect to="/login" />;
    }
    if (props_sent.category !== (props_sent.type)) {
        if (props_sent.type === "type_a") {
            return <Redirect to="/applicant/dashboard" />;
        }
        else {
            return <Redirect to="/recruiter/dashboard" />;
        }
    }
    // Impoertance of route to is that it kind of works like a new Route and does not depend onroutes on the main menu
    // Remember your mistake of using 'all_listing' instead of 'all_listings'
    return <Route render={(props) => props_sent.component_to_use} />;
}

export default VerifyAccess;

