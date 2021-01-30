import React from 'react';
import {
  Switch,
  Route
} from "react-router-dom";
import Navbar from 'react-bootstrap/Navbar';
import Nav from 'react-bootstrap/Nav';
import { Button } from 'react-bootstrap';

const NavbarElem = (props) => {
  return (
    <React.Fragment>



      <div>
        {/* <ul>
          <li>
            <Link to="/">Home</Link>
          </li>
          <li>
            <Link to="/about">About</Link>
          </li>
          <li>
            <Link to="/dashboard">Dashboard</Link>
          </li>
        </ul>

        <hr /> */}

        {/*
          A <Switch> looks through all its children <Route>
          elements and renders the first one whose path
          matches the current URL. Use a <Switch> any time
          you have multiple routes, but you want only one
          of them to render at a time
        */}
        <Switch>
          {/* //////////////////////////////////////////////////////////////////////////////////////////////// */}

          <Route path="/applicant">
            <Navbar collapseOnSelect expand="lg" bg="dark" variant="dark">

              <Navbar.Brand href="/">
                <i className="fas fa-jedi"></i>
                         Job Portal
             </Navbar.Brand>

              <Navbar.Toggle aria-controls="responsive-navbar-nav" />

              <Navbar.Collapse id="responsive-navbar-nav">

                <Nav className="mr-auto">
                  <Nav.Link href="/applicant/dashboard">Dashboard</Nav.Link>
                  <Nav.Link href="/applicant/my_applications">My applications</Nav.Link>
                  <Button variant="dark" onClick={() => (props.attemptLogout())}>Log Out</Button>
                </Nav>

              </Navbar.Collapse>

            </Navbar>
          </Route>

          {/* //////////////////////////////////////////////////////////////////////////////////////////////// */}
          <Route path="/recruiter">
            <Navbar collapseOnSelect expand="lg" bg="dark" variant="dark">

              <Navbar.Brand href="/">
                <i className="fas fa-jedi" />
                       Job Portal
              </Navbar.Brand>

              <Navbar.Toggle aria-controls="responsive-navbar-nav" />

              <Navbar.Collapse id="responsive-navbar-nav">

                <Nav className="mr-auto">
                  <Nav.Link href="/recruiter/dashboard">Dashboard</Nav.Link>
                  <Nav.Link href="/recruiter/my_listings">My listings</Nav.Link>
                  <Nav.Link href="/recruiter/my_employees">My Employees</Nav.Link>
                  <Button variant="dark" onClick={() => (props.attemptLogout())}>Log Out</Button>
                </Nav>

              </Navbar.Collapse>

            </Navbar>
          </Route>
          {/* //////////////////////////////////////////////////////////////////////////////////////////////// */}


          <Route path="/">
            <Navbar collapseOnSelect expand="lg" bg="dark" variant="dark">

              <Navbar.Brand href="/">
                <i className="fas fa-jedi"></i>
                {"      Job Portal        "}
              </Navbar.Brand>
              <Navbar.Toggle aria-controls="responsive-navbar-nav" />
              <Navbar.Collapse id="responsive-navbar-nav">
                <Nav className="mr-auto">
                  <Nav.Link href="/login">Login</Nav.Link>
                  <Nav.Link href="/register">Register</Nav.Link>
                </Nav>

              </Navbar.Collapse>

            </Navbar>
          </Route>

        </Switch>
      </div>
    </React.Fragment>
  );
};


export default NavbarElem;
