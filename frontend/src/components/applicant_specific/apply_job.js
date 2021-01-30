import React, { useState } from 'react';
import Button from 'react-bootstrap/Button';
import axios from 'axios';
import Validate_helper from "../../helper_files/validation_helper";
const ErrorNotification = require("../notification").Error_notification;
const SuccessNotification = require("../notification").Success_notification;



// On application, reduce his number of open applications, increase filled applications of listings, append his stuff to the total applications array of the job etc.

const Apply_job = (props_sent) => {

    const [error_messages_arr, set_error_messages_arr] = useState([]);     //success messages array
    const [success_messages_arr, set_success_messages_arr] = useState([]);


    const [formData, setFormData] = useState({

        job_id: props_sent.pursuing_job_id,
        sop: "",
        user_email_id: props_sent.email_id
    });
    // Takes care of handling change in inputs
    const onChange = e => {
        let val_set = e.target.value;
        let words = val_set.split(/\s+/);
        let maxWords = 250;
        let numWords = words.length;
        if (numWords > maxWords) {
            return;
        }
        console.log("Setter ", e.target.name, ": ", e.target.value);
        setFormData({ ...formData, [e.target.name]: e.target.value });
    }

    const onSubmit = async () => {
        // e.preventDefault();
        let tmp_error_arr = [];
        let tmp_success_arr = [];

        if (tmp_error_arr.length === 0) {
            let current_dts = new Date();;
            let val_to_use = Validate_helper.get_iso_date_str_from_obj(current_dts);
            let form_actually_submit = {
                ...formData,
                "date_of_application": val_to_use
            };

            console.log(form_actually_submit);
            //alert('You have submitted the form.');
            try {
                let baseUrl = "http://localhost:5000/api/users/applicant/post_application";


                const response = await axios.post(baseUrl, form_actually_submit);
                console.log("Axios response is ", response);
                //tmp_success_arr.push("SUCCESSFUL Submission");
                console.log("SUCCESS");
                //set_success_messages_arr(tmp_success_arr);
                alert("SOP submitted");

                setTimeout(() => {
                    window.location.href = ("/applicant/all_listings");
                }, 1000);


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
            set_error_messages_arr(tmp_error_arr);

            //When the error occurs we add a descriptive error message to the errorMessage state. At the same time we start a timer, that will set the errorMessage state to null after five seconds.
            setTimeout(() => {
                set_error_messages_arr([])
            }, 5000);
        }


    };
    return (
        <React.Fragment>

            {/* Error div             Success div */}
            {error_messages_arr.map((e) => (<ErrorNotification key={e} message={e} />))}
            {success_messages_arr.map((e) => (<SuccessNotification key={e} message={e} />))}

            {/* // https://stackoverflow.com/a/45599016/6427607 */}
            <h1>{console.log(props_sent)}</h1>
            <h2>{ }</h2>


            <div className='form-group'>
                <label htmlFor="f2"><h4>Fill SOP (max length: 250 words)</h4></label>

                <textarea
                    form=""
                    name="sop"
                    rows="10"
                    cols="80"
                    id="f2"
                    className="form-control"
                    onChange={e => onChange(e)}
                    value={formData.sop}
                    style={{ fontSize: 20 }}
                />

            </div>

            <div className="mb-2">
                <Button variant="primary" size="lg" onClick={() => { onSubmit() }}>
                    Submit SOP
                            </Button>
            </div>

            {/* //set up a bio field */}


            {/* //display job details */}


            {/* //error handler displayer */}


            {/* //submit button */}

            {/* //post to a route  */}


        </React.Fragment>
    )
}


export default Apply_job;
