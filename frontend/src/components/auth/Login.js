import React, { Fragment, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { Redirect } from 'react-router-dom';
const ErrorNotification = require("../notification").Error_notification;
// const SuccessNotification = require("../notification").Success_notification;
//######################################################################################################

const Login = (props_sent) => {
  //####################################################################################
  const [formData, setFormData] = useState({
    email_id: '',
    password: ''
  });
  const [error_messages_arr, set_error_messages_arr] = useState([]);     //success messages array
  // const [success_messages_arr, set_success_messages_arr] = useState([]);
  const { email_id, password } = formData;
  //####################################################################################

  ////////////////////////////////////////////////////////////////////////////////////////
  let allow_further = true;
  if (!props_sent.is_logged_in) {
    //aready logged in
    allow_further = false;
  }
  if (allow_further) {
    if (props_sent.type === "type_a") {
      return <Redirect to="/applicant/dashboard" />;
    } else {
      return <Redirect to="/recruiter/dashboard" />;
    }
  }
  //#####################################################


  const onChange = e =>
    setFormData({ ...formData, [e.target.name]: e.target.value });


  const login_attempt = async credentials => {
    const baseUrl = 'http://localhost:5000/api/auth';
    console.log("Client trying to login with input as follows: ", credentials);
    const response = await axios.post(baseUrl, credentials);
    console.log("Response to login attempt ", response);
    return response.data;
  }

  const handleLogin = async (event) => {
    event.preventDefault();
    let tmp_error_arr = [];
    // let tmp_suc_arr = [];

    try {

      const user = await login_attempt({
        email_id, password,
      });
      console.log("User is ", user);
      // tmp_suc_arr.push("Login successful");
      // set_success_messages_arr(tmp_suc_arr);
      // setTimeout(() => {
      //   set_success_messages_arr([])
      // }, 5000);

      props_sent.attemptLogin(user);
    }
    catch (error) {
      //   //https://gist.github.com/fgilio/230ccd514e9381fafa51608fcf137253
      console.log("Error obj is ", error);
      if (error.response) {
        /*
         * The request was made and the server responded with a
         * status code that falls out of the range of 2xx
         */
        console.log("In catch block");
        if (error.response.data) {
          console.log(error.response.data.errors);
          error.response.data.errors.map((e) => {
            tmp_error_arr.push(e.msg);
            console.log("debug e is ", e);
            return e;
          });
        }
        else {
          tmp_error_arr.push("THERE SEEMS TO BE A NETWORK ERROR");
          console.log("There seems to have been a network error");
        }
      } else if (error.request) {
        /*
         * The request was made but no response was received, `error.request`
         * is an instance of XMLHttpRequest in the browser and an instance
         * of http.ClientRequest in Node.js
         */
        console.log(" request was made but no response was received");

        tmp_error_arr.push(error.message);

        console.log("2 error->", error.message);
      } else {
        // Something happened in setting up the request and triggered an Error
        console.log('e Error is ', error.message);
      }
      set_error_messages_arr(tmp_error_arr);
      setTimeout(() => {
        set_error_messages_arr([])
      }, 5000);

    }

  }


  return (
    <Fragment>

      <h1 className='large text-primary'>Sign In</h1>
      <p>
        <b>Sign Into Your Account</b>
      </p>
      {/* 
     ########################################
      Beginning of form div
      ######################################### */}
      <form className='form' onSubmit={e => handleLogin(e)}>

        {/* Email field */}
        <div className='form-group'>
          <label htmlFor="f1" className="form-label">Email address</label>

          <input
            type='email'
            placeholder='Email Address'
            name='email_id'
            value={email_id}
            onChange={e => onChange(e)}
            className="form-control"
            id="f1"
            required
          />
        </div>

        {/* password field */}
        <div className='form-group'>
          <label htmlFor="f2" className="form-label">Password</label>
          <input
            type='password'
            placeholder='Password'
            name='password'
            value={password}
            className="form-control"
            id="f2"
            onChange={e => onChange(e)}
            required
          />
        </div>

        {/* Error div             Success div */}
        {error_messages_arr.map((e) => (<ErrorNotification key={e} message={e} />))}
        {/* {success_messages_arr.map((e) => (<SuccessNotification key={e} message={e} />))} */}

        <input type='submit' className='btn btn-primary btn-lg' value='Login' />


      </form>


      <p className='my-1'>
        Don't have an account? <Link to='/register'>Sign Up</Link>
      </p>
    </Fragment>
  );
};

export default Login;