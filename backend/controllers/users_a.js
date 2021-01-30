require("dotenv").config();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const users_a_Router = require('express').Router();
const recruiter_model = require('../models/recruiter_model');
const applicant_model = require('../models/applicant_model');
const { check, validationResult } = require('express-validator/check');
const col = require("../terminal_colors");
const has_deadline_crossed = require("../utils/deadline_helper").has_deadline_crossed;
const update_deadline_validity = require("../utils/deadline_helper").update_deadline_validity;
const job_model = require('../models/job_model');
const auth = require('../utils/auth_help');
const application_model = require("../models/application_model");
const assert_c = require("../utils/assert_func");



///////////////////////////////////////
//PREFIX: /api/users/applicant
////////////////////////////////////////


// @route    POST api/users/applicant
// @desc     Register user
// @access   Public
users_a_Router.post('/',
    [
        check('name', 'Name is required').not().isEmpty(),
        check('email_id', 'Please include a valid email').isEmail(),
        check('password', 'Please enter a non-empty password').isLength({ min: 1 })
    ],
    async (request, response) => {
        console.log(col.Green, "Trying to register new user APPLICANT", col.Reset);
        //////////////////////////////////////////////////////////////////////////
        //Prelim error checking

        const errors = validationResult(request);
        if (!errors.isEmpty()) {
            console.log(col.BgRed, "errors found are ", errors, col.Reset);
            return response.status(400).json({ errors: errors.array() });
        }
        ////////////////////////////////////////////////

        const body = request.body;
        console.log(body);
        try {
            let already_user;
            /////////////////////////////////////////////////////////////////
            already_user = await recruiter_model.findOne({ email_id: request.body.email_id });

            if (already_user) {
                console.log(col.BgRed, 'Someone (R) with same email-id already registered', col.Reset);

                return response
                    .status(400)
                    .json({ errors: [{ msg: 'Someone (R) with same email-id already registered' }] });
            }
            //////////////////////////////////////////////////////////////////////////
            /////////////////////////////////////////////////////////////////
            already_user = await applicant_model.findOne({ email_id: request.body.email_id });

            if (already_user) {
                console.log(col.BgRed, 'Someone (A) with same email-id already registered', col.Reset);

                return response
                    .status(400)
                    .json({ errors: [{ msg: 'Someone (A) with same email-id already registered' }] });
            }
            //////////////////////////////////////////////////////////////////////////

            const saltRounds = 10;

            //The password sent in the request is not stored in the database. We store the hash of the password that is generated with the bcrypt.hash function.
            //For more on bcypt saltRounds details, use this : When you are hashing your data the module will go through a series of rounds to give you a secure hash.
            //The value you submit there is not just the number of rounds that the module will go through to hash your data. The module will use the value you enter and go through 2^rounds iterations of processing.
            //TODO: better hashing, read here : https://github.com/kelektiv/node.bcrypt.js/#a-note-on-rounds
            const passwordHash = await bcrypt.hash(body.password, saltRounds); //finding the hashed version of pw (after 10 saltRounds)
            let skills_got = [];
            let ed_list_got = [];
            if ("skills_list" in body) {
                skills_got = body.skills_list;
            }
            if ("ed_list" in body) {
                ed_list_got = body.ed_list;
            }

            const user = new applicant_model({
                name: body.name,
                passwordHash: passwordHash,
                email_id: body.email_id,
                ed_list: ed_list_got,
                skills_list: skills_got
            })

            const saved_user = await user.save();
            console.log("applicant_model registration seems to be successful");
            console.log("sSaved user is ", saved_user);
            const userForToken = {
                user: {
                    email_id: user.email_id,
                    id: user.id
                }
            };

            console.log("userToken is ", userForToken);
            console.log("debug Env var is ", process.env.SECRET);
            const token = await jwt.sign(userForToken, process.env.SECRET);
            console.log("Resiter possible, chaces looking good");
            console.log("token is ", token);
            // A successful request is responded to with the status code 200 OK. The generated token and the username of the user are sent back in the response body.
            console.log(col.BgGreen, "Register approved by BACKEND, sending token for future sessions", col.Reset);
            response
                .status(200)
                .send({ token: token, email_id: user.email_id, name: user.name })
        }
        catch (err) {
            console.error(err.message);
            return response
                .status(500)
                .json({ errors: [{ msg: 'Server error due to : ' + err.message }] });
            // response.status(500).send('Server error due to : ' + err.message);
        }
    });


