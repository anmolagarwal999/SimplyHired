import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Button } from 'react-bootstrap';
import Alert from 'react-bootstrap/Alert';
import Table from 'react-bootstrap/Table';
import moment from 'moment';
import DateAndTimePickers from "../date_time_comp";
import Validate_helper from "../../helper_files/validation_helper";
const ErrorNotification = require("../notification").Error_notification;
const SuccessNotification = require("../notification").Success_notification;



/*
Things needed, =>username (email_id) for displaying name, (attemptLogout) logout function, */
/*
Fields I would need:
all job details,
//rest can in the backend it seems
*/

const My_listings = (props) => {

    //variable to keep track of all current jobs
    const [jobs_master, set_jobs_master] = useState([]);


    //a form to edit jobs
    const [edit_job_form, set_edit_job_form] = useState({
        updated_job_obj: null,
        updated_max_applications: '',
        updated_num_slots: "",
        updated_date_of_deadline: "2021-05-24T10:30"
    });

    //variable whether form is visible or not
    const [track_edit_job, set_track_edit_job] = useState(false);



    //error messages array
    const [error_messages_arr, set_error_messages_arr] = useState([]);


    //success messages array
    const [success_messages_arr, set_success_messages_arr] = useState([]);

    const onSubmit = async (e) => {
        e.preventDefault();
        let current_dts = new Date();;
        let deadline_str = edit_job_form.updated_date_of_deadline + ":59";
        let deadline_dts = new Date(deadline_str);
        let time_diff = deadline_dts - current_dts;
        console.log("Time diff is ", time_diff)
        console.log("deadline dts obj is ", deadline_dts);
        console.log("Current dts obj is ", current_dts);
        if (time_diff <= 0) {
            // tmp_error_arr.push("Deadline date and time cannot be in the past");
            alert("Deadline date and time cannot be in the past");
            return;
        }
        let next_val_to_use = Validate_helper.get_iso_date_str_from_obj(deadline_dts);
        let val_to_use = Validate_helper.get_iso_date_str_from_obj(current_dts);
        console.log("val to use is ", val_to_use);
        console.log("NExt val to use is ", next_val_to_use);
        //https://stackoverflow.com/questions/54069253/usestate-set-method-not-reflecting-change-immediately
        let form_actually_submit = {
            ...edit_job_form,
            "updated_date_of_deadline": next_val_to_use
        };
        console.log("Prelim", form_actually_submit);

        let tmp_error_arr = [];
        let tmp_success_arr = [];

        let already_approved = edit_job_form.updated_job_obj.applications_approved.length;
        let already_applied = edit_job_form.updated_job_obj.applications_received.length;
        console.log("already approved is ", already_approved);
        console.log("already applied is ", already_applied);
        console.log(form_actually_submit.updated_max_applications);
        console.log(form_actually_submit.updated_num_slots);
        if (form_actually_submit.updated_max_applications < already_applied) {
            alert("More people have already applied than the current limit you are trying to set. Refill edit fields.");
            return;
        }
        if (form_actually_submit.updated_num_slots < already_approved) {
            alert("More people have already been ACCEPTED than the current limit you are trying to set. Refill edit fields.");
            return;
        }

        form_actually_submit = { ...form_actually_submit, "job_id": form_actually_submit.updated_job_obj._id };
        console.log(form_actually_submit);
        alert('You have submitted the form.');
        try {
            let baseUrl = "http://localhost:5000/api/recruiters/listings/update_listing";

            const response = await axios.post(baseUrl, form_actually_submit);


            //////////////////////////////////////////////////////////////
            // ON Success, display apt message and hide the form again, also refetch jobs       

            console.log("Axios response is ", response);
            tmp_success_arr.push("Updation successful");
            set_success_messages_arr(tmp_success_arr);
            set_track_edit_job(false);
            update_table_listings();

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

            set_error_messages_arr(tmp_error_arr);

            //When the error occurs we add a descriptive error message to the errorMessage state. At the same time we start a timer, that will set the errorMessage state to null after five seconds.
            setTimeout(() => {
                set_error_messages_arr([])
            }, 5000);

        }
    };


    ////////////////////////////////////////////////////////////////
    // Takes care of handling change in inputs
    const onChange = e => {
        const numeric_fields = ["updated_max_applications", "updated_num_slots"];
        let value_to_set = e.target.value;
        console.log(typeof value_to_set);
        if (numeric_fields.includes(e.target.name)) {
            if (value_to_set !== "") {
                value_to_set = Validate_helper.get_pos_integer(value_to_set);

                if (e.target.name === "updated_max_applications" || e.target.name === "updated_num_slots") {
                    if (value_to_set !== "" && value_to_set === 0) {
                        value_to_set = "";
                        alert("Zero not allowed here. If you want a zero here, why even post the listing ????");
                    }
                }

            }
        }
        console.log("Setter ", e.target.name, ": ", value_to_set);
        set_edit_job_form({ ...edit_job_form, [e.target.name]: value_to_set });
    }
    /////////////////////////////////////////////////////////

    const update_table_listings = () => {
        let tmp_error_arr = [];
        let baseUrl = "http://localhost:5000/api/recruiters/listings/my_listings";

        axios.get(baseUrl, { params: { email_id: props.email_id } }).then((response) => {
            console.log("Axios response is ", response.data);
            let tmp_jobs_posted = [...response.data];
            set_jobs_master(tmp_jobs_posted);
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
    }
    //useEffect : fetch all jobs
    useEffect(() => {
        console.log('inside use-effect of MY listings.js');
        update_table_listings();
    }, []);


    //OnClicking edit button, update form variables, make form watch variable as true only.


    //Cancel edit button making it false
    const edit_clicked = (curr_job) => {
        console.log("EDIT CLICKED");
        set_edit_job_form({ ...edit_job_form, "updated_job_obj": { ...curr_job } });
        set_track_edit_job(true);
    }

    const delete_clicked = (curr_job) => {

        console.log("Delete clicked");
        let result = window.confirm("Want to delete?");
        if (result) {
            let tmp_error_arr = [];
            let tmp_success_arr = [];

            let baseUrl = "http://localhost:5000/api/recruiters/listings/delete_listing";

            ////https://stackoverflow.com/a/53263784/6427607


            axios.delete(baseUrl, { data: { ...curr_job } }).then((response) => {
                console.log("Axios response is ", response.data);
                tmp_success_arr.push("DELETION successful");
                set_success_messages_arr(tmp_success_arr);
                // set_track_edit_job(false);
                update_table_listings();

                //When the error occurs we add a descriptive error message to the errorMessage state. At the same time we start a timer, that will set the errorMessage state to null after five seconds.
                setTimeout(() => {
                    set_success_messages_arr([])
                }, 5000);

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
        }
    }

    const details_btn_clicked = (curr_job) => {
        console.log("HERE");
        // if (user_details.num_open_applications === 10) {
        //     alert("You already have 10 open applications");
        // }

        // if (user_details.is_hired === true) {
        //     alert("You are already a hired person. ");
        // }
        alert("Redirecting to another page");
        window.location.href = ("/recruiter/listing_data/" + curr_job._id);
        // let history = useHistory();
        // history.push("apply/" + curr_job._id);


    }


    return (
        <React.Fragment>

            {/* Error div
            Success div */}
            {error_messages_arr.map((e) => (<ErrorNotification key={e} message={e} />))}
            {success_messages_arr.map((e) => (<SuccessNotification key={e} message={e} />))}



            {/* //////////////////////////////////////////////////////////////////////////////////// */}
            <h1> HELLO to person with email id as {props.email_id}</h1>




            <div style={{ display: track_edit_job ? '' : 'none' }}>

                <Table striped bordered hover size="sm">
                    <thead>
                        <tr>
                            <th>TITLE</th>
                            <th>Date of Posting</th>
                            <th>Date of Deadline</th>
                            <th>MAX NUMBER OF APPS</th>
                            <th>MAX NUMBER OF SLOTS</th>
                            <th>Currently received APPS</th>
                            <th>Filled slots</th>
                        </tr>
                    </thead>
                    <tbody>
                        {/* <tr>
                        <td>1</td>
                        <td>Mark</td>
                        <td>Otto</td>
                        <td>@mdo</td>
                    </tr> */}

                        {(edit_job_form.updated_job_obj === null) ? (null) :
                            (
                                <tr key={edit_job_form.updated_job_obj._id}>
                                    {/* {console.log(curr_job.actual_rating)} */}
                                    <td key={edit_job_form.updated_job_obj._id + "a"}>{edit_job_form.updated_job_obj.title}</td>
                                    <td key={edit_job_form.updated_job_obj._id + "b"}>
                                        {moment(edit_job_form.updated_job_obj.date_of_posting).add(330, 'minutes').format('D MMM YYYY, h:mm:ss A')}
                                    </td>
                                    <td key={edit_job_form.updated_job_obj._id + "c"}>
                                        {moment(edit_job_form.updated_job_obj.date_of_deadline).add(330, 'minutes').format('D MMM YYYY, h:mm:ss A')}
                                    </td>
                                    <td key={edit_job_form.updated_job_obj._id + "d"}>{edit_job_form.updated_job_obj.max_applications}</td>
                                    <td key={edit_job_form.updated_job_obj._id + "e"}>{edit_job_form.updated_job_obj.num_slots}</td>
                                    {/* //https://stackoverflow.com/questions/17333425/add-a-duration-to-a-moment-moment-js */}
                                    <td key={edit_job_form.updated_job_obj._id + "f"}>{edit_job_form.updated_job_obj.applications_received.length}</td>
                                    <td key={edit_job_form.updated_job_obj._id + "g"}>{edit_job_form.updated_job_obj.applications_approved.length}</td>


                                </tr>
                            )
                        }
                    </tbody>
                </Table >
                <form id="update_form" className='form' onSubmit={e => onSubmit(e)}>
                    <label htmlFor="f1">Modified number of total applications</label>

                    <div className='form-group'>
                        <input
                            type='text'
                            placeholder='(Non-zero) Enter maximum number of APPLICATIONS'
                            // placeholder='(Non-zero) Enter maximum number of SLOTS THERE'
                            name='updated_max_applications'
                            value={edit_job_form.updated_max_applications}
                            onChange={e => onChange(e)}
                            id="f1"
                            className="form-control"
                            required
                        />
                    </div>
                    {/* ////////////////////////////////////////////////////////// */}
                    <div className='form-group'>
                        <label htmlFor="f2">Modified number of total slots</label>

                        <input
                            type='text'
                            placeholder='(Non-zero) Enter maximum number of SLOTS THERE'
                            name='updated_num_slots'
                            value={edit_job_form.updated_num_slots}
                            onChange={e => onChange(e)}
                            id="f2"
                            className="form-control"
                            required
                        />
                    </div>
                    {/* ////////////////////////////////////////////////////////// */}

                    <div className='form-group'>
                        <DateAndTimePickers onChange={onChange} expected_name={"updated_date_of_deadline"} sent_value={edit_job_form.updated_date_of_deadline} />
                    </div>

                    <input type='submit' className='btn btn-dark' value='Update' />
                    {/* <input type='submit' className='btn btn-primary' value='Update' /> */}
                    <br></br>
                    <br></br>
                    <br></br>
                    <hr></hr>
                </form>

            </div>
            {/* Title, Date of posting, Number of Applicants, Maximum Number of Positions. */}
            {/* Table structure: Low level detials + edit + delete + view apps */}
            <Table striped bordered hover size="sm">
                <thead>
                    <tr>
                        <th>TITLE</th>
                        <th>Date of Posting</th>
                        <th>Date of Deadline</th>
                        <th>MAX NUMBER OF APPS</th>
                        <th>MAX NUMBER OF SLOTS</th>
                        <th>Currently received APPS</th>
                        <th>Filled slots</th>
                        <th>Action possible</th>
                    </tr>
                </thead>
                <tbody>
                    {jobs_master.map((curr_job) => {
                        if (true) {
                            return (
                                <tr key={curr_job._id}>
                                    {/* {console.log(curr_job.actual_rating)} */}
                                    <td key={curr_job._id + "a"}>{curr_job.title}</td>
                                    <td key={curr_job._id + "b"}>
                                        {moment(curr_job.date_of_posting).add(330, 'minutes').format('D MMM YYYY, h:mm:ss A')}
                                    </td>
                                    <td key={curr_job._id + "c"}>
                                        {moment(curr_job.date_of_deadline).add(330, 'minutes').format('D MMM YYYY, h:mm:ss A')}
                                    </td>
                                    <td key={curr_job._id + "d"}>{curr_job.max_applications}</td>
                                    <td key={curr_job._id + "e"}>{curr_job.num_slots}</td>
                                    {/* //https://stackoverflow.com/questions/17333425/add-a-duration-to-a-moment-moment-js */}
                                    <td key={curr_job._id + "f"}>{curr_job.applications_received.length}</td>
                                    <td key={curr_job._id + "g"}>{curr_job.applications_approved.length}</td>

                                    <td key={curr_job._id + "h"}>

                                        <Button variant="primary" size="sm" onClick={() => (edit_clicked(curr_job))}>EDIT</Button>
                                        <Button variant="danger" size="sm" onClick={() => (delete_clicked(curr_job))}>DELETE</Button>
                                        <Button variant="success" size="sm" onClick={() => details_btn_clicked(curr_job)} >Details</Button>

                                    </td>
                                </tr>
                            )
                        }
                        else {
                            return null;
                        }
                    })
                    }
                </tbody>
            </Table >

            {/* <Button variant="danger" onClick={() => (props.attemptLogout())}>LogOut</Button> */}
        </React.Fragment >
    );
}

export default My_listings;