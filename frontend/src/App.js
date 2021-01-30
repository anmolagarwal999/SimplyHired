import React, { Fragment, useEffect, useState } from 'react';
import NavbarElem from './components/layout/Navbar';
import Landing from './components/layout/Landing';
import Register from './components/auth/Register';
import Login from "./components/auth/Login"
import set_axios_default_token from "./helper_files/axios_token_setter";
import Apply_job from "./components/applicant_specific/apply_job";
import 'bootstrap/dist/css/bootstrap.css';
import { BrowserRouter as Router, Route, Redirect, Switch } from "react-router-dom";
import VerifyAccess from "./components/verify_access";
import default_comp from "./components/default_component";
import RecruiterDashboard from "./components/recruiter_specific/recruiter_dashboard";
import ApplicantDashboard from "./components/applicant_specific/applicant_dashboard";
import './App.css';
import Add_listing from "./components/recruiter_specific/add_listing";
import AllListings from "./components/applicant_specific/all_listings";
import My_applications from "./components/applicant_specific/my_applications";
import My_listings from "./components/recruiter_specific/my_listings";
import ListingData from "./components/recruiter_specific/ListingData";
import MyEmployees from "./components/recruiter_specific/my_employees";
import EditApplicantProfile from './components/applicant_specific/edit_profile';
import EditRecruiterProfile from './components/recruiter_specific/edit_profile_recruiter';


