import React, { Fragment, useState, useEffect } from 'react';
import axios from 'axios';
import moment from 'moment';
import { Button } from 'react-bootstrap';
import Alert from 'react-bootstrap/Alert';
import Table from 'react-bootstrap/Table';

const Error_notification = ({ message }) => {
    if (message === null) {
        return null;
    }

    return (

        <Alert key={message} variant={"danger"}>
            Error: {message}
        </Alert>


    )
}

const Success_notification = ({ message }) => {
    if (message === null) {
        return null;
    }

    return (

        <Alert key={message} variant={"success"}>
            Success: {message}
        </Alert>


    )
}


//fetch only accepted employees
//introduce rated option only if has not yated yet

//fetch all accepted applications with populate
//only return those whose job id has been from current recruiter
//take care of the object type, string type thing




const MyEmployees = (props_sent) => {


    const [people_master, set_people_master] = useState([]);
    const [people_arr, set_people_arr] = useState([]);
    const [error_messages_arr, set_error_messages_arr] = useState([]);     //success messages array
    const [success_messages_arr, set_success_messages_arr] = useState([]);

    const update_people_master = () => {
        let tmp_error_arr = [];
        let tmp_success_arr = [];

        let baseUrl = "http://localhost:5000/api/help/my_employees";

        axios.get(baseUrl, {
            params: {
                email_id: props_sent.email_id
            }
        }).then((response) => {
            console.log("Axios response is ", response.data);
            let tmp_people_have = [...response.data];
            // let tmp_len=tmp_people_have.length;
            // for(let i=0;i<tmp_len;i++)
            // {

            // }
            tmp_people_have = tmp_people_have.map((s) => {
                if (s.person_rating === -1 || s.person_rating === undefined) {
                    return { ...s, "chosen_rating": 1 };
                }
                else {
                    return { ...s, "chosen_rating": s.person_rating };

                }
            });
            set_people_master([...tmp_people_have]);
            set_people_arr([...tmp_people_have]);
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

    const on_rating_change = (e, curr_man, idx) => {
        let new_rat = Number(e.target.value);
        let tmp_arr = [];
        tmp_arr = people_arr.map((s, curr_idx) => {
            if (idx === curr_idx) {
                return { ...s, "chosen_rating": new_rat };
            }
            else {
                return s;
            }
        });
        set_people_arr(tmp_arr);

    }

    const rating_btn_clicked = (curr_obj) => {
        let rating_val = curr_obj.chosen_rating;
        let app_id = curr_obj._id;
        let person_id = curr_obj.applicant_id._id;
        let obj_to_send = {
            rating_val, app_id, person_id
        };
        //////////////////////////////////////////////////////

        let tmp_error_arr = [];
        let tmp_success_arr = [];

        let baseUrl = "http://localhost:5000/api/help/my_employees/rate";

        axios.post(baseUrl, obj_to_send).then((response) => {
            console.log("Axios response is ", response.data);

            tmp_success_arr.push("Rating updation successful");
            set_success_messages_arr(tmp_success_arr);

            update_people_master();
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

    //////////////////////////////////////////////////////////
    const sort_button_clicked = e => {
        console.log(typeof e.target.value);
        console.log(e.target.id);
        let tmp_people_arr = [...people_arr];
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
        // {
        //     "_id": "600bea89428709623bfa625d",
        //     "sop": "A SOP FOR JOB 1",
        //     "status": "accepted",
        //     "applicant_id": {
        //         "_id": "600be9c3428709623bfa6255",
        //         "name": "a"
        //     },
        //     "job_id": {
        //         "_id": "600bea39428709623bfa625b",
        //         "job_type": "part_time",
        //         "title": "JOB 1 for A and B"
        //     },
        //     "date_of_application": "2021-01-23T09:21",
        //     "__v": 0
        // }
        if (true) {
            if (e.target.id === 'name_a') {
                //sort by ascending
                chosen_func = function (x, y) {
                    return strcmp(x.applicant_id.name, y.applicant_id.name);
                }
            }
            else if (e.target.id === 'name_d') {
                //sort bjoining
                chosen_func = function (x, y) {
                    return -strcmp(x.applicant_id.name, y.applicant_id.name);
                }
            }
            else if (e.target.id === 'doj_a') {
                //sort by ascending
                chosen_func = function (x, y) {
                    return str_date_cmp(x.date_of_joining, y.date_of_joining);
                }
            }
            else if (e.target.id === 'doj_d') {
                //sort by ascending
                chosen_func = function (x, y) {
                    return -str_date_cmp(x.date_of_joining, y.date_of_joining);
                }
            }
            else if (e.target.id === 'rat_a') {
                //sort by ascending
                chosen_func = function (x, y) {
                    return x.chosen_rating - y.chosen_rating;
                }

            }
            else if (e.target.id === 'rat_d') {
                //sort by ascending
                chosen_func = function (x, y) {
                    return -(x.chosen_rating - y.chosen_rating);
                }
            }
            else if (e.target.id === 'tit_a') {
                //sort by ascending
                chosen_func = function (x, y) {
                    return strcmp(x.job_id.title, y.job_id.title);
                }
            }
            else if (e.target.id === 'tit_d') {
                //sort bjoining
                chosen_func = function (x, y) {
                    return -strcmp(x.job_id.title, y.job_id.title);
                }
            }
        }
        tmp_people_arr.sort(chosen_func);
        set_people_arr(tmp_people_arr);


    }

    ///////////////////////////////////////////////////////////
    useEffect(() => {
        update_people_master();
    }, []);



    useEffect(() => {
        console.log('inside use-effect of to update wanted array');
        let tmp_people_arr = [...people_master];

        set_people_arr(tmp_people_arr);
        console.log("APPS WANTED IS ", tmp_people_arr);
    }, [people_master]);


    //table to see employees
    return (
        <React.Fragment>
            {/* <h1>DEFAULT COMPONENT, NO ROUTER MATCHING</h1> */}
            <h3> THIS IS EMPLOYEE VIEW PAGE for {props_sent.email_id}</h3>

            {/* Error div
            Success div */}
            {error_messages_arr.map((e) => (<Error_notification key={e} message={e} />))}
            {success_messages_arr.map((e) => (<Success_notification key={e} message={e} />))}

            <>
                <h3>Sort options</h3>

                <Button variant="primary" size="sm" id="name_a" onClick={(e) => (sort_button_clicked(e))}>Name (ascending)</Button>{' '}
                <Button variant="secondary" size="sm" id="name_d" onClick={(e) => (sort_button_clicked(e))}>Name (Descending)</Button>{' '}
                <Button variant="success" size="sm" id="doj_a" onClick={(e) => (sort_button_clicked(e))}>Joining date (ascending)</Button>{' '}
                <Button variant="warning" size="sm" id="doj_d" onClick={(e) => (sort_button_clicked(e))}>Joining date (Descending)</Button>{' '}
                <Button variant="danger" size="sm" id="rat_a" onClick={(e) => (sort_button_clicked(e))}>Rating (ascending)</Button>
                <Button variant="dark" size="sm" id="rat_d" onClick={(e) => (sort_button_clicked(e))}>Rating (Descending)</Button>{' '}
                <Button variant="danger" size="sm" id="tit_a" onClick={(e) => (sort_button_clicked(e))}>job title (ascending)</Button>
                <Button variant="dark" size="sm" id="tit_d" onClick={(e) => (sort_button_clicked(e))}>job title (Descending)</Button>{' '}
                <br></br>
                <br></br>
                <br></br>
                <br></br>
            </>


            {/* TABLE */}
            <Table striped bordered hover size="sm">
                <thead>

                    <tr>
                        {/* For each applicant,
you should display their Name, Date of Joining, Job Type (Full-Time/ Part-Time/
WFH) and the Job Title they got accepted into.  */}
                        <th>Person Name</th>
                        <th>Date of joining</th>
                        <th>JOB TYPE</th>
                        <th>JOB TITLE</th>
                        <th>Rating for person</th>
                    </tr>
                </thead>
                <tbody>

                    {people_arr.map((curr_man, idx) => {
                        if (true) {
                            return (
                                <tr key={curr_man._id}>
                                    {/* {console.log(curr_man.actual_rating)} */}
                                    <td key={curr_man._id + "a"}>{curr_man.applicant_id.name}</td>
                                    <td key={curr_man._id + "b"}>
                                        {moment(curr_man.date_of_joining).add(330, 'minutes').format('D MMM YYYY, h:mm:ss A')}
                                    </td>
                                    <td key={curr_man._id + "c"}>
                                        {curr_man.job_id.job_type}
                                    </td>
                                    <td key={curr_man._id + "d"}>{curr_man.job_id.title}</td>
                                    <td key={curr_man._id + "e"}>
                                        {(curr_man.person_rating === -1 || curr_man.person_rating === undefined) && (
                                            <div className='form-group'>
                                                <select key={curr_man._id + "f"} id="comboA" name="chosen_rating" onChange={e => on_rating_change(e, curr_man, idx)} value={curr_man.chosen_rating}>
                                                    {/* <option value="">Select combo</option> */}
                                                    <option value="1">1</option>
                                                    <option value="2">2</option>
                                                    <option value="3">3</option>
                                                    <option value="4">4</option>
                                                    <option value="5">5</option>
                                                </select>
                                                {"   "}
                                                <button key={curr_man._id + "btn f"}
                                                    type="button"
                                                    className="btn btn-secondary btn-sm"
                                                    onClick={() => rating_btn_clicked(curr_man)}

                                                >
                                                    Rate him</button>

                                            </div>
                                        )}
                                        {(curr_man.person_rating !== -1 && curr_man.person_rating !== undefined) && (
                                            <p> Already rated as {curr_man.chosen_rating}</p>
                                        )}
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



        </React.Fragment>

    )
}


export default MyEmployees;
