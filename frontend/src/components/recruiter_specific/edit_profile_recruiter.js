import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Validate_helper from "../../helper_files/validation_helper";
const ErrorNotification = require("../notification").Error_notification;
const SuccessNotification = require("../notification").Success_notification;

const EditRecruiterProfile = (props_sent) => {
    console.log("In EDIT APPLICANT.js");
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
        user_type: "type_r",
        ///////////////////
        phone_num: "",
        bio: ""
    });

    const [master_data, set_master_data] = useState();

    const { name, email_id, user_type, phone_num, bio } = formData;


    ////#########################################################################################################
    // Takes care of handling change in inputs
    const onChange = e => {
        console.log(typeof e.target.value);
        let val_set = e.target.value;
        if (e.target.name === "phone_num" ) {
            console.log("YEP");
            val_set = Validate_helper.get_pos_integer(val_set);
        }
        console.log("Setter ", e.target.name, ": ", val_set);
        setFormData({ ...formData, [e.target.name]: val_set });
    }

    /////////////////////////////////////////////////////////////////////////////////

    const update_form_master = () => {
        let tmp_error_arr = [];
        let tmp_success_arr = [];

        let baseUrl = "http://localhost:5000/api/users/recruiter/get_profile";

        axios.get(baseUrl, {
            params: {
                email_id: props_sent.email_id
            }
        }).then((response) => {
            console.log("Axios response is ", response.data);
            let tmp_data_have = { ...response.data };

            set_master_data(tmp_data_have);
            setFormData({ ...formData, ...tmp_data_have });
            // tmp_success_arr.push("Data fetch successful");
            // set_success_messages_arr(tmp_success_arr);


            // //When the error occurs we add a descriptive error message to the errorMessage state. At the same time we start a timer, that will set the errorMessage state to null after five seconds.
            // setTimeout(() => {
            //     set_success_messages_arr([])
            // }, 5000);
        }).catch((error) => {
            //   //https://gist.github.com/fgilio/230ccd514e9381fafa51608fcf137253
            console.log("Error obj is ", error);
            if (error.response) {
                /*
                 * The request was made and the server responded with a
                 * status code that falls out of the range of 2xx
                 */
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
            }
            else if (error.request) {
                /*
                 * The request was made but no response was received, `error.request`
                 * is an instance of XMLHttpRequest in the browser and an instance
                 * of http.ClientRequest in Node.js
                 */
                tmp_error_arr.push(error.message);

                console.log("2 error->", error.message);
            }
            else {
                // Something happened in setting up the request and triggered an Error
                console.log('e Error is ', error.message);
            }
            set_error_messages_arr(tmp_error_arr);

            //When the error occurs we add a descriptive error message to the errorMessage state. At the same time we start a timer, that will set the errorMessage state to null after five seconds.
            setTimeout(() => {
                set_error_messages_arr([])
            }, 5000);
        });
    };

    useEffect(() => {
        console.log("in use effect of edit RECRUITER profile");
        update_form_master();
    }, []);


    const onSubmit = async (e) => {
        e.preventDefault();
        let tmp_error_arr = [];
        let tmp_success_arr = [];
        if (user_type === "type_r" && phone_num.toString().length !== 10) {
            alert('Phone number must have 10 digits');
            tmp_error_arr.push("Phone number must have 10 digits");
          }
        if (tmp_error_arr.length === 0) {
            console.log("Modified data is ", formData);
            alert('You have submitted the form.');
            try {
                let baseUrl;
                if (user_type === "type_r") {
                    baseUrl = "http://localhost:5000/api/users/recruiter/edit_profile";
                }
                else {
                    baseUrl = "http://localhost:5000/api/users/applicant/edit_profile";
                }

                const response = await axios.post(baseUrl, formData);
                console.log("Axios response is ", response);
                tmp_success_arr.push("Profile updation successful");
                set_success_messages_arr(tmp_success_arr);
                update_form_master();

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
        }, 2000);

    };


    return (
        <React.Fragment>
            <h1 className='large text-primary'>Edit Profile</h1>
            {error_messages_arr.map((e) => (<ErrorNotification key={e} message={e} />))}

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
                        readOnly
                    />
                    <small id="emailHelp" className="form-text text-muted">We'll never share your email with anyone else.</small>

                </div>



                <div className='form-group'>
                    <label htmlFor="comboA">USER TYPE</label>

                    <select id="comboA"
                        className="form-control" name="user_type" onChange={e => onChange(e)} value={user_type} disabled>
                        {/* <option value="">Select combo</option> */}
                        <option value="type_a">Applicant</option>
                        <option value="type_r">Recruiter</option>
                    </select>
                </div>

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
                                maxLength="250"
                                onChange={e => onChange(e)}
                                value={bio}
                            />

                        </div>
                        <hr />

                    </React.Fragment>
                }
                <br></br>
                <hr />
                {/* Error div             Success div */}

                {success_messages_arr.map((e) => (<SuccessNotification key={e} message={e} />))}

                <br></br>
                <br />
                <input type='submit' className='btn btn-primary btn-lg' value='Update Profile' />
            </form>

        </React.Fragment >
    );
};

export default EditRecruiterProfile;
