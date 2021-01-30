const applicationRouter = require('express').Router();
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


const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'dassjobportal999@gmail.com',
        pass: 'dummy@123'
    }
});
const send_email = (email_obj) => {
    //name, email id , job title
    // let email_obj_to_send = { receiver_email_id, receiver_name, job_title };

    let mailOptions = {
        from: 'dassjobportal999@gmail.com',
        to: email_obj.receiver_email_id,
        subject: "Accepted job for " + email_obj.receiver_email_id + " by " + email_obj.job_title,
        text: `Hello ${email_obj.receiver_name},\n, Your app for job ${email_obj.job_title} has been accepted.
        \nBest regards, Anmol's DASS Job Portal.`
    };
    // mailOptions = { ...mailOptions, "to": "anmolagarwal4453@gmail.com" };
    transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
            console.log(col.BgRed, 'Gotham ERROR IS ' + error, col.Reset);
        } else {
            console.log(col.BgCyan, 'Araknet Email sent: ' + info.response, col.Reset);
        }
    });
}




/*
Change status of applicant to Accepted,
change candidate to RECRUITED, 
Mark all other applications of candidate as rejected,
Append his ID to accepted array of JOB
Reduce candidate open counter to ONE (since you are considering accepted as APPLIED), 
Change isSlotsFull variable of this particular job.
(If isSlots is full, reject all candidates [who haven’t been hired yet] who have an interest in this job).
[UPDATE rejected applicant’s variables as well]
*/
// @route   POST api/application/accept
// @desc     POST candidate as ACCEPTED
// @access   Recruiter

//https://stackoverflow.com/a/53263784/6427607

applicationRouter.post('/accept', auth, async (request, response, next) => {

    console.log(col.BgYellow, "Inside function ACCEPTING APPLICATION", col.Reset);

    const body = request.body;
    console.log("BODY IS ", body);
    try {


        //getting app id
        let app_to_accept_id = body._id;
        console.log(col.BgCyan, "app to accept id is ", app_to_accept_id, col.Reset);

        //getting app data
        let accept_poss = await accept_application(app_to_accept_id);
        if (accept_poss === false) {
            return response
                .status(500)
                .json({ errors: [{ msg: 'Error encountered while ACCEPTING the application ' }] });
        }

        // Append his ID to accepted array of JOB
        //         Change isSlotsFull variable of this particular job.
        // (If isSlots is full, reject all candidates [who haven’t been hired yet] who have an interest in this job).
        // [UPDATE rejected applicant’s variables as well]

        console.log("----------");
        console.log("NOW Tryong to append accepted app and see if others need to be disappointed due to filling of room");
        let app_now = await application_model.findById(app_to_accept_id);
        let job_now = await job_model.findById(app_now.job_id).populate("applications_received");

        let curr_accepted_num = job_now.applications_approved.length;
        let update = {
            $push: {
                applications_approved: app_now._id
            }
        };
        if (curr_accepted_num + 1 === job_now.num_slots) {
            console.log(col.Red, "SLOTS ARE FULL");

            console.log("Slots lim is ", job_now.num_slots);
            console.log("SLOTS FILLED BEFORE CURRENT ARE  ", curr_accepted_num, col.Reset);
            update = { ...update, are_slots_full: true };
        }

        let job_mod = await job_model.findByIdAndUpdate(app_now.job_id, update, {
            new: true
        });

        if (job_mod.are_slots_full === true) {
            await job_reached_slots_full(job_now);
        }

        /////////////////////////////////////////////////////////
        let receiver_email_id, receiver_name, job_title;
        let applicant_now = await applicant_model.findOne({ _id: app_now.applicant_id }, { "name": 1, email_id: 1 });
        receiver_email_id = applicant_now.email_id;
        receiver_name = applicant_now.name;
        job_title = job_mod.title;
        let email_obj_to_send = { receiver_email_id, receiver_name, job_title };
        send_email(email_obj_to_send);



        console.log("SUCCESS FINALLY");
        return response.status(200).send("ACCEPTED");
    }
    catch (err) {
        //might be due to jwt.sign or the other await's in try block
        console.error(err.message);
        return response
            .status(500)
            .json({ errors: [{ msg: 'Error in backend [probable SERVER ERROR]: COULD NOT ACCEPT ' }] });
    }

})

