const jobRouter = require('express').Router();
const auth = require('../utils/auth_help');
const recruiter_model = require('../models/recruiter_model');
const applicant_model = require('../models/applicant_model');
const application_model = require('../models/application_model');
const job_model = require("../models/job_model");
const { check, validationResult } = require('express-validator');
const col = require("../terminal_colors");
const has_deadline_crossed = require("../utils/deadline_helper").has_deadline_crossed;
const update_deadline_validity = require("../utils/deadline_helper").update_deadline_validity;
const assert_c = require("../utils/assert_func");
const { job_reached_slots_full } = require('./application_related');



/*
establish router, 
find user_id,fill notes with user;s id, 
make sure user is recruiter,
populate note object with user id
save job to database
*/

// @route    POST api/recruiters/listings/add
// @desc     Create new listing
// @access   Recruiter

jobRouter.post('/add',
    [
        auth,
        [
            check('title', 'job title is required')
                .not()
                .isEmpty(),
            check('max_applications', 'Specifying max num of apps is needed')
                .not()
                .isEmpty(),
            check('num_slots', 'Specifying max num of SLOTS is needed')
                .not()
                .isEmpty(),
            check('date_of_posting', 'Specifying date_of_posting is needed')
                .not()
                .isEmpty(),
            check('date_of_deadline', 'Specifying date_of_deadline is needed')
                .not()
                .isEmpty(),
            check('job_duration', 'Specifying JOB DURATION is needed')
                .not()
                .isEmpty(),
            check('salary', 'Specifying SALARY is needed')
                .not()
                .isEmpty(),
            check('job_type', 'Specifying JOB TYPE is needed')
                .not()
                .isEmpty(),

        ]
    ],
    async (request, response, next) => {

        console.log(col.Green, "Inside add_lisiting.js of backend", col.Reset);

        const body = request.body;

        //////////////////////////////////////
        // req.user consatins this
        // user: {
        //     email_id: user.email_id,
        //     id: user.id,
        //     user_type: user_type
        // }
        ///////////////////////////////////////
        try {
            console.log("Attempt to insert new job in database");

            //token needs to have username and user_id fields
            if (!request.user.id) {
                console.log(col.BgRed, "Received token is missing or invalid", col.Reset);
                //If there is no token, or the object decoded from the token does not contain the user's identity (decodedToken.id is undefined), error status code 401 unauthorized is returned and the reason for the failure is explained in the response body
                return response.status(401).json({ errors: [{ msg: 'Invalid token ' }] });
                // .status(400)
                // .json({ errors: [{ msg: 'User is not a registered Recruiter' }] });
            }

            /////////////////////////////////////////////////////////////////////////////
            //Seeing is the user allowed is a valid recruiter or not
            const user_found = await recruiter_model.findById(request.user.id);

            if (user_found) {
                console.log(col.Green, "user found is ", user_found, col.Reset);
            }
            else {
                console.log(col.BgRed, "Intended user is NONE", col.Reset);
                return response
                    .status(400)
                    .json({ errors: [{ msg: 'User is not a registered Recruiter' }] });
            }
            ///////////////////////////////////////////////////////////////////////////////

            const errors_gen = validationResult(request);
            if (!errors_gen.isEmpty()) {
                console.log("Kenya Errors caught in express-validator");
                return response.status(400).json({ errors: errors_gen.array() });
            }

            const curr_job = new job_model({
                title: body.title,
                max_applications: body.max_applications,
                num_slots: body.num_slots,
                date_of_posting: body.date_of_posting,
                date_of_deadline: body.date_of_deadline,
                reqd_skills: body.reqd_skills,
                job_duration: body.job_duration,
                salary: body.salary,
                job_type: body.job_type,
                employer_id: user_found.id
            });

            //for details regarding foreign key, see https://mongoosejs.com/docs/populate.html#saving-refs
            const saved_job = await curr_job.save();

            console.log(col.Yellow, "Job seems to have been saved. Now, need to append it to recruiter schema", col.Reset);

            ////////////////////////////////////////////////////////////////////////////////
            const filter = { _id: user_found._id };

            let old_arr = user_found.job_listings_posted;
            old_arr.push(saved_job._id);
            // const update = { job_listings_posted: old_arr };
            console.log("filter is ", filter);
            // console.log("update is ", update);

            // `doc` is the document _after_ `update` was applied because of
            // `returnOriginal: false`
            let mod_user = await recruiter_model.findOneAndUpdate(filter, { $push: { job_listings_posted: saved_job._id } },
                {
                    new: true
                }
            );


            console.log(col.Yellow, "--------MODOFIED USER IS ", mod_user, col.Reset);
            console.log(col.BgGreen, "Addition of new JOB seems to have succeeded", col.Reset);
            response
                .status(200)
                .send(saved_job);
        }
        catch (err) {
            //might be due to jwt.sign or the other await's in try block
            console.error(col.BgRed, err.message, col.Reset);
            return response
                .status(500)
                .json({ errors: [{ msg: 'Server error' }] });
        }

    })

