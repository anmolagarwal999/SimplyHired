const helperRouter = require('express').Router();
const job_model = require('../models/job_model');
const auth = require('../utils/auth_help');
const recruiter_model = require('../models/recruiter_model');
const applicant_model = require('../models/applicant_model');
const application_model = require("../models/application_model")
const { check, validationResult } = require('express-validator');
const has_deadline_crossed = require("../utils/deadline_helper").has_deadline_crossed;
const update_deadline_validity = require("../utils/deadline_helper").update_deadline_validity;
const col = require("../terminal_colors");
const assert_c = require("../utils/assert_func");
////////////////////////////////////////////////////////
const multer = require('multer');

const storage = multer.diskStorage({
    destination: function (req, file, callback_func) {
        callback_func(null, './public_profiles/uploads/')
    },
    filename: function (req, file, callback_func) {
        // console.log(col.BgYellow, "in multer req is ", req, col.Reset);
        callback_func(null, Date.now() + file.originalname)
    }
});

const filter_criteria = (req, file, callback_func) => {
    if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/jpg' || file.mimetype === 'image/png') {
        callback_func(null, true);
    } else {
        callback_func(null, false);
    }

}

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 1024 * 1024 * 5
    },
    fileFilter: filter_criteria
});
//######################################################

// image path
// limit: 5mb
// filter : png, jpeg,jpgs
////////////////////////////////////////////////////

// @route    POST api/help/update_is_deadline_over
// @desc    update deadlines
// @access   Public

helperRouter.post('/update_is_deadline_over', async (request, response, next) => {

    console.log("Inside function supposed to update JOBS DEADLINE VALIDITY of backend");

    const body = request.body;
    try {


        let was_update_successful = await update_deadline_validity();
        //  console.log("success var is ", was_update_successful);

        if (was_update_successful === true) {
            response
                .status(200)
                .json({ report_status: [{ msg: 'Update seems successful' }] });
        }
        else {
            return response
                .status(500)
                .json({ errors: [{ msg: '1 Some error while updating deadline validity' }] });
        }



    }
    catch (err) {
        //might be due to jwt.sign or the other await's in try block
        console.error(err.message);
        return response
            .status(500)
            .json({ errors: [{ msg: '2 Some error while updating deadline validity' }] });
    }

})

// let baseUrl = "http://localhost:5000/api/help/my_applications";
// const response = await axios.post(baseUrl, { email_id: props.email_id });

// @route    POST api/help/my_applications
// @desc     get all applications
// @access   USER

helperRouter.post('/my_applications', auth, async (request, response, next) => {

    console.log("Inside function supposed to SUBMIT APPLICATION");

    const body = request.body;
    console.log("BODY OF REQUEST IS ", request.body);
    try {
        // let was_update_successful = await update_deadline_validity();


        // The table should contain details like
        // Title, date of joining, salary per month, name of recruiter. along with an option to
        // rate the job for which he or she is accepted into from 0-5

        //https://stackoverflow.com/q/16641210/6427607
        //https://stackoverflow.com/q/14594511/6427607

        //using lean to convert to JS object
        let concerned_user = await applicant_model.findOne({ email_id: body.email_id })
            .populate('applications_submitted.application_id')
            .populate('applications_submitted.job_id').lean();

        console.log("Concerned user obj is ", concerned_user, "\n");

        if (concerned_user === null) {
            return response
                .status(500)
                .json({ errors: [{ msg: 'USER NOT FOUND AS AN APPLICANT IN THE DATABASE' }] });
        }

        //find recruiter names also for each job
        let arr_len = concerned_user.applications_submitted.length;
        for (i = 0; i < arr_len; i++) {
            // console.log()
            let curr_recruiter = await recruiter_model.findById(concerned_user.applications_submitted[i].job_id.employer_id, { "name": 1 }, {
                new: true
            });
            console.log("recruiter is ", curr_recruiter, "\n");
            //can't modify Mongoose objects directly, will have to convert to JS object first : https://stackoverflow.com/q/14504385/6427607
            concerned_user.applications_submitted[i].job_id["employer_name"] = curr_recruiter.name;
            // concerned_user.applications_submitted[i].job_id = { ...concerned_user.applications_submitted[i].job_id, "employer_name": curr_recruiter.name };
            // console.log("mod obj is ", concerned_user.applications_submitted[i].job_id, "\n\n");
        }

        return response.status(200).json(concerned_user);



    }
    catch (err) {
        //might be due to jwt.sign or the other await's in try block
        console.error(err.message);
        return response
            .status(500)
            .json({ errors: [{ msg: 'Error while fetching USER\'s apps' }] });
    }

})




