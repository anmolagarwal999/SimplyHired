import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from 'react-bootstrap';


const RecruiterDashboard = (props) => {
    return (
        <React.Fragment>
            <h1> HELLO to person with email id as {props.email_id}</h1>
            <ul>
            <li>
                    <Link to='/recruiter/edit_profile'>Edit profile</Link>
                </li>
                <li>
                    <Link to='/recruiter/add_listing'>Add Listing</Link>
                </li>
                <li>
                    <Link to='/recruiter/my_listings'>My listings</Link>
                </li>
                <li>
                    <Link to='/recruiter/my_employees'>My recruits</Link>
                </li>
                
                <hr></hr>
                <Button variant="danger" onClick={() => (props.attemptLogout())}>LogOut</Button>

            </ul>
        </React.Fragment>
    );
}

export default RecruiterDashboard;