//////////////////////////////////////////////////////////////////////////////////////////


// This seems to have all jobs whose (isDeleted==false) and (isDeadline===”NOT PASSED”)

// @route    GET api/recruiters/listings/get_all_jobs
// @desc     Create new listing
// @access   Recruiter

//Title, Recruiter Name, Job Rating, Salary,Duration, Deadline of application 
jobRouter.get('/get_all_jobs', auth, async (request, response, next) => {

    console.log(col.Green, "Inside function supposed to update JOBS DEADLINE VALIDITY of backend", col.Reset);

    const body = request.body;
    try {
        let was_update_successful = await update_deadline_validity();

        let all_jobs = await job_model.find({ is_deleted: false, is_deadline_over: false }).populate('employer_id', 'name');

        //  all_jobs.map((s) => (console.log(s)));

        {
            // title: { type: String, required: true },
            // employer_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Recruiter', required: true },
            // max_applications:
            // num_slots
            // date_of_posting:
            // date_of_deadline:
            // reqd_skills:
            // job_duration
            // salary
            // job_type
            // applications_received
            // applications_submitted
            // num_ratings
            // ratings_sum
            // is_deleted
            // is_deadline_over
            // are_apps_full
            // are_slots_full

        }
        if (was_update_successful === true) {
            response
                .status(200)
                .json(all_jobs);
        }
        else {
            return response
                .status(500)
                .json({ errors: [{ msg: 'Some error while updating deadline validity' }] });
        }
    }
    catch (err) {
        //might be due to jwt.sign or the other await's in try block
        console.error(err.message);
        return response
            .status(500)
            .json({ errors: [{ msg: 'Some error while fetching jobs' }] });
    }

})
/////////////////////////////////////////////////////

// @route    GET api/recruiters/listings/my_listings
// @desc     GET ALL MY LISTINGS
// @access   Recruiter


//Should have jobs who (iSDeleted===false) && (AreSlotsFull===false)

jobRouter.get('/my_listings', auth, async (request, response, next) => {

    console.log(col.Green, "Inside function supposed to FETCH JOBS FOR RECRUITER's MY LISTINGS PAGE", col.Reset);

    const body = request.query;
    try {
        let was_update_successful = await update_deadline_validity();
        //using lean to convert to JS object
        let concerned_user = await recruiter_model.findOne({ email_id: body.email_id });

        if (concerned_user === null) {
            return response
                .status(500)
                .json({ errors: [{ msg: 'USER NOT FOUND AS A RECRUITER IN THE DATABASE' }] });
        }

        let all_jobs = await job_model.find({ is_deleted: false, are_slots_full: false, employer_id: concerned_user._id });

        console.log("THE JOBS ARE \n");
        all_jobs.map((s) => (console.log(s)));


        return response.status(200).json(all_jobs);
    }
    catch (err) {
        //might be due to jwt.sign or the other await's in try block
        console.error(err.message);
        return response
            .status(500)
            .json({ errors: [{ msg: 'Error in backend, could not fetch jobs for user' }] });
    }

})
/////////////////////////////////////////////////////

// @route    POST api/recruiters/listings/update_listing
// @desc     update said listing
// @access   Recruiter