//###################################################################################################
// @route   GET api/users/applicant/get_profile
// @desc     Fetch profile of user
// @access   Private

//TODO: see req which is private, is made by same person and not another person
//add auth

users_a_Router.get('/get_profile', auth, async (request, response) => {
    console.log("Inside function GETTING APPLICANTS LIST");

    const body = request.query;
    console.log("BODY IS ", body);
    try {

        //name, email-id, skills_list, ed_list
        let curr_user = await applicant_model.findOne({ email_id: body.email_id },
            { "name": 1, "email_id": 1, "skills_list": 1, "ed_list": 1, "profile_image_path": 1 })
            .lean();

        if (!curr_user) {
            console.error(col.BgRed, 'Email ID not in applicants database', col.Reset);

            return response
                .status(400)
                .json({ errors: [{ msg: 'Email ID not in applicants database' }] });
        }

        //applicants list found, can return this list to page now
        console.log(col.Yellow, "Applicant is  ", curr_user, "\n", col.Reset);
        return response.status(200).json(curr_user);
    }
    catch (err) {
        //might be due to jwt.sign or the other await's in try block
        console.error(col.BgRed, err.message, col.Reset);
        return response
            .status(500)
            .json({ errors: [{ msg: 'Error in backend, COULD NOT FETCH PROFILE' }] });
    }


}
);

//##############################################################################################################

// @route    POST api/users/applicant/edit_profile
// @desc    EDIT user
// @access   Public


//TODO: see req which is private, is made by same person and not another person
//add auth

users_a_Router.post('/edit_profile', auth,
    [
        check('name', 'Name is required').not().isEmpty(),
        check('email_id', 'Please include a valid email').isEmail()
    ],
    async (request, response) => {
        console.log(col.Green, "Trying to register new user APPLICANT", col.Reset);
        //////////////////////////////////////////////////////////////////////////
        //Prelim error checking

        const errors = validationResult(request);
        if (!errors.isEmpty()) {
            console.log(col.BgRed, "errors found are ", errors, col.Reset);
            return response.status(400).json({ errors: errors.array() });
        }
        ////////////////////////////////////////////////

        const body = request.body;
        console.log(body);



        try {
            let already_user;

            //https://stackoverflow.com/a/24229143/6427607
            let update = { $set: { skills_list: body.skills_list, ed_list: body.ed_list }, name: body.name };
            // let update = {  name: body.name };
            /////////////////////////////////////////////////////////////////
            mod_user = await applicant_model.findOneAndUpdate({ email_id: request.body.email_id }, update,
                { new: true });

            if (!mod_user) {
                console.log(col.BgRed, 'UPDATE SEEMS TO HAVE FAILED, NULLABLE result', col.Reset);

                return response
                    .status(400)
                    .json({ errors: [{ msg: 'UPDATE SEEMS TO HAVE FAILED' }] });
            }
            //////////////////////////////////////////////////////////////////////////
            console.log(col.Yellow, "MODIFIED USER IS ", mod_user, col.Reset);
            response
                .status(200)
                .json(mod_user);
        }
        catch (err) {
            console.error(err.message);
            return response
                .status(500)
                .json({ errors: [{ msg: 'Server error due to : ' + err.message }] });
            // response.status(500).send('Server error due to : ' + err.message);
        }
    });


//#######################################################################################


// @route    POST api/users/applicant/get_applicant_details
// @desc     get user details
// @access   USER

//Title, Recruiter Name, Job Rating, Salary,Duration, Deadline of application 
users_a_Router.get('/get_applicant_details', auth, async (request, response, next) => {

    console.log(col.Green, "Inside function supposed to GET USER DETAILS", col.Reset);

    const body = request.query;
    console.log(body);
    try {
        // let was_update_successful = await update_deadline_validity();
        console.log("body email is ", body.email_id);
        let user_got = await applicant_model.findOne({ email_id: body.email_id });

        {
            // name
            // passwordHash
            // email_id
            // skills_list
            // num_ratings
            // ratings_sum
            // applications_submitted
            // ed_list
            // num_open_applications
            // is_hired

        }
        console.log("User details are ", user_got);
        return response.status(200).json(user_got);




    }
    catch (err) {
        //might be due to jwt.sign or the other await's in try block
        console.error(col.BgRed, err.message, col.Reset);
        return response
            .status(500)
            .json({ errors: [{ msg: 'Some error while extracting already applied jobs for user' }] });
    }

})


// job_id: props_sent.pursuing_job_id,
// sop: "",
// user_email_id: props_sent.email_id

