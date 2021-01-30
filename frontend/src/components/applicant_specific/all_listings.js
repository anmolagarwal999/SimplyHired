import React, { Fragment, useState, useEffect } from 'react';
import axios from 'axios';
import { Button } from 'react-bootstrap';
import Validate_helper from "../../helper_files/validation_helper";
import Table from 'react-bootstrap/Table';
import moment from 'moment';
const ErrorNotification = require("../notification").Error_notification;
const SuccessNotification = require("../notification").Success_notification;


/*

This seems to have all jobs whose (isDeleted==false) and (isDeadline===”NOT PASSED”)

The button to apply is active only if 
(Slots==”NOT FULL” && “APPLICATIONS”==NOT FULL && “Person does not have 10 open applications” && Person === NOT ALREADY RECRUITED) [3 types of button: Applied, Apply, Full]

Actions: Apply to jobs
On application, reduce his number of open applications, increase filled applications of listing, append his stuff to the total applications array of the job etc.

Should have a filter section like e-commerce websites, with following filters
provided ​[5 marks]​:
○ Job Type ​- Should be able to select and filter from Full-time / Part-time / Work
from Home.
○ Salary​ - Range: filter from X to Y range. You can have two textboxes for X and Y
or you can also have a Slider with 2 pins for filtering.
○ Duration​ - Dropdown, with each option filtering for job listings with duration
strictly lesser​ than itself. Entries are in increments of a month from 1-7.

*/