jobRouter.post('/update_listing', auth, async (request, response, next) => {

    console.log(col.Green, "Inside function supposed to FETCH JOBS FOR RECRUITER's MY LISTINGS PAGE", col.Reset);

    const body = request.body;
    try {
        // max_applications:
        // num_slots
        // date_of_deadline:        
        // applications_received
        // applications_submitted
        // is_deadline_over
        // are_apps_full
        // are_slots_full
        let concerned_job = await job_model.findOne({ _id: body.job_id })
        ////////////////////////////////////////////////////////////////////
        let filter, update, old_arr, old_len;
        //applications_received, are_apps_full, max_applications
        filter = { _id: concerned_job._id };


        update = {
            max_applications: body.updated_max_applications,
            num_slots: body.updated_num_slots,
            date_of_deadline: body.updated_date_of_deadline
        };
        ///////////////////////////////////////////////////////////////////
        old_arr = concerned_job.applications_received;
        old_len = old_arr.length;
        if (old_len === update.max_applications) {
            update = { ...update, are_apps_full: true };
        }
        else {
            update = { ...update, are_apps_full: false };

        }
        //////////////////////////////////////////////////////////////////

        old_arr = concerned_job.applications_approved;
        old_len = old_arr.length;
        if (old_len === update.num_slots) {
            update = { ...update, are_slots_full: true };
        }
        else {
            update = { ...update, are_slots_full: false };

        }


        console.log("filter is ", filter);
        console.log("update is ", update);

        /////////////////////////////////////////////////

        //since date has change, dedline might have changed

        if (has_deadline_crossed(update.date_of_deadline)) {
            update = { ...update, is_deadline_over: true };
        }
        else {
            update = { ...update, is_deadline_over: false };

        }

        // `doc` is the document _after_ `update` was applied because of
        // `returnOriginal: false`
        let mod_listing = await job_model.findOneAndUpdate(filter, update,
            {
                new: true
            }
        );
        // console.log(col.BgCyan, "mod_listing is ", mod_listing, col.Reset);

        assert_c(mod_listing.are_slots_full === update.are_slots_full, "Error JARVIS");

        if (mod_listing.are_slots_full === true) {
            await job_reached_slots_full(mod_listing);
        }
        console.log(col.Green, "Updated listing is ", mod_listing, "\n", col.Reset);
        return response.status(200).json(mod_listing);
    }
    catch (err) {
        //might be due to jwt.sign or the other await's in try block
        console.error(col.BgRed, err.message, col.Reset);
        return response
            .status(500)
            .json({ errors: [{ msg: 'Error in backend, could not fetch jobs for user' }] });
    }

})
/////////////////////////////////////////////////////


// const [edit_job_form, set_edit_job_form] = useState({
//     updated_job_obj: null,
//     updated_max_applications: '',
//     updated_num_slots: "",
//     updated_date_of_deadline: "2021-05-24T10:30"
// });


// @route   DELETE api/recruiters/listings/delete_listing
// @desc     delete said listing
// @access   Recruiter

//https://stackoverflow.com/a/53263784/6427607

jobRouter.delete('/delete_listing', auth, async (request, response, next) => {

    console.log(col.BgYellow, "Inside function supposed to DELETE JOBS FOR RECRUITER's MY LISTINGS PAGE", col.Reset);

    const body = request.body;
    console.log("BODY IS ", body);
    try {

        //get is_deleted, applications received, applications approved : populate
        let concerned_job = await job_model.findOne({ _id: body._id }).populate('applications_received', '_id');;
        /*Delete listing: 
        Change LISTING status to Deleted,
        go through all ‘applied’ and ‘accepted’ applications and set them to be deleted.
        Change candidates num_applied_active to decrease by one (only if the status is still APPLIED OR  accepted).
        Empty the accepted array. FOr accepted applications, 
        change isHired to false [ONLY IF THIS WAS THE JOB THROUGH WHICH HE WAS HIRED, inCase there were other jobs, do not change].
*/
        console.log("$$$\nConcerned job is ", concerned_job);

        //iterate through all applications and change status to isDeleted.
        let num_apps = concerned_job.applications_received.length;
        console.log("Number of apps is ", num_apps);
        for (let i = 0; i < num_apps; i++) {
            console.log("i is ", i);
            let app_id = concerned_job.applications_received[i]._id;
            let concerned_app = await application_model.findById(app_id, { "status": 1, "applicant_id": 1 }).populate("applicant_id", "num_open_applications");

            //In case status is accepted, change isHired to false
            if (concerned_app.status === "applied" || concerned_app.status === "accepted" || concerned_app.status === "shortlisted") {
                let person = concerned_app.applicant_id;
                let update_elem = { "num_open_applications": person.num_open_applications - 1 };
                if (concerned_app.status === "accepted") {
                    update_elem = { ...update_elem, "is_hired": false };
                }
                let updated_person = await applicant_model.findByIdAndUpdate(person._id, update_elem, {
                    new: true
                });

                console.log(col.Yellow, "UPDATED PERSON IS \n", updated_person, "\n", col.Reset);

                //num active decrease
            }

            let updated_app = await application_model.findByIdAndUpdate(app_id, { "status": "job_deleted" }, {
                new: true
            });
            console.log("$$ UPDATED APPLICATION  IS \n", updated_app, "\n$$$$$$\n");
        }

        //empty the applications_accepted array
        //  https://stackoverflow.com/a/24229143/6427607

        //emptying accepted array and setting job as deleted.
        let mod_listing = await job_model.updateOne({ _id: concerned_job._id }, { $set: { applications_approved: [] }, "is_deleted": true });

        console.log(col.Green, "Updated JOB [status should be deleted] is ", mod_listing, "\n", col.Reset);
        return response.status(200).json(mod_listing);



    }
    catch (err) {
        //might be due to jwt.sign or the other await's in try block
        console.error(col.BgRed, err.message, col.Reset);
        return response
            .status(500)
            .json({ errors: [{ msg: 'Error in backend, could not DELETE JOB' }] });
    }

})

module.exports = jobRouter;