const job_reached_slots_full = async (job_obj) => {
    //reject participants who have still status as APPLIED
    console.log(col.Red, "This job has filled all positionsL Time to reject remaining applicants", col.Reset);
    let job_now = job_obj;
    console.log("SLOTS ARE FULL second msg");
    let inspect_ids = job_now.applications_received;
    let inspect_len = inspect_ids.length;
    console.log("Inspect ids are ", inspect_ids);
    console.log("Inspect len are ", inspect_len);
    for (let i = 0; i < inspect_len; i++) {
        console.log("i is ", i);
        console.log("obj is  ", job_now.applications_received[i]);
        let app_now = await application_model.findById(job_now.applications_received[i]);

        if (app_now.status === "applied" || app_now.status === "shortlisted") {
            console.log("FOund app with applied status with id ", app_now._id);
            let rej_poss = await reject_application(app_now._id);
            if (rej_poss === false) {
                return response
                    .status(500)
                    .json({ errors: [{ msg: 'Error in backend [probable SERVER ERROR]: COULD NOT ACCEPT. ENcounetred when candidates wer ebeing rejected as anther candidate completed the slots ' }] });
            }
            console.log("!!!!!!!!!!!!!!!!!!!!!!!!!!!!");

        }
    }
}



// @route   POST api/application/shortlist
// @desc     POST candidate as SHORTLISTED
// @access   Recruiter

//https://stackoverflow.com/a/53263784/6427607

applicationRouter.post('/shortlist', auth, async (request, response, next) => {

    console.log(col.BgYellow, "Inside function SHORTLISTING APPLICATION", col.Reset);

    const body = request.body;
    console.log("BODY IS ", body);
    try {
        //getting app id
        let app_to_shortlist_id = body._id;
        console.log(col.BgCyan, "app to SHORTLIST id is ", app_to_shortlist_id, col.Reset);

        //getting app data
        let shortlist_poss = await shortlist_application(app_to_shortlist_id);
        if (shortlist_poss === false) {
            return response
                .status(500)
                .json({ errors: [{ msg: 'Error encountered while Shortlisting the application ' }] });
        }

        console.log("SUCESS FINALLY");
        return response.status(200).send("SHORTLISTED");
    }
    catch (err) {
        //might be due to jwt.sign or the other await's in try block
        console.error(err.message);
        return response
            .status(500)
            .json({ errors: [{ msg: 'Error in backend [probable SERVER ERROR]: COULD NOT SHORLIST ' }] });
    }

})



// @route   POST api/application/reject
// @desc     POST candidate as REJECTED
// @access   Recruiter

//https://stackoverflow.com/a/53263784/6427607

applicationRouter.post('/reject', auth, async (request, response, next) => {

    console.log("Inside ROUTE REJECTING APPLICATION");

    const body = request.body;
    console.log("BODY IS ", body);
    try {
        let app_to_reject_id = body._id;
        let reject_poss = await reject_application(app_to_reject_id);
        if (reject_poss === false) {
            return response
                .status(500)
                .json({ errors: [{ msg: 'Error encountered while rejecting the application ' }] });
        }
        return response.status(200).send("REJECTED");
    }
    catch (err) {
        //might be due to jwt.sign or the other await's in try block
        console.error(err.message);
        return response
            .status(500)
            .json({ errors: [{ msg: 'Error in backend [probable SERVER ERROR]: COULD NOT REJECT ' }] });
    }

})
/////////////////////////////////////////////////////

/////////////////////////////////////////////////////


/*While rejecting an app, 
change status to rejected.
Decrease num open count of applicant

*/
const reject_application = async (app_id) => {
    let is_poss = true;
    console.log("\n$$$$$$$$$$$$$$$$$$$\nTrying to reject app with id ", app_id);
    try {

        let app_old = await application_model.findById(app_id);

        if (app_old.status === "rejected") {
            //But this is fine, as rejection may have happended before this newly accepted job
            console.log(col.BgYellow, "Application is already rejected,", col.Reset);
            return true;
        }

        if (app_old.status === "job_deleted") {
            //THis is fine coz even though he is rejected from job J1, the deleted app would have been from J2
            console.log(col.BgYellow, "Application HAS BEEN DELETED", col.Reset);
            return true;
        }

        assert_c((app_old.status === "applied" || app_old.status === "shortlisted"), "Pegasus Error");

        //only if applied and shortlisted stage
        let app_now = await application_model.findByIdAndUpdate(app_id, { "status": "rejected" }, {
            new: true
        });
        console.log(col.Green, "--------Changed status of app to rejected", col.Reset);
        console.log(col.Green, "\nOLD application is look at STATUS REJECTED ,", app_now, "\n", col.Reset);

        //https://stackoverflow.com/a/41444359/6427607
        //https://stackoverflow.com/a/31788824/6427607
        let applicant_now = await applicant_model.findOneAndUpdate({ _id: app_now.applicant_id }, { $inc: { 'num_open_applications': -1 } }, {
            new: true
        });
        console.log(col.Yellow, "---------Decreasd num applications field", col.Reset);

        console.log("\nUpdated applicant is look at num_app field ,", applicant_now, "\n");
        return true;

    }
    catch (err) {
        console.error(col.BgRed, "Error message is ", err.message, col.Reset);
        return false;
    }
}


