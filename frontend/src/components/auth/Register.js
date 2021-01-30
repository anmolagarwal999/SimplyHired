import React, { useState } from 'react';
import axios from 'axios';
import { Redirect } from 'react-router-dom';
import Validate_helper from "../../helper_files/validation_helper";
const ErrorNotification = require("../notification").Error_notification;
const SuccessNotification = require("../notification").Success_notification;

const Register = (props_sent) => {
  console.log("In register.js");

  // // If logged in already, redirect to dashboard
  // If not logged in, register option given Here
  // Display form and chnage form fields based on this fields
  // Change username, password here temporarily,
  // if rejected, display error, else set username and redirection will be already set

  const [error_messages_arr, set_error_messages_arr] = useState([]);     //success messages array
  const [success_messages_arr, set_success_messages_arr] = useState([]);


  const external_skills = ["MACHINE LEARNING", "NETWORK PROGRAMMING", "FUNCTIONAL PROGRAMMING", "DATABASE DESIGN"];


  const [formData, setFormData] = useState({
    name: '',
    email_id: '',
    password: '',
    password2: '',
    user_type: "type_a",

    ///////////////////
    curr_skill: '',
    skills_list: [],
    //-----------------------
    ed_list: [],
    curr_college: "",
    curr_end_yr: "",
    curr_start_yr: "",
    ////////////////////
    phone_num: "",//not a mandatory field
    bio: "" //not mandatory, max length 250
  });

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

  ////////////////////////////////////////////////////////////////////////////

  const { name, email_id, password, password2, user_type, curr_skill, skills_list, curr_college, curr_start_yr, curr_end_yr, ed_list, phone_num, bio } = formData;

  // Takes care of handling change in inputs
  const onChange = e => {
    console.log(typeof e.target.value);
    let val_set = e.target.value;
    if (e.target.name === "curr_start_yr" || e.target.name === "curr_end_yr" || e.target.name === "phone_num") {
      // console.log("YEP");
      val_set = Validate_helper.get_pos_integer(val_set);
    }


    if (e.target.name === "bio") {
      let words = val_set.split(/\s+/);
      let maxWords = 250;
      let numWords = words.length;
      if (numWords > maxWords) {
        alert("Word limit reached");
        return;
      }
    }
    console.log("Setter ", e.target.name, ": ", val_set);
    setFormData({ ...formData, [e.target.name]: val_set });
  }

  const onSubmit = async (e) => {
    e.preventDefault();
    console.log("target is ", e.target);
    let tmp_error_arr = [];
    let tmp_success_arr = [];
    if (password !== password2) {
      console.log('Passwords do not match');
      tmp_error_arr.push("Passwords do not match");
      alert('Passwords do not match');

    }
    if (!Validate_helper.is_valid_email(email_id)) {
      alert('Invalid email');
      tmp_error_arr.push("Email is invalid");
    }
    if (user_type === "type_r" && phone_num.toString().length !== 10) {
      alert('Phone number must have 10 digits');
      tmp_error_arr.push("Phone number must have 10 digits");
    }
    if (tmp_error_arr.length === 0) {
      console.log(formData);
      alert('You have submitted the form.');
      try {
        let baseUrl;
        if (user_type === "type_r") {
          baseUrl = "http://localhost:5000/api/users/recruiter";
        }
        else {
          baseUrl = "http://localhost:5000/api/users/applicant";
        }

        const response = await axios.post(baseUrl, formData);
        console.log("Axios response is ", response);
        tmp_success_arr.push("Registration successful");
        set_success_messages_arr(tmp_success_arr);

        setTimeout(() => {
          set_success_messages_arr([])
        }, 5000);

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

      }
    }

    set_error_messages_arr(tmp_error_arr);
    //When the error occurs we add a descriptive error message to the errorMessage state. At the same time we start a timer, that will set the errorMessage state to null after five seconds.
    setTimeout(() => {
      set_error_messages_arr([])
    }, 5000);

  };


  const add_skill = () => {
    console.log("trying to add skill as ", curr_skill);
    if (curr_skill.length < 1) {
      alert("Skill foeld must have atleast one character");
      return;
    }
    //check if skill not already there, then add skill
    let skill_to_add = curr_skill.toUpperCase();
    if (!skills_list.includes(skill_to_add)) {
      let tmp_list = skills_list.map((s) => (s));
      if (external_skills.includes(skill_to_add)) {
        alert("This skill is already present externally. No need to add separately.Use the checkbox instead.");
        setFormData({ ...formData, "curr_skill": "" });
        return;
      }
      tmp_list.push(skill_to_add);
      setFormData({ ...formData, "curr_skill": "", "skills_list": tmp_list });

    }
    else {
      //skill has already been added
      setFormData({ ...formData, "curr_skill": "" });
    }

  }

  const delete_skill = (skill_to_delete) => {
    console.log("trying to delete skill : ", skill_to_delete);

    let tmp_list = skills_list.filter((s) => (s !== skill_to_delete));
    setFormData({ ...formData, "skills_list": tmp_list });
  }

  const delete_college = (college_to_go) => {
    console.log("trying to delete college entry : ", college_to_go);

    let tmp_list = ed_list.filter((s) => ((s.institute !== college_to_go.institute) ||
      (s.start_yr !== college_to_go.start_yr) ||
      (s.end_yr !== college_to_go.end_yr)));
    setFormData({ ...formData, "ed_list": tmp_list });
  }

  const add_college = () => {

    if (curr_college.length === 0) {
      alert("Institute name must have atleast one character");
      return;
    }
    if (curr_start_yr.length === 0) {
      alert("A start year must be present");
      return;
    }

    if (Number(curr_start_yr.length) === 0) {
      alert("A start year must be present");
      return;
    }
    let a1 = parseInt(curr_start_yr);
    let a2 = parseInt(curr_end_yr);
    if (curr_end_yr.length !== 0) {

      if (a1 > a2) {
        alert("Start year must be less than or equal to end year!! ");
        return;
      }

      if (a2 > 2050) {
        alert("Be reasonable. Alert year cannot exceed 2050 ");
        return;
      }

    }

    if (a1 > 2021) {
      alert("Start year cannot exceed 2021");
      return;
    }

    if (a1 < 1900) {
      alert("Start year cannot be before than 1900");
      return;
    }
    let tmp_obj = { "institute": curr_college, "start_yr": curr_start_yr, "end_yr": curr_end_yr };
    let tmp_list = ed_list.map((s) => (s));
    tmp_list.push(tmp_obj);
    setFormData({ ...formData, "curr_college": "", "curr_start_yr": "", "curr_end_yr": "", ed_list: tmp_list });

  }

  const checkbox_clicked = (e, skill_str) => {
    if (e.currentTarget.checked) {
      // alert('checked');
      //skill added
      let tmp_list = [...skills_list, skill_str];
      setFormData({ ...formData, "skills_list": tmp_list });
    } else {
      //  alert('not checked');
      //skill removed
      let tmp_list = skills_list.filter((s) => (s !== skill_str));
      setFormData({ ...formData, "skills_list": tmp_list });
    }
  }


  return (
    <React.Fragment>
      <h1 className='large text-primary'>Sign Up</h1>
      <p>Create Your Account with us</p>


      {/* //////////////////////////////////////////////////////////////////////////////////////////////////////// */}
      <form id="registration_form" className='form' onSubmit={e => onSubmit(e)}>

        <div className='form-group'>
          <label htmlFor="f1">Name</label>
          <input
            className="form-control"
            type='text'
            id="f1"
            placeholder='Enter Name'
            name='name'
            value={name}
            onChange={e => onChange(e)}
            required
          />
        </div>

        <div className='form-group'>
          <label htmlFor="f2">Email</label>

          <input
            type='email'
            id="f2"
            className="form-control"
            placeholder='Email Address'
            name='email_id'
            value={email_id}
            onChange={e => onChange(e)}
            required
          />
          <small id="emailHelp" className="form-text text-muted">We'll never share your email with anyone else.</small>

        </div>


        <div className='form-group'>
          <label htmlFor="f3">Password</label>

          <input
            type='password'
            id="f3"
            className="form-control"
            placeholder='Password'
            name='password'
            value={password}
            onChange={e => onChange(e)}
            minLength="1"
            required
          />
          <small className="form-text text-muted">
            Unless your name is X Æ A-Xii, it is not a good idea to keep passwords prefixed with your name :)
          </small>

        </div>


        <div className='form-group'>
          <label htmlFor="f4">Re-enter password</label>

          <input
            type='password'
            id="f4"
            className="form-control"
            placeholder='Confirm Password'
            name='password2'
            value={password2}
            onChange={e => onChange(e)}
            minLength="1"
            required
          />
        </div>


        <div className='form-group'>
          <label htmlFor="comboA">USER TYPE</label>

          <select id="comboA"
            className="form-control" name="user_type" onChange={e => onChange(e)} value={user_type}>
            {/* <option value="">Select combo</option> */}
            <option value="type_a">Applicant</option>
            <option value="type_r">Recruiter</option>
          </select>
        </div>

        <br></br>
        <hr />

        {/* /////////////////////////////
         For applicant 
         ////////////////////////////////////////////////////////////////////////////////////////////////*/}

        {user_type === "type_a" &&
          <React.Fragment>
            <div className='form-group'>
              <label htmlFor="f22"><b>ENTER YOUR SKILLS</b></label>


              <div>
                <p>Some popular skills these days can be selected from below</p>
                {external_skills.map((s) => {
                  return (
                    <div key={s} className="form-check form-check-inline">
                      <input className="form-check-input" type="checkbox" id={"inlineCheckbox" + s} value={s} onChange={(e) => checkbox_clicked(e, s)} />
                      <label className="form-check-label" htmlFor="inlineCheckbox1">{s}</label>
                      <br></br>
                      <br></br>
                    </div>)
                })}
              </div>



              <input
                type='text'
                placeholder='Enter a language/skill to add to list of total list of languages you know'
                id="f22"
                className="form-control"
                name='curr_skill'
                value={curr_skill}
                onChange={e => onChange(e)}
              />
              <br></br>
              <button type="button" className="btn btn-secondary btn-sm" onClick={() => add_skill()}>ADD this skill</button>
            </div>

            <table className="table table-sm">
              <thead>
                <tr>
                  <th scope="col">#</th>
                  <th scope="col">Skill Name</th>
                  <th scope="col">Possible Actions</th>
                </tr>
              </thead>
              <tbody>
                {skills_list.map((skill_there, idx) => {
                  return (
                    <tr key={skill_there}>
                      <th scope="row">{idx + 1}</th>
                      <td>{skill_there}</td>
                      {(!(external_skills.includes(skill_there))) &&
                        <td><button type="button" className="btn btn-dark btn-sm" onClick={() => delete_skill(skill_there)}>Delete this skill</button></td>}
                      {((external_skills.includes(skill_there))) &&
                        <td>-</td>}
                    </tr>);
                })}


              </tbody>
            </table>


            <br></br>
            {/* /////////////////////////////////////////////////////////////////////////////// */}
            <hr></hr>


            <h4>Educational details</h4>

            <table className="table table-sm">
              <thead>
                <tr>
                  <th scope="col">#</th>
                  <th scope="col">Institute</th>
                  <th scope="col">Start year</th>
                  <th scope="col">End year</th>
                  <th scope="col">Possible action</th>
                </tr>
              </thead>
              <tbody>
                {ed_list.map((e_obj, idx) => (
                  <tr key={e_obj.institute + " " + e_obj.start_yr + " " + e_obj.end_yr}>
                    <td>{idx + 1}</td>
                    <td>{e_obj.institute}</td>
                    <td>{e_obj.start_yr}</td>
                    <td>{e_obj.end_yr}</td>
                    <td><button type="button" className="btn btn-dark btn-sm" onClick={() => delete_college(e_obj)}>Delete this entry</button></td>

                  </tr>
                ))}
              </tbody>
            </table>
            <br></br>

            <div className="form-group">
              <label htmlFor="f25">ENTER institute name</label>
              <input
                type='text'
                placeholder='Enter institute name'
                name='curr_college'
                id="f25"
                className="form-control"
                value={curr_college}
                onChange={e => onChange(e)}
              />
            </div>
            <div className="form-row">
              <div className="col">
                <label htmlFor="f27">Start year</label>
                <input type="text" name="curr_start_yr" id="f27" className="form-control" value={curr_start_yr} onChange={e => onChange(e)} />
              </div>
              <div className="col">
                <label htmlFor="f28">End year</label>
                <input type="text" name="curr_end_yr" id="f28" className="form-control" value={curr_end_yr} onChange={e => onChange(e)} />
              </div>
            </div>
            <br></br>
            <button type="button" className='btn btn-secondary btn-sm' onClick={() => add_college()}>ADD this educational instance</button>

            <br></br>

            <hr />




          </React.Fragment>
        }

        {/* /////////////////////////////
         For Recruiter
         ////////////////////////////////////*/}
        {user_type === "type_r" &&
          <React.Fragment>
            <label htmlFor="f12">Phone Number</label>
            <div className='form-group'>
              <input
                type='text'
                id="f12"
                className="form-control"
                placeholder='Enter phone number here'
                name='phone_num'
                value={phone_num}
                onChange={e => onChange(e)}
              />
            </div>

            <div className='form-group'>
              <label htmlFor="f13">Enter bio information</label>

              <textarea
                form="registration_form"
                name="bio"
                rows="4"
                cols="50"
                id="f13"
                className="form-control"
                onChange={e => onChange(e)}
                value={bio}
              />

            </div>
            <hr />

          </React.Fragment>
        }

        {/* Error div             Success div */}
        {error_messages_arr.map((e) => (<ErrorNotification key={e} message={e} />))}
        {success_messages_arr.map((e) => (<SuccessNotification key={e} message={e} />))}

        <br></br>
        <br />
        <input type='submit' className='btn btn-primary btn-lg' value='Register' />
      </form>

      <p className='my-1'>
        Already have an account with us ? <a href='login.html'>Sign In</a>
      </p>
    </React.Fragment >
  );
};

export default Register;