// const [edit_job_form, set_edit_job_form] = useState({
//     updated_job_obj: null,
//     updated_max_applications: '',
//     updated_num_slots: "",
//     updated_date_of_deadline: "2021-05-24T10:30"
// });





/////////////////////////////////////////////////////



// @route   GET api/help/listing/applicants_list
// @desc     get list of all NN-REJECTED / ACCEPTED APPLICATIONS
// @access   Recruiter

//https://stackoverflow.com/a/53263784/6427607

helperRouter.get('/listing/applicants_list', auth, async (request, response, next) => {

    console.log("Inside function GETTING APPLICANTS LIST");

    const body = request.query;
    console.log("BODY IS ", body);
    try {
        //with each applicant’s Name, Skills, Date of Application, Education, SOP, Rating, Stage of Application in view.
        let all_apps = await application_model.find({ job_id: body._id, status: { $ne: "rejected" } }).populate("applicant_id").lean();

        //applicants list found, can return this list to page now
        console.log("APPLICANTS ARE ", all_apps, "\n");
        return response.status(200).json(all_apps);
    }
    catch (err) {
        //might be due to jwt.sign or the other await's in try block
        console.error(err.message);
        return response
            .status(500)
            .json({ errors: [{ msg: 'Error in backend, COULD NOT FETCH APPLICANTS' }] });
    }

})
//################################################################################################

//fetch all accepted applications with populate
//only return those whose job id has been from current recruiter
//take care of the object type, string type thing


// @route   GET api/help/my_employees
// @desc     get list of employees
// @access   Recruiter

//https://stackoverflow.com/a/53263784/6427607

helperRouter.get('/my_employees', auth, async (request, response, next) => {

    console.log("Inside function to get EMPLOYEES");

    const body = request.query;
    console.log("BODY IS ", body);
    try {
        let tot_apps = await application_model.find({ status: "accepted" })
            .populate("applicant_id", "name _id")
            .populate("job_id", "title job_type")
            .lean();

        console.log("\nObject containing all accepted applications is \n", tot_apps);

        let concerned_user = await recruiter_model.findOne({ "email_id": body.email_id }, { "name": 1, "job_listings_posted": 1 });

        let curr_jobs = concerned_user.job_listings_posted.map((s) => (s.toString()));

        console.log("\nAll jobs posted by user DELETED/UNDELETED ARE \n", curr_jobs);


        //For each applicant, you should display their Name, Date of Joining, Job Type (Full-Time/ Part-Time/
        //  WFH) and the Job Title they got accepted into. 

        let useful_apps = tot_apps.filter((s) => {
            return (curr_jobs.includes(s.job_id._id));
        });

        return response
            .status(200)
            .json(useful_apps);

    }
    catch (err) {
        //might be due to jwt.sign or the other await's in try block
        console.error(err.message);
        return response
            .status(500)
            .json({ errors: [{ msg: 'Error in backend, COULD NOT FETCH EMPLOYEES' }] });
    }

})
/////////////////////////////////////////////////////

// @route POST api/help/my_employees/rate
// @desc     rate list of employees
// @access   Recruiter

//https://stackoverflow.com/a/53263784/6427607

