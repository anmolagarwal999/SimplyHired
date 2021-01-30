import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Table from 'react-bootstrap/Table';
import { useHistory } from "react-router-dom";
import moment from 'moment';
const ErrorNotification = require("../notification").Error_notification;
const SuccessNotification = require("../notification").Success_notification;


// A UI titled “My Applications'' to view their applications in a table. Note that it
// should ​also​ contain the Rejected Applications. The table should contain details like
// Title, date of joining, salary per month, name of recruiter. along with an option to
// rate the job for which he or she is accepted into from 0-5. ​[10 marks]​.

const My_applications = (props) => {

    //keep a list of all my applications
    const [apps_master, set_apps_master] = useState([]);
    const [user_obj, set_user_obj] = useState([]);

    const [error_messages_arr, set_error_messages_arr] = useState([]);     //success messages array
    const [success_messages_arr, set_success_messages_arr] = useState([]);



    const fetch_data = () => {
        let tmp_error_arr = [];
        let tmp_success_arr = [];

        let baseUrl = "http://localhost:5000/api/help/my_applications";

        axios.post(baseUrl, { email_id: props.email_id })
            .then((response) => {
                console.log("Axios response is ", response.data);
                let tmp_user_obj = { ...response.data };
                let tmp_apps_have = [...tmp_user_obj.applications_submitted];
                console.log("tmp apps have is ", tmp_apps_have);
                set_apps_master(tmp_apps_have);
                set_user_obj(tmp_user_obj);
            })
            .catch((error) => {
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
        console.log('inside use-effect of MY APPLICATIONS.js');
        fetch_data();
    }, []);


    const on_rating_change = (e, curr_man, idx) => {
        let new_rat = Number(e.target.value);
        let tmp_arr = [];
        tmp_arr = apps_master.map((s, curr_idx) => {
            if (idx === curr_idx) {
                return { ...s, "chosen_rating": new_rat };
            }
            else {
                return s;
            }
        });
        set_apps_master(tmp_arr);

    }

    const rating_btn_clicked = (curr_obj) => {
        let rating_val = curr_obj.chosen_rating;
        let app_id = curr_obj.application_id._id;
        let job_id = curr_obj.job_id._id;
        let obj_to_send = {
            rating_val, app_id, job_id
        };
        //////////////////////////////////////////////////////

        let tmp_error_arr = [];
        let tmp_success_arr = [];

        let baseUrl = "http://localhost:5000/api/help/my_job/rate";

        axios.post(baseUrl, obj_to_send).then((response) => {
            console.log("Axios response is ", response.data);

            tmp_success_arr.push("Rating updation successful");
            set_success_messages_arr(tmp_success_arr);
            setTimeout(() => {
                set_success_messages_arr([])
            }, 5000);
            fetch_data();
            //When the error occurs we add a descriptive error message to the errorMessage state. At the same time we start a timer, that will set the errorMessage state to null after five seconds.

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

    //display them accordingly, 


    //there would be just one application where you have been accepted, you can rate the job if you want
    //Don't allow to rate it twice

    return (
        <React.Fragment>
            {/* <h1>THERE</h1> */}
            {/* <h1> HELLO THERE IRONMAN</h1> */}

            {/* ///////////////////////////////////////////////////////////////////////////////////
 */}

            {/* The table should contain details like
// Title, date of joining, salary per month, name of recruiter. along with an option to
// rate the job for which he or she is accepted into from 0-5. */}
            <Table striped bordered hover size="sm">
                <thead>
                    <tr>
                        <th>JOB TITLE</th>
                        <th>Recruiter Name</th>
                        <th>Salary</th>
                        <th>Date of Joining</th>
                        <th>Application Status</th>
                        <th>Other actions possible</th>
                    </tr>
                </thead>
                <tbody>
                    {/* <tr>
                        <td>1</td>
                        <td>Mark</td>
                        <td>Otto</td>
                        <td>@mdo</td>
                    </tr> */}

                    {apps_master.map((curr_app, idx) => {
                        if (true) {
                            return (
                                <tr key={curr_app._id}>
                                    {/* {console.log(curr_app.actual_rating)} */}
                                    <td key={curr_app._id + "a"}>{curr_app.job_id.title}</td>
                                    <td key={curr_app._id + "b"}>{curr_app.job_id.employer_name}</td>
                                    <td key={curr_app._id + "c"}>{curr_app.job_id.salary}</td>
                                    <td key={curr_app._id + "d"}>
                                        {(curr_app.application_id.status === "accepted") && moment(curr_app.application_id.date_of_joining).add(330, 'minutes').format('D MMM YYYY, h:mm:ss A')}
                                        {(curr_app.application_id.status !== "accepted") && "NOT APPLICABLE"}

                                    </td>
                                    <td key={curr_app._id + "e"}>{curr_app.application_id.status}</td>
                                    {/* //https://stackoverflow.com/questions/17333425/add-a-duration-to-a-moment-moment-js */}
                                    {/* <td key={curr_app._id + "f"}>{moment(curr_app.date_of_deadline).add(330, 'minutes').format('D MMM YYYY, h:mm:ss A')}</td> */}
                                    <td key={curr_app._id + "f"}>
                                        {(curr_app.application_id.status === "accepted") && (curr_app.application_id.job_rating === -1 || curr_app.application_id.job_rating === undefined) && (
                                            <div className='form-group'>
                                                <select key={curr_app._id + "g"} id="comboA" name="chosen_rating" onChange={e => on_rating_change(e, curr_app, idx)} value={curr_app.chosen_rating}>
                                                    {/* <option value="">Select combo</option> */}
                                                    <option value="1">1</option>
                                                    <option value="2">2</option>
                                                    <option value="3">3</option>
                                                    <option value="4">4</option>
                                                    <option value="5">5</option>
                                                </select>
                                                {"   "}
                                                <button key={curr_app._id + "btn f"}
                                                    type="button"
                                                    className="btn btn-secondary btn-sm"
                                                    onClick={() => rating_btn_clicked(curr_app)}
 
                                                >
                                                    Rate him</button>

                                            </div>
                                        )}
                                        {(curr_app.application_id.status === "accepted") && (curr_app.application_id.job_rating !== -1 && curr_app.application_id.job_rating !== undefined) && (
                                            <p> Already rated as {curr_app.application_id.job_rating}</p>
                                        )}
                                    </td>


                                    {/* {((get_button_status(curr_app) !== "applied") && ((get_button_status(curr_app) !== "full"))) &&
                                            <Button onClick={() => applied_btn_clicked(curr_app)} variant="success" disabled={get_button_status(curr_app) !== "apply"}>APPLY</Button>}
                                        {get_button_status(curr_app) === "applied" && <Button variant="primary" disabled>Applied</Button>}
                                        {/* {true && <Button variant="primary" onClick={() => { console.log("Applied clicked") }}>Applied</Button>} */}
                                    {/* {get_button_status(curr_app) === "full" && <Button variant="danger" disabled>Already Full</Button>} */}

                                </tr>
                            )
                        }
                        else {
                            return null;
                        }
                    })
                    }
                </tbody>
            </Table>





        </React.Fragment >

    )

}

export default My_applications;