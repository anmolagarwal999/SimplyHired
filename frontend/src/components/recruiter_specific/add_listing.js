import React, { Fragment, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { Button } from 'react-bootstrap';
import Validate_helper from "../../helper_files/validation_helper";
import { makeStyles } from '@material-ui/core/styles';
import TextField from '@material-ui/core/TextField';
import DateAndTimePickers from "./../date_time_comp"
const ErrorNotification = require("../notification").Error_notification;
const SuccessNotification = require("../notification").Success_notification;


const Notification = ({ message }) => {
    if (message === null) {
        return null;
    }

    return (
        <div className="error" style={{ color: 'red' }}>
            Error which occurred is : {message}
        </div>
    )
}


/*
Things needed, 
//title, 
//max_applications : positive integer
//num_slots : positive integer
//date of posting : automated
//date of deadline
//reqd_skills
//job duration, integer between 0 and 6
//salary: positive integer
//job_type : enum 
*/


const Add_listing = (props) => {

    const [errorMessage, setErrorMessage] = useState([]);


    const [error_messages_arr, set_error_messages_arr] = useState([]);     //success messages array
    const [success_messages_arr, set_success_messages_arr] = useState([]);

    const default_form_fields = {
        title: '',
        max_applications: '',
        num_slots: "",
        reqd_skills: [],
        job_duration: "",
        salary: "",
        job_type: "full_time",
        curr_skill: "",
        date_of_posting: "",
        date_of_deadline: "2021-05-24T10:30"
    };


    const [formData, setFormData] = useState({ ...default_form_fields });

    const { title, max_applications, num_slots, reqd_skills, job_duration, salary, job_type, curr_skill, date_of_deadline, date_of_posting } = formData;

    ///////////////////////////////////////////////////////////

    const onSubmit = async (e) => {
        e.preventDefault();
        let current_dts = new Date();;
        let deadline_str = date_of_deadline + ":59";
        let deadline_dts = new Date(deadline_str);
        let time_diff = deadline_dts - current_dts;
        console.log("Time diff is ", time_diff)
        console.log("deadline dts obj is ", deadline_dts);
        console.log("Current dts obj is ", current_dts);
        let tmp_error_arr = [];
        let tmp_success_arr = [];
        if (time_diff <= 0) {
            tmp_error_arr.push("Deadline date and time cannot be in the past");
            alert("Deadline date and time cannot be in the past");
            //return;
        }
        let next_val_to_use = Validate_helper.get_iso_date_str_from_obj(deadline_dts);
        let val_to_use = Validate_helper.get_iso_date_str_from_obj(current_dts);
        console.log("val to use is ", val_to_use);
        console.log("NExt val to use is ", next_val_to_use);
        //https://stackoverflow.com/questions/54069253/usestate-set-method-not-reflecting-change-immediately
        let form_actually_submit = {
            ...formData,
            "date_of_deadline": next_val_to_use,
            "date_of_posting": val_to_use
        };
        console.log("Prelim", form_actually_submit);

        // setFormData({
        //     ...formData,
        // });
        // console.log("form trying to submit is ", formData);

        //set current submission date obj
        //add seconds to deadline and convert it into date obj
        //check validity via data objs
        //set submission time for form
        //submit everything



        if (tmp_error_arr.length === 0) {
            console.log(form_actually_submit);
            alert('You have submitted the form.');
            try {
                let baseUrl;
                // if (user_type === "type_r") {
                //     baseUrl = "http://localhost:5000/api/recruiters/listings/add";
                // }
                // else {
                //     baseUrl = "http://localhost:5000/api/users/applicant";
                // }
                baseUrl = "http://localhost:5000/api/recruiters/listings/add";

                const response = await axios.post(baseUrl, form_actually_submit);
                console.log("Axios response is ", response);
                tmp_success_arr.push("Listing added successfully");
                set_success_messages_arr(tmp_success_arr);
                setFormData({...default_form_fields});


                //When the error occurs we add a descriptive error message to the errorMessage state. At the same time we start a timer, that will set the errorMessage state to null after five seconds.
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

    ////////////////////////////////////////////////////////////////
    // Takes care of handling change in inputs
    const onChange = e => {
        const numeric_fields = ["max_applications", "num_slots", "job_duration", "salary"];
        let value_to_set = e.target.value;
        console.log(typeof value_to_set);
        if (numeric_fields.includes(e.target.name)) {
            if (value_to_set !== "") {
                value_to_set = Validate_helper.get_pos_integer(value_to_set);
                if (e.target.name === "job_duration") {
                    if (value_to_set !== "" && value_to_set > 6) {
                        value_to_set = "";
                        alert("max value of duration cannot exceed 6 months");
                    }
                }
                if (e.target.name === "max_applications" || e.target.name === "num_slots") {
                    if (value_to_set !== "" && value_to_set === 0) {
                        value_to_set = "";
                        alert("Zero not allowed here. If you want a zero here, why even post the listing ????");
                    }
                }

            }



        }
        console.log("Setter ", e.target.name, ": ", value_to_set);
        setFormData({ ...formData, [e.target.name]: value_to_set });
    }
    /////////////////////////////////////////////////////////

    const add_skill = () => {
        console.log("trying to add skill as ", curr_skill);
        if (curr_skill.length < 1) {
            alert("Skill foeld must have atleast one character");
            return;
        }
        //check if skill not already there, then add skill
        let skill_to_add = curr_skill;
        if (!reqd_skills.includes(skill_to_add)) {
            let tmp_list = reqd_skills.map((s) => (s));
            tmp_list.push(skill_to_add);
            setFormData({ ...formData, "curr_skill": "", "reqd_skills": tmp_list });

        }
        else {
            setFormData({ ...formData, "curr_skill": "" });
        }

    }

    const delete_skill = (skill_to_delete) => {
        console.log("trying to delete skill : ", skill_to_delete);

        let tmp_list = reqd_skills.filter((s) => (s !== skill_to_delete));
        setFormData({ ...formData, "reqd_skills": tmp_list });
    }

    /////////////////////////////////////////////////////////////////////////
    // maxLength="250"
    return (
        <Fragment>
            <h1 className='large text-primary'>Add New Listing</h1>
            <p>
                <b>Enter details</b>
            </p>

            {error_messages_arr.map((e) => (<ErrorNotification key={e} message={e} />))}



            <form id="registration_form" className='form' onSubmit={e => onSubmit(e)}>


                <div className='form-group'>
                    <label htmlFor="f1">Job Title</label>

                    <input
                        type='title'
                        placeholder='Enter JOB title'
                        name='title'
                        id="f1"
                        className="form-control"
                        value={title}
                        onChange={e => onChange(e)}
                        required
                    />
                </div>

                {/* //////////////////////////////////////////////////////// */}

                <div className='form-group'>
                    <label htmlFor="f2">Number of total slots</label>

                    <input
                        type='text'
                        placeholder='(Non-zero) Enter maximum number of SLOTS THERE'
                        name='num_slots'
                        id="f2"
                        className="form-control"
                        value={num_slots}
                        onChange={e => onChange(e)}
                        required
                    />
                </div>
                {/* ////////////////////////////////////////////////////////// */}
                <div className='form-group'>
                    <label htmlFor="f3">Total number of applications submissible</label>

                    <input
                        type='text'
                        placeholder='(Non-zero) Enter maximum number of APPLICATIONS'
                        // placeholder='(Non-zero) Enter maximum number of SLOTS THERE'
                        name='max_applications'
                        id="f3"
                        className="form-control"
                        value={max_applications}
                        onChange={e => onChange(e)}
                        required
                    />
                </div>
                {/* ////////////////////////////////////////////////////////// */}
                <div className='form-group'>
                    <label htmlFor="f4">Job Type</label>

                    <select id="comboA" id="f4"
                        className="form-control"
                        name="job_type" onChange={e => onChange(e)} value={job_type}>
                        {/* <option value="">Select combo</option> */}
                        <option value="full_time">full_time</option>
                        <option value="part_time">Part Time</option>
                        <option value="work_from_home">Work From Home</option>
                    </select>
                </div>
                {/* ///////////////////////////////////////////////////////////// */}
                <div className='form-group'>
                    <label htmlFor="f5">Job Duration (0-6 months only)</label>

                    <input
                        type='text'
                        placeholder='Enter job duration in months (from 0 to 6 only)'
                        name='job_duration'
                        value={job_duration}
                        id="f5"
                        className="form-control"
                        onChange={e => onChange(e)}
                        maxLength="1" //to keep number single digit
                        required
                    />
                </div>
                {/* ////////////////////////////////////////////////////////// */}
                <div className='form-group'>
                    <label htmlFor="f6">Offered Salary</label>

                    <input
                        type='text'
                        placeholder='Enter salary'
                        name='salary'
                        id="f6"
                        className="form-control"
                        value={salary}
                        onChange={e => onChange(e)}
                        required
                    />
                </div>
                {/* ////////////////////////////////////////////////////////// */}


                <div className='form-group'>
                    <label htmlFor="f7">Preferred Skills</label>


                    <table className="table table-sm">
                        <thead>
                            <tr>
                                <th scope="col">#</th>
                                <th scope="col">Skill Name</th>
                                <th scope="col">Possible Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {reqd_skills.map((skill_there, idx) => {
                                return (
                                    <tr key={skill_there}>
                                        <th scope="row">{idx + 1}</th>
                                        <td>{skill_there}</td>

                                        <td><button type="button" className="btn btn-danger btn-sm" onClick={() => delete_skill(skill_there)}>Delete this skill</button></td>

                                    </tr>);
                            })}


                        </tbody>
                    </table>




                    <input
                        type='text'
                        id="f7"
                        className="form-control"
                        placeholder='Enter a language to add to list of total list of languages you DEMAND FROM AN APPLICANT'
                        name='curr_skill'
                        value={curr_skill}
                        onChange={e => onChange(e)}
                    />
                    <button type="button" className='btn btn-dark btn-sm' onClick={() => add_skill()}>ADD this skill</button>
                </div>

                {/* //////////////////////////////////////////////////////////////////////////////s */}
                <div className='form-group'>
                    <label htmlFor="f8">Last date and time for application</label>
                    <br />
                    <DateAndTimePickers id="f8" onChange={onChange} expected_name={"date_of_deadline"} sent_value={date_of_deadline} />
                </div>




                <br></br>


                {success_messages_arr.map((e) => (<SuccessNotification key={e} message={e} />))}


                <input type='submit' className='btn btn-primary btn-lg' value='Add listing' />
            </form>


        </Fragment >
    );
}

export default Add_listing;