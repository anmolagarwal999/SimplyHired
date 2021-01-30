import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from 'react-bootstrap';


const ApplicantDashboard = (props) => {
    return (
        <React.Fragment>
            <h1> HELLO to person with email id as {props.email_id}</h1>
            <ul>
                <li>
                    <Link to='/applicant/edit_profile'>Edit profile</Link>
                </li>
                <li>
                    <Link to='/applicant/all_listings'>All Active listings posted by recruiters</Link>
                </li>
                <li>
                    <Link to='/applicant/my_applications'>My applications</Link>
                </li>

                <hr></hr>
                <Button variant="danger" onClick={() => (props.attemptLogout())}>LogOut</Button>

            </ul>
        </React.Fragment>
    );
}

export default ApplicantDashboard;