function get_iso_date_str_from_obj(d) {
    function pad(n) { return n < 10 ? '0' + n : n }
    let str_got = d.getUTCFullYear() + '-'
        + pad(d.getUTCMonth() + 1) + '-'
        + pad(d.getUTCDate()) + 'T'
        + pad(d.getUTCHours()) + ':'
        + pad(d.getUTCMinutes());
    console.log("Retuerning ", str_got);
    return str_got;
}


const accept_application = async (app_id) => {
    let is_poss = true;
    console.log(col.BgBlue, "Trying to accept app id ", app_id, col.Reset);
    try {

        let current_dts = new Date();;
        let val_to_use = get_iso_date_str_from_obj(current_dts);


        let app_now = await application_model.findByIdAndUpdate(app_id, { "status": "accepted", "date_of_joining": val_to_use }, {
            new: true
        });

        console.log("Status should be changed to accepted ::: ", app_now.status);
        assert_c((app_now.status === "accepted"), "Exodus Error");

        //https://stackoverflow.com/a/41444359/6427607
        //https://stackoverflow.com/a/31788824/6427607
        let applicant_now = await applicant_model.findOneAndUpdate({ _id: app_now.applicant_id }, { "is_hired": true }, {
            new: true
        });

        console.log("Hiring status must have been changed : ", applicant_now.is_hired);
        assert_c((applicant_now.is_hired === true), "Draper Error");



        let already_apps = applicant_now.applications_submitted;
        let len_already = already_apps.length;
        console.log("Number of aready present applications is ", len_already);
        for (let i = 0; i < len_already; i++) {
            console.log("i val is ,", i);
            if (already_apps[i].application_id.toString() != app_id) {
                console.log("COmapring " + already_apps[i].application_id, " with ", app_id);
                console.log("typw of app_id is ", typeof app_id);
                console.log("typw of ARRAY elem  is ", typeof already_apps[i].application_id);
                console.log(app_id);
                console.log(already_apps[i].application_id);
                let reject_status = await reject_application(already_apps[i].application_id);
                if (reject_status === false) {
                    console.log(col.BgRed, "%%%%%%%%%%SOme error while rejecting other apps coz applicant was HIRED%%%%%%%%%%%\n", col.Reset);
                    return false;
                }
                console.log("!!!!!!!!!!!!!!!!!!!!!!!!!!!!");
            }
        }
        console.log("ACCEPTANCE SEEMS TO BE SUCCESSFUL");
        console.log(col.BgCyan, "ACCEPTED APP IS ", app_now, col.Reset);
        // console.log("\nUpdated applicant is )look at num_app field ,", applicant_now, "\n");
        // console.log("\nUpdated application is )look at STATUS REJECTED ,", app_now, "\n");
        return true;

    }
    catch (err) {
        console.error(col.BgRed, "Idris Error message is ", err.message, col.Reset);
        return false;
    }
}


const shortlist_application = async (app_id) => {
    let is_poss = true;
    console.log(col.BgBlue, "Trying to shortlist app id ", app_id, col.Reset);
    try {


        let app_now = await application_model.findByIdAndUpdate(app_id, { "status": "shortlisted" }, {
            new: true
        });

        console.log("Status should be changed to shortlisted ::: ", app_now.status);
        assert_c((app_now.status === "shortlisted"), "Exodus Error");


        console.log("shortlistANCE SEEMS TO BE SUCCESSFUL");
        console.log("shortlistED APP IS ", app_now);
        // console.log("\nUpdated applicant is )look at num_app field ,", applicant_now, "\n");
        // console.log("\nUpdated application is )look at STATUS REJECTED ,", app_now, "\n");
        return true;

    }
    catch (err) {
        console.error(col.BgRed, "Daniel Error message is ", err.message, col.Reset);
        return false;
    }
}

module.exports = { applicationRouter, job_reached_slots_full };