helperRouter.post('/my_employees/rate', auth, async (request, response, next) => {

    console.log("Inside function to get EMPLOYEES");

    const body = request.body;
    console.log("BODY IS ", body);
    try {
        const { rating_val, app_id, person_id } = body;

        //check if have not been voted from alternate tab
        let old_app = await application_model.findById(app_id);
        if (old_app.person_rating !== undefined && old_app.person_rating !== -1) {

            console.log('Person already seems to be voted (alternate session it seems)');
            return response
                .status(500)
                .json({ errors: [{ msg: 'Person already seems to be voted (alternate session it seems)' }] });
        }

        let mod_app = await application_model.findByIdAndUpdate(app_id, { "person_rating": rating_val },
            {
                new: true
            });

        console.log("This value should now be valid : ", mod_app.person_rating);

        let applicant_now;
        applicant_now = await applicant_model.findByIdAndUpdate(person_id, {
            $inc: { 'num_ratings': +1, 'ratings_sum': rating_val }
        }, {
            new: true
        });

        console.log("This value (NUM rating) should now be INCREASED : ", applicant_now.num_ratings);
        console.log("This value (tot rating) should now be INCREASED : ", applicant_now.ratings_sum);
        console.log("JOB SEEMS TO BE DONE");

        return response
            .status(200)
            .json(applicant_now);

    }
    catch (err) {
        //might be due to jwt.sign or the other await's in try block
        console.error(err.message);
        return response
            .status(500)
            .json({ errors: [{ msg: 'COULD NOT RATE PERSON' }] });
    }

})



// @route POST api/help/my_job/rate
// @desc     rate job
// @access  applicant

//https://stackoverflow.com/a/53263784/6427607

helperRouter.post('/my_job/rate', auth, async (request, response, next) => {

    console.log(col.BgBlue, "Inside function to RATE JOBS", col.Reset);

    const body = request.body;
    console.log("BODY IS ", body);
    try {
        const { rating_val, app_id, job_id } = body;

        //check if have not been voted from alternate tab
        let old_app = await application_model.findById(app_id);
        console.log(col.BgYellow, "Current details of app is ", old_app, col.Reset);
        if (old_app.job_rating !== undefined && old_app.job_rating !== -1) {

            console.log(col.BgRed, 'JOB already seems to be voted (alternate session it seems)', col.Reset);
            return response
                .status(400)
                .json({ errors: [{ msg: 'JOB already seems to be voted (alternate session it seems)' }] });
        }

        let mod_app = await application_model.findByIdAndUpdate(app_id, { "job_rating": rating_val },
            {
                new: true
            });

        console.log("This value should now be valid : ", mod_app.job_rating);
        assert_c(mod_app.job_rating !== undefined && mod_app.job_rating !== -1, "ERROR: Vicodin");

        let job_now;
        job_now = await job_model.findByIdAndUpdate(job_id, {
            $inc: { 'num_ratings': +1, 'ratings_sum': rating_val }
        }, {
            new: true
        });
        assert_c(job_now.num_ratings !== 0, "ERROR: Methadone");


        console.log("This value (NUM rating) should now be INCREASED : ", job_now.num_ratings);
        console.log("This value (tot rating) should now be INCREASED : ", job_now.ratings_sum);
        console.log("JOB SEEMS TO BE DONE");

        return response
            .status(200)
            .json(job_now);

    }
    catch (err) {
        //might be due to jwt.sign or the other await's in try block
        console.error(err.message);
        return response
            .status(500)
            .json({ errors: [{ msg: 'COULD NOT RATE PERSON' }] });
    }

});

helperRouter.post("/upload_image", upload.single('profileImage'), async function (req, res, next) {

    // let id = req.body.user_id;

    try {

        let suspected_path = req.file.path;
        console.log("PATH IS ", suspected_path);
        let update = { profile_image_path: suspected_path };
        let concerned_user = await applicant_model.findOneAndUpdate({ email_id: req.body.email_id }, update, {
            new: true
        });
        console.log("concerend user is  ", concerned_user);
        return res
            .status(200)
            .send("Successful upload");

    }
    catch (err) {
        console.error(err.message);
        return res
            .status(500)
            .json({ errors: [{ msg: 'COULD NOT UPLOAD' }] });

    }


});




module.exports = helperRouter;