// component_to_use={<AllListings email_id={login_details.user_email_id} attemptLogout={logout} />}
const default_filter_fields = {
    desired_job_duration: 7,
    desired_min_salary: 0,
    desired_max_salary: 1000000000000000,
    desired_job_type: "all"

};
const AllListings = (props) => {

    const [jobs_master, set_jobs_master] = useState([]);
    const [jobs_wanted, set_jobs_wanted] = useState([]);
    const [user_details, set_user_details] = useState({});

    //State for sort, filter
    const [filter_data, set_filter_data] = useState(default_filter_fields);
    const [curr_filter_data, set_curr_filter_data] = useState(default_filter_fields);
    const [search_term, set_search_term] = useState("");

    //Master array containg all job listings [intially empty]

    const [error_messages_arr, set_error_messages_arr] = useState([]);     //success messages array
    const [success_messages_arr, set_success_messages_arr] = useState([]);

    //user details : fields needed, email id, number of open applications, already recruited, 

    //Fetch master array using UseEffect Component did Mount
    //WHile query, populate recruiter, get only selected fields
    const get_rating = (num_instances, tot_sum) => {
        if (num_instances === 0) {
            return 0;
        }
        return tot_sum / num_instances;
    }
    const onChange = e => {
        const numeric_fields = ["desired_min_salary", "desired_max_salary"];
        let value_to_set = e.target.value;
        // console.log(typeof value_to_set);
        if (numeric_fields.includes(e.target.name)) {
            if (value_to_set !== "") {
                value_to_set = Validate_helper.get_pos_integer(value_to_set);
            }
        }

        console.log("Setter ", e.target.name, ": ", value_to_set);
        set_curr_filter_data({ ...curr_filter_data, [e.target.name]: value_to_set });
    }

    const on_new_search_term = e => {
        set_search_term(e.target.value);
    }

    useEffect(() => {
        let tmp_error_arr = [];
        console.log('inside use-effect of All listings.js');


        let baseUrl_a = "http://localhost:5000/api/users/applicant/get_applicant_details";


        axios.get(baseUrl_a, { params: { email_id: props.email_id } })
            .then((response) => {
                console.log("2-> Axios response is ", response.data);
                set_user_details(response.data);
                ////////////////////////////////////////////////////////////////////////////////////
                let baseUrl = "http://localhost:5000/api/recruiters/listings/get_all_jobs";

                axios.get(baseUrl)
                    .then((response) => {
                        console.log("Axios response is ", response.data);
                        let tmp_jobs_wanted = [...response.data];
                        let init_len = tmp_jobs_wanted.length;
                        for (let i = 0; i < init_len; i++) {
                            tmp_jobs_wanted[i] = { ...tmp_jobs_wanted[i], "actual_rating": get_rating(tmp_jobs_wanted[i].num_ratings, tmp_jobs_wanted[i].ratings_sum) };
                        }
                        set_jobs_master(tmp_jobs_wanted);
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
                                    // return e;
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

                    });


                /////////////////////////////////////////////////////////////////
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
                            //return e;
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

                    console.log("20 error->", error.message);
                }
                else {
                    // Something happened in setting up the request and triggered an Error
                    console.log('e Error is ', error.message);
                }
                console.log("OUTSIDE CATCH IFs");
                console.log("PRELIM Error messages details are ", tmp_error_arr);


            })
            .finally(() => {
                console.log("Error messages details are ", tmp_error_arr);
                set_error_messages_arr(tmp_error_arr);

                //When the error occurs we add a descriptive error message to the errorMessage state. At the same time we start a timer, that will set the errorMessage state to null after five seconds.
                setTimeout(() => {
                    set_error_messages_arr([])
                }, 5000);
            })


    }, []);

    useEffect(() => {
        console.log('inside use-effect of to update wanted array');
        let tmp_jobs_wanted = [...jobs_master];

        set_jobs_wanted(tmp_jobs_wanted);
        console.log("JOBS WANTED IS ", tmp_jobs_wanted);
    }, [jobs_master]);



    // Takes care of handling change in inputs
    const sort_button_clicked = e => {
        // console.log(typeof e.target.value);
        console.log(e.target.id);
        let tmp_jobs_wanted = [...jobs_master];
        let chosen_func;

        if (true) {
            if (e.target.id === 'dur_a') {
                //sort by ascending
                chosen_func = function (x, y) {
                    return x.job_duration - y.job_duration;
                }
            }
            else if (e.target.id === 'dur_d') {
                //sort by ascending
                chosen_func = function (x, y) {
                    return -(x.job_duration - y.job_duration);
                }
            }
            else if (e.target.id === 'sal_a') {
                //sort by ascending
                chosen_func = function (x, y) {
                    return x.salary - y.salary;
                }
            }
            else if (e.target.id === 'sal_d') {
                //sort by ascending
                chosen_func = function (x, y) {
                    return -(x.salary - y.salary);
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
        tmp_jobs_wanted.sort(chosen_func);
        set_jobs_wanted(tmp_jobs_wanted);


    }

    const on_apply_filter = async (e) => {
        e.preventDefault();
        let tmp_filter_data = { ...curr_filter_data };

        //&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&
        //Filling defaults for empty fields
        if (tmp_filter_data.desired_min_salary === "") {
            tmp_filter_data.desired_min_salary = default_filter_fields.desired_min_salary;
        }
        if (tmp_filter_data.desired_max_salary === "") {
            tmp_filter_data.desired_max_salary = default_filter_fields.desired_max_salary;
        }
        //&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&

        if (tmp_filter_data.desired_min_salary > tmp_filter_data.desired_max_salary) {
            alert("Simple arithmetic. Min salary field cannot be greater than max salary field. Previous successful filter presists. ");
            // set_curr_filter_data({ ...default_filter_fields });
        }
        else {
            set_curr_filter_data({ ...tmp_filter_data });
            set_filter_data({ ...curr_filter_data });
        }

    };

    const is_listing_filtered = (curr_job) => {
        if (curr_job.job_duration >= Number(filter_data.desired_job_duration)) {
            return false;
        }
        if (curr_job.salary < filter_data.desired_min_salary || curr_job.salary > filter_data.desired_max_salary) {
            return false;
        }

        if (filter_data.desired_job_type !== "all") {
            if (curr_job.job_type !== filter_data.desired_job_type) {
                return false;
            }
        }

        if (curr_job.title.toLowerCase().indexOf(search_term.toLowerCase()) === -1) {
            return false;
        }
        return true;
    };

    const get_button_status = (curr_job) => {

        let ans = "apply";
        let already_applied_job_ids = user_details.applications_submitted.map((s) => (s.job_id));

        if (curr_job.are_apps_full === true || curr_job.are_slots_full === true) {
            ans = "full";
        }


        if (user_details.num_open_applications === 10) {
            ans = "10_over";
        }

        if (user_details.is_hired === true) {
            ans = "already_hired";
        }

        if (already_applied_job_ids.includes(curr_job._id)) {
            ans = "applied";
        }
        return ans;


    }

    const applied_btn_clicked = (curr_job) => {
        console.log("HERE");
        if (user_details.num_open_applications === 10) {
            alert("You already have 10 open applications");
        }

        if (user_details.is_hired === true) {
            alert("You are already a hired person. ");
        }
        alert("HELLO");
        window.location.href = ("/applicant/apply/" + curr_job._id);
        // let history = useHistory();
        // history.push("apply/" + curr_job._id);


    }

    return (
        <React.Fragment>
            <h1>HELLO</h1>

            {user_details.num_open_applications === 10 && (
                <div className="alert alert-warning" role="alert">
                    NOTE : You already have 10 open applications. You won't be able to apply for any more jobs.
                </div>
            )}

            {user_details.is_hired === true && <div className="alert alert-warning" role="alert">
                NOTE : You are already a hired person. You won't be able to apply for any more jobs.
                </div>}


            {/* Error div             Success div */}
            {error_messages_arr.map((e) => (<ErrorNotification key={e} message={e} />))}
            {success_messages_arr.map((e) => (<SuccessNotification key={e} message={e} />))}


            <form id="SEARCH" className='form'>

                <h3>Search box</h3>
                <div className='form-group'>
                    <input
                        type='text'
                        placeholder='Search ...'
                        id="f1"
                        className="form-control"
                        name='search_term'
                        value={search_term}
                        onChange={e => on_new_search_term(e)}
                        required
                    />
                    {/* <button type="button" class="btn btn-dark" onClick={() => ()}>Dark</button> */}

                </div>
                <hr></hr>
            </form>

            <form id="registration_form" className='form'>
                <h3>Filter fields</h3>

                <label htmlFor="f2">Minimum salary range</label>

                <div className='form-group'>
                    <input
                        type='text'
                        placeholder='Enter min salary'
                        name='desired_min_salary'
                        id="f2"
                        className="form-control"
                        value={curr_filter_data.desired_min_salary}
                        onChange={e => onChange(e)}
                        required
                    />
                </div>
                {/* ////////////////////////////////////////////////////////// */}
                <div className='form-group'>
                    <label htmlFor="f3">Maximum salary range</label>

                    <input
                        type='text'
                        placeholder='Enter max salary'
                        // placeholder='(Non-zero) Enter maximum number of SLOTS THERE'
                        name='desired_max_salary'
                        id="f3"
                        className="form-control"
                        value={curr_filter_data.desired_max_salary}
                        onChange={e => onChange(e)}
                        required
                    />
                </div>
                {/* ////////////////////////////////////////////////////////// */}
                <div className='form-group'>
                    <label htmlFor="f4">Desired Job Type</label>
                    <select id="comboA" name="desired_job_type"
                        id="f4"
                        className="form-control"
                        onChange={e => onChange(e)} value={curr_filter_data.desired_job_type}>
                        {/* <option value="">Select combo</option> */}
                        <option value="all">all</option>
                        <option value="full_time">full_time</option>
                        <option value="part_time">Part Time</option>
                        <option value="work_from_home">Work From Home</option>
                    </select>
                </div>
                {/* ///////////////////////////////////////////////////////////// */}
                <div className='form-group'>
                    <label htmlFor="f2">Enter Duration below which you can work</label>

                    <select id="comboA"
                        id="f5"
                        className="form-control"
                        name="desired_job_duration" onChange={e => onChange(e)} value={curr_filter_data.desired_job_duration}>
                        {/* <option value="">Select combo</option> */}
                        <option value="1">1</option>
                        <option value="2">2</option>
                        <option value="3">3</option>
                        <option value="4">4</option>
                        <option value="5">5</option>
                        <option value="6">6</option>
                        <option value="7">7</option>
                    </select>
                </div>
                {/* ///////////////////////////////////////////////////////////// */}



                <br></br>


                <input type='submit' className='btn btn-dark' value='Apply filters' onClick={e => on_apply_filter(e)} />
                <input type='submit' className='btn btn-outline-secondary' value='Remove Filters' onClick={(e) => {
                    e.preventDefault();
                    set_filter_data({ ...default_filter_fields });
                    set_curr_filter_data({ ...default_filter_fields });
                }} />

                <hr></hr>
            </form>


            {/* sorting buttons
             Sort option based on each Salary, Duration and Rating both ascending and descending
            */}
            <>
                <h3>Sort options</h3>

                <Button variant="primary" size="sm" id="sal_a" onClick={(e) => (sort_button_clicked(e))}>Salary (ascending)</Button>{' '}
                <Button variant="secondary" size="sm" id="sal_d" onClick={(e) => (sort_button_clicked(e))}>Salary (Descending)</Button>{' '}
                <Button variant="success" size="sm" id="dur_a" onClick={(e) => (sort_button_clicked(e))}>Duration (ascending)</Button>{' '}
                <Button variant="warning" size="sm" id="dur_d" onClick={(e) => (sort_button_clicked(e))}>Duration (Descending)</Button>{' '}
                <Button variant="danger" size="sm" id="rat_a" onClick={(e) => (sort_button_clicked(e))}>Rating (ascending)</Button>
                <Button variant="dark" size="sm" id="rat_d" onClick={(e) => (sort_button_clicked(e))}>Rating (Descending)</Button>{' '}
                <br></br>
                <br></br>
                <br></br>
                <br></br>
            </>


            {/* viewing all listings in tabular format 
            
            Each job listing should have fields like Title, Recruiter Name, Job Rating, Salary,
Duration, Deadline of application displayed with an “Apply” button.*/
            }
            <Table striped bordered hover size="sm">
                <thead>
                    <tr>
                        <th>JOB TITLE</th>
                        <th>Rcruiter Name</th>
                        <th>JOB RATING</th>
                        <th>Salary</th>
                        <th>Duration</th>
                        <th>Application deadline</th>
                        <th>Action possible</th>
                    </tr>
                </thead>
                <tbody>
                    {/* <tr>
                        <td>1</td>
                        <td>Mark</td>
                        <td>Otto</td>
                        <td>@mdo</td>
                    </tr> */}

                    {jobs_wanted.map((curr_job) => {
                        if (is_listing_filtered(curr_job)) {
                            return (
                                <tr key={curr_job._id}>
                                    {/* {console.log(curr_job.actual_rating)} */}
                                    <td key={curr_job._id + "a"}>{curr_job.title}</td>
                                    <td key={curr_job._id + "b"}>{curr_job.employer_id.name}</td>
                                    <td key={curr_job._id + "c"}>{curr_job.actual_rating}</td>
                                    <td key={curr_job._id + "d"}>{curr_job.salary}</td>
                                    <td key={curr_job._id + "e"}>{curr_job.job_duration}</td>
                                    {/* //https://stackoverflow.com/questions/17333425/add-a-duration-to-a-moment-moment-js */}
                                    <td key={curr_job._id + "f"}>{moment(curr_job.date_of_deadline).add(330, 'minutes').format('D MMM YYYY, h:mm:ss A')}</td>
                                    <td key={curr_job._id + "g"}>


                                        {/* //Takes care only if neither appied, nor full, nor disqualified */}
                                        {((get_button_status(curr_job) !== "applied") && ((get_button_status(curr_job) !== "full"))) &&
                                            <Button onClick={() => applied_btn_clicked(curr_job)} variant="success" disabled={get_button_status(curr_job) !== "apply"}>APPLY</Button>}

                                        {/* Takes care if already applied */}
                                        {get_button_status(curr_job) === "applied" && <Button variant="primary" disabled>Applied</Button>}

                                        {/* Takes care if vacancy is full */}
                                        {/* {true && <Button variant="primary" onClick={() => { console.log("Applied clicked") }}>Applied</Button>} */}
                                        {get_button_status(curr_job) === "full" && <Button variant="danger" disabled>Already Full</Button>}

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

        </React.Fragment>

    )

}

export default AllListings;