const App = () => {
  const [login_details, set_login_details] = useState({
    is_logged_in: false,
    user_email_id: null,
    user_type: null,
    token: null
  });

  const [first_time_done, set_first_time_done] = useState(false);

  const attemptLogin = (user_obj) => {
    // .send({ token: token, email_id: user.email_id })
    console.log("DEBUG: In [attempt login] function in backend\n");
    console.log("usr_obj sent from login backend or from cache is ", user_obj, "\n--------\n");

    //if we have entered this function through login, then we will set details via local storage; else w will reset which isn't a problem
    window.localStorage.setItem(
      'cached_data', JSON.stringify(user_obj)
    );

    set_axios_default_token(user_obj.token);
    console.log("old obj log details in app.js is ", login_details);
    set_login_details({
      is_logged_in: true,
      user_email_id: user_obj.email_id,
      user_type: user_obj.user_type,
      token: user_obj.token
    });
    //Don't expect correct details here as setState is asynchronous
    console.log("newd obj log details in app.js is ", login_details);

  }

  const logout = () => {
    console.log("logging out");
    //ensuring that token gets destroyed
    if (localStorage && localStorage.cached_data) {
      localStorage.removeItem("cached_data");
    }

    set_login_details({
      is_logged_in: false,
      user_type: null,
      token: null
    });
    return <Redirect to="/login" />
  }

  //The empty array as the parameter of the effect ensures that the effect is executed only when the component is rendered for the first time.
  useEffect(() => {
    console.log("in FIRST AFFECT of app.js");
    first_attempt();
  }, [])

  const first_attempt = () => {
    console.log("first attempt function called");


    const loggedUserJSON = window.localStorage.getItem('cached_data');
    console.log("OBJ extracted from key 'cached-data' of local storage is ", loggedUserJSON, "\n-------\n");


    if (loggedUserJSON && (login_details.is_logged_in === false)) {
      console.log("DEBUG: Found cached data pre-saved and hence, taking advantage");
      const user_suspected = JSON.parse(loggedUserJSON);
      attemptLogin(user_suspected);
    }
  }

  //////////////////////////////////////
  first_attempt();
  ////////////////////////////////////////

  return (

    <Fragment>
      {/* Navbar always has to be there */}
      {/* <Navbar /> */}

      {/* This has to be there only for homepage and path must be exact */}
      {/* <Route exact path='/' component={Landing} /> */}


      {/* Switch means that the first match would be rendered
        Without switch,fall through would have happeded and everything would have been
      rendered as far as matching was possible */}
      <Router>
        {/* Navbar quality must depend on current circumstances */}
        <NavbarElem attemptLogout={logout} />



        <Route exact path="/" component={Landing} />

        <section className='container'>
          <Switch>

            <Route exact path="/register"
              render={() => <Register is_logged_in={login_details.is_logged_in} type={login_details.user_type} />}
            />

            <Route exact path="/login"
              render={() => <Login is_logged_in={login_details.is_logged_in} type={login_details.user_type} attemptLogin={attemptLogin} />} />


            {/* //////////////////////////////////////////////////////////////////////////////////////////////////// */}

            <Route exact path="/recruiter/edit_profile"
              render={
                () => <VerifyAccess
                  is_logged_in={login_details.is_logged_in}
                  component_to_use={<EditRecruiterProfile email_id={login_details.user_email_id} />}
                  type={login_details.user_type}
                  category="type_r"
                />} />

            <Route exact path="/recruiter/dashboard"
              render={
                () => <VerifyAccess
                  is_logged_in={login_details.is_logged_in}
                  component_to_use={<RecruiterDashboard email_id={login_details.user_email_id} attemptLogout={logout} />}
                  type={login_details.user_type}
                  category="type_r"
                />} />

            <Route exact path="/recruiter/add_listing"
              render={
                () => <VerifyAccess
                  is_logged_in={login_details.is_logged_in}
                  component_to_use={<Add_listing email_id={login_details.user_email_id} />}
                  type={login_details.user_type}
                  category="type_r"
                />} />

            <Route exact path="/recruiter/my_listings"
              render={
                () => <VerifyAccess
                  is_logged_in={login_details.is_logged_in}
                  type={login_details.user_type}
                  category="type_r"
                  component_to_use={<My_listings email_id={login_details.user_email_id} />}
                />} />

            {/* https://stackoverflow.com/a/45599016/6427607 */}
            <Route exact path="/recruiter/listing_data/:job_id"
              render={
                (props) => <VerifyAccess
                  is_logged_in={login_details.is_logged_in}
                  type={login_details.user_type}
                  category="type_r"
                  component_to_use={<ListingData pursuing_job_id={props.match.params.job_id} email_id={login_details.user_email_id} />}
                />} />

            <Route exact path="/recruiter/my_employees"
              render={
                (props) => <VerifyAccess
                  is_logged_in={login_details.is_logged_in}
                  type={login_details.user_type}
                  category="type_r"
                  component_to_use={<MyEmployees pursuing_job_id={props.match.params.job_id} email_id={login_details.user_email_id} />}
                />} />


            {/* ##################################################################/////////////////////////////////////////////////////////////////////////////////////////////////////////////////// */}

            <Route exact path="/applicant/edit_profile"
              render={
                () => <VerifyAccess
                  is_logged_in={login_details.is_logged_in}
                  type={login_details.user_type}
                  category="type_a"
                  component_to_use={<EditApplicantProfile email_id={login_details.user_email_id} />}
                />} />


            <Route exact path="/applicant/dashboard"
              render={
                () => <VerifyAccess
                  is_logged_in={login_details.is_logged_in}
                  type={login_details.user_type}
                  category="type_a"
                  component_to_use={<ApplicantDashboard email_id={login_details.user_email_id} attemptLogout={logout} />}
                />} />


            <Route exact path="/applicant/all_listings"
              render={
                () => <VerifyAccess
                  is_logged_in={login_details.is_logged_in}
                  type={login_details.user_type}
                  category="type_a"
                  component_to_use={<AllListings email_id={login_details.user_email_id} />}
                />} />

            <Route exact path="/applicant/my_applications"
              render={
                () => <VerifyAccess
                  is_logged_in={login_details.is_logged_in}
                  type={login_details.user_type}
                  category="type_a"
                  component_to_use={<My_applications email_id={login_details.user_email_id} />}
                />} />


            {/* https://stackoverflow.com/a/45599016/6427607 */}
            <Route exact path="/applicant/apply/:job_id"
              render={
                (props) => <VerifyAccess {...props}
                  is_logged_in={login_details.is_logged_in}
                  type={login_details.user_type}
                  category="type_a"
                  component_to_use={<Apply_job pursuing_job_id={props.match.params.job_id} email_id={login_details.user_email_id} />}
                />} />

            <Route path="/" component={default_comp} />
            {/* <Route exact path="/auth/logout" render={this.logout} /> */}
          </Switch>

        </section>
      </Router>


    </Fragment>
  )
};

export default App;
