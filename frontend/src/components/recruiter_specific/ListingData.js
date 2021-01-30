import React, { Fragment, useState, useEffect } from 'react';
import axios from 'axios';
import moment from 'moment';
import { Button } from 'react-bootstrap';
import Alert from 'react-bootstrap/Alert';
import Table from 'react-bootstrap/Table';
const ErrorNotification = require("../notification").Error_notification;
const SuccessNotification = require("../notification").Success_notification;


// For each job listing above, clicking them should lead to another dashboard with all
// non-rejected​ applications in view, with each applicant’s Name, Skills, Date of
// Application, Education, SOP, Rating, Stage of Application in view. The table should
// have a sort option for Name, Date of Application and applicant's rating both in
// ascending and descending order. ​[10 marks]

const ListingData = (props_sent) => {

    //Storing applications master
    const [apps_master, set_apps_master] = useState([]);
    //Storing applciation usable
    const [apps_wanted, set_apps_wanted] = useState([]);
    // Object storing job details
    const [job_details, set_job_details] = useState({});

    const [error_messages_arr, set_error_messages_arr] = useState([]);     //success messages array
    const [success_messages_arr, set_success_messages_arr] = useState([]);

    const get_rating = (num_instances, tot_sum) => {
        if (num_instances === 0) {
            return 0;
        }
        return tot_sum / num_instances;
    }
    /////////////////////////////////////////////////////////////////////////////////

    const update_apps_master = () => {
        let tmp_error_arr = [];
        let tmp_success_arr = [];

        let baseUrl = "http://localhost:5000/api/help/listing/applicants_list";

        axios.get(baseUrl, {
            params: {
                _id: props_sent.pursuing_job_id
            }
        }).then((response) => {
            console.log("Axios response is ", response.data);
            let tmp_apps_have = [...response.data];
            let tmp_len = tmp_apps_have.length;
            for (let i = 0; i < tmp_len; i++) {
                let tmp_rating = get_rating(tmp_apps_have[i].applicant_id.num_ratings, tmp_apps_have[i].applicant_id.ratings_sum);
                console.log("tmp rat is ", tmp_rating);
                tmp_apps_have[i] = { ...tmp_apps_have[i], "applicant_id": { ...tmp_apps_have[i].applicant_id, "actual_rating": tmp_rating } };
            }
            set_apps_master(tmp_apps_have);
            tmp_success_arr.push("Data fetch successful");
            set_success_messages_arr(tmp_success_arr);


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
    };

    useEffect(() => {
        update_apps_master();
    }, []);

    useEffect(() => {
        console.log('inside use-effect of to update wanted array');
        let tmp_apps_wanted = [...apps_master];

        set_apps_wanted(tmp_apps_wanted);
        console.log("APPS WANTED IS ", tmp_apps_wanted);
    }, [apps_master]);


    const sort_button_clicked = e => {
        console.log(typeof e.target.value);
        console.log(e.target.id);
        let tmp_apps_wanted = [...apps_master];
        let chosen_func;
        // let deadline_dts = new Date(deadline_str);

        const str_date_cmp = (a, b) => {

            //negative => a before b
            a = new Date(a);
            b = new Date(b);

            return ((a - b < 0) ? -1 : ((a - b > 0) ? 1 : 0));
        }
        const strcmp = (a, b) => {

            //negative => a before b
            a = a.toLowerCase();
            b = b.toLowerCase();

            return (a < b ? -1 : (a > b ? 1 : 0));
        }
        if (true) {
            if (e.target.id === 'name_a') {
                //sort by ascending
                chosen_func = function (x, y) {
                    return strcmp(x.applicant_id.name, y.applicant_id.name);
                }
            }
            else if (e.target.id === 'name_d') {
                //sort by ascending
                chosen_func = function (x, y) {
                    return -strcmp(x.applicant_id.name, y.applicant_id.name);
                }
            }
            else if (e.target.id === 'doa_a') {
                //sort by ascending
                chosen_func = function (x, y) {
                    return str_date_cmp(x.date_of_application, y.date_of_application);
                }
            }
            else if (e.target.id === 'doa_d') {
                //sort by ascending
                chosen_func = function (x, y) {
                    return -str_date_cmp(x.date_of_application, y.date_of_application);
                }
            }
            else if (e.target.id === 'rat_a') {
                //sort by ascending
                chosen_func = function (x, y) {
                    return x.actual_rating - y.actual_rating;
                }

            }
            else if (e.target.id === 'rat_d') {
                //sort by ascending
                chosen_func = function (x, y) {
                    return -(x.actual_rating - y.actual_rating);
                }
            }
        }
        tmp_apps_wanted.sort(chosen_func);
        set_apps_wanted(tmp_apps_wanted);


    }

    const approval_clicked = (curr_job) => {

        console.log("APPROVAL clicked");
        console.log("Data passed is  ", curr_job);
        let initiated_action;
        if (curr_job.status === "applied") {
            initiated_action = "shortlist";
        }
        else if (curr_job.status === "shortlisted") {
            initiated_action = "accept";
        }
        let result = window.confirm("Are you sure you want to move his application to the next stage?");
        if (result) {
            let tmp_error_arr = [];
            let tmp_success_arr = [];

            let baseUrl = `http://localhost:5000/api/application/${initiated_action}`;

            ////https://stackoverflow.com/a/53263784/6427607


            axios.post(baseUrl, { ...curr_job }).then((response) => {
                console.log("Axios response is ", response.data);
                tmp_success_arr.push("Action successful");
                set_success_messages_arr(tmp_success_arr);
                // set_track_edit_job(false);
                update_apps_master();

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

    const reject_clicked = (curr_job) => {

        console.log("Delete clicked");
        let result = window.confirm("Want to REJECT THIS APPLICATION?");
        if (result) {
            let tmp_error_arr = [];
            let tmp_success_arr = [];

            let baseUrl = "http://localhost:5000/api/application/reject";

            ////https://stackoverflow.com/a/53263784/6427607


            axios.post(baseUrl, { ...curr_job }).then((response) => {
                console.log("Axios response is ", response.data);
                tmp_success_arr.push("REJECTION successful");
                set_success_messages_arr(tmp_success_arr);
                // set_track_edit_job(false);
                update_apps_master();

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


    //Update job details whenever someone is rejected, accepted

    return (
        <React.Fragment>
            {/* <h1>DEFAULT COMPONENT, NO ROUTER MATCHING</h1> */}
            <h3>{props_sent.pursuing_job_id}</h3>

            {/* Error div
            Success div */}
            {error_messages_arr.map((e) => (<ErrorNotification key={e} message={e} />))}
            {success_messages_arr.map((e) => (<SuccessNotification key={e} message={e} />))}


            {/* JOB DETAILS TABLE */}
            {/* sorting buttons
             Sort option based on each Salary, Duration and Rating both ascending and descending
            */}
            <>
                <h3>Sort options</h3>

                <Button variant="primary" size="sm" id="name_a" onClick={(e) => (sort_button_clicked(e))}>Name (ascending)</Button>{' '}
                <Button variant="secondary" size="sm" id="name_d" onClick={(e) => (sort_button_clicked(e))}>Name (Descending)</Button>{' '}
                <Button variant="success" size="sm" id="doa_a" onClick={(e) => (sort_button_clicked(e))}>Apply date (ascending)</Button>{' '}
                <Button variant="warning" size="sm" id="doa_d" onClick={(e) => (sort_button_clicked(e))}>Apply date (Descending)</Button>{' '}
                <Button variant="danger" size="sm" id="rat_a" onClick={(e) => (sort_button_clicked(e))}>Rating (ascending)</Button>
                <Button variant="dark" size="sm" id="rat_d" onClick={(e) => (sort_button_clicked(e))}>Rating (Descending)</Button>{' '}
                <br></br>
                <br></br>
                <br></br>
                <br></br>
            </>



            {/* viewing all listings in tabular format */
            }
            <Table striped bordered hover>
                <thead>
                    <tr>
                        {/* Name, Skills, Date of Application, Education, SOP, Rating, Stage of Application  */}
                        <th>Name</th>
                        <th>Skills</th>
                        <th>Date of App</th>
                        <th>Education</th>
                        <th>SOP</th>
                        <th>Rating</th>
                        <th>Current stage</th>
                        <th>Options</th>
                    </tr>
                </thead>
                <tbody>

                    {apps_wanted.map((curr_app) => {
                        if (true) {
                            return (
                                <tr key={curr_app._id}>
                                    {/* {console.log(curr_job.actual_rating)} */}
                                    <td key={curr_app._id + "a"}>{curr_app.applicant_id.name}</td>
                                    <td key={curr_app._id + "b"}>{curr_app.applicant_id.skills_list.join()}</td>
                                    {/* <td key={curr_app._id + "c"}>DATE OF APPLICATION</td> */}
                                    <td key={curr_app._id + "c"}>{moment(curr_app.date_of_application).add(330, 'minutes').format('D MMM YYYY, h:mm:ss A')}</td>

                                    {/* <td key={curr_app._id + "g"}>{moment(curr_app.applicant_id.).add(330, 'minutes').format('D MMM YYYY, h:mm:ss A')}</td> */}
                                    <td key={curr_app._id + "d"}>
                                        <ul>

                                            {curr_app.applicant_id.ed_list.map((s) => {
                                                //console.log(s);
                                                return <li key={s.institute + s.start_yr + s.end_yr}>{s.institute} [{s.start_yr}-{s.end_yr}]</li>
                                            })}
                                        </ul>


                                    </td>
                                    <td key={curr_app._id + "e"}>{curr_app.sop}</td>
                                    <td key={curr_app._id + "f"}>{curr_app.applicant_id.actual_rating}</td>
                                    {/* //https://stackoverflow.com/questions/17333425/add-a-duration-to-a-moment-moment-js */}
                                    <td key={curr_app._id + "g"}>{curr_app.status}</td>
                                    <td key={curr_app._id + "h"}>

                                        {(curr_app.status === "shortlisted") && <Button variant="info" size="sm" onClick={() => (approval_clicked(curr_app))}>ACCEPT</Button>}
                                        {(curr_app.status === "applied") && <Button variant="warning" size="sm" onClick={() => (approval_clicked(curr_app))}>SHORTLIST</Button>}
                                        {(curr_app.status !== "accepted") && <Button variant="dark" size="sm" onClick={() => (reject_clicked(curr_app))}>REJECT</Button>}

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
            </Table>

            {/* Sort buttons */}

            {/* applications listing */}






        </React.Fragment>
    )
}


export default ListingData;