// @route    POST api/users/applicant/post_application
// @desc     submit application
// @access   USER

// Actions: Apply to jobs
// On application, reduce his number of open applications, increase filled applications of listings,
// append his stuff to the total applications array of the job etc.
users_a_Router.post('/post_application', auth, async (request, response, next) => {

    console.log("Inside function supposed to SUBMIT APPLICATION");

    const body = request.body;
    console.log(request.body);
    try {
        let was_update_successful = await update_deadline_validity();

        //     status:
        // {
        //     type: String,
        //     enum: ['applied', 'rejected', 'accepted', 'job_deleted'],
        //     required: true
        // },
        // applicant_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Applicant', required: true },
        // sop:
        // {
        //     type: String,
        //     max: 250,
        //     default: ""
        // },
        // job_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Job', required: true }

        let concerned_user = await applicant_model.findOne({ email_id: body.user_email_id });
        let concerned_job = await job_model.findOne({ _id: body.job_id });
        ////////////////////////////////////////////////////////////////////////
        //find job, check isDeleted, isDeadline, size
        if (concerned_job.is_deleted === true) {
            return response
                .status(400)
                .json({ errors: [{ msg: 'JOB WAS DELETED IN THE MEANTIME' }] });
        }

        if (concerned_job.is_deadline_over === true) {
            return response
                .status(400)
                .json({ errors: [{ msg: 'JOBS DEADLINE IS OVER' }] });
        }

        if (concerned_job.are_apps_full === true) {
            return response
                .status(400)
                .json({ errors: [{ msg: 'MAX application limit exceeded in the meanwhile' }] });
        }

        if (concerned_job.are_slots_full === true) {
            return response
                .status(400)
                .json({ errors: [{ msg: 'MAX positions of the job filled in the meanwhile' }] });
        }
        ////////////////////////////////////////////////////////////
        let str_submitted = concerned_user.applications_submitted.map((s) => (s.job_id.toString()));
        console.log(col.Yellow, "List of already submitted apps are ", str_submitted, col.Reset);
        if (str_submitted.includes(body.job_id.toString())) {
            return response
                .status(400)
                .json({ errors: [{ msg: 'You seem to already have applied for the job' }] });
        }
        ///////////////////////////////////////////////////////////////////////////////////////

        const concerned_app = new application_model({
            status: 'applied',
            applicant_id: concerned_user._id,
            sop: body.sop,
            job_id: concerned_job._id,
            date_of_application: body.date_of_application
        })

        const saved_application = await concerned_app.save();
        console.log(col.Green, "APPLICATION registration seems to be successful", col.Reset);

        ////////////////////////////////////////////////////////////////////
        //append this in lisitng array
        let filter, update, old_arr, old_len;
        //applications_received, are_apps_full, max_applications
        filter = { _id: concerned_job._id };

        old_arr = concerned_job.applications_received;
        old_len = old_arr.length;
        update = {
            $push: {
                applications_received: concerned_app._id
            }
        };
        if (old_len + 1 === concerned_job.max_applications) {
            update = { ...update, are_apps_full: true };
        }
        console.log("filter is ", filter);
        console.log("update is ", update);

        // `doc` is the document _after_ `update` was applied because of
        // `returnOriginal: false`
        let mod_listing = await job_model.findOneAndUpdate(filter, update,
            {
                new: true
            }
        );
        console.log("Updated listing is ", mod_listing, "\n");
        /////////////////////////////////////////////////////////////
        //append this in my array
        //applications_submitted, num_open_applications

        filter = { _id: concerned_user._id };

        update = {
            $push: {
                applications_submitted: {
                    application_id: concerned_app._id,
                    job_id: concerned_job._id
                }
            }
        };
        update = { ...update, num_open_applications: concerned_user.num_open_applications + 1 };

        console.log("filter is ", filter);
        console.log("update is ", update);

        // `doc` is the document _after_ `update` was applied because of
        // `returnOriginal: false`
        let mod_user = await applicant_model.findOneAndUpdate(filter, update,
            {
                new: true
            }
        );
        console.log("Updated APPLICANT is ", mod_user, "\n");




        return response
            .status(200)
            .json({ successful_task: [{ msg: 'SUCCESS' }] });


    }
    catch (err) {
        //might be due to jwt.sign or the other await's in try block
        console.error(col.BgRed, err.message, col.Reset);
        return response
            .status(500)
            .json({ errors: [{ msg: 'Error ' + err.message }] });
    }

});



module.exports = users_a_Router;