require("dotenv").config();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const users_r_Router = require('express').Router();
const recruiter_model = require('../models/recruiter_model');
const applicant_model = require('../models/applicant_model');
const { check, validationResult } = require('express-validator/check');
const col = require("../terminal_colors");
const assert_c = require("../utils/assert_func");
const auth = require('../utils/auth_help');


// @route    POST api/users/recruiter
// @desc     Register user
// @access   Public
users_r_Router.post('/',
    [
        check('name', 'Name is required').not().isEmpty(),
        check('email_id', 'Please include a valid email').isEmail(),
        check('password', 'Please enter a non-empty password').isLength({ min: 1 })
    ],
    async (request, response) => {
        console.log(col.BgGreen, "Trying to register Recruiter", col.Reset);
        //////////////////////////////////////////////////////////////////////////
        //Prelim error checking
        //console.log("request is ",request);
        const errors = validationResult(request);
        if (!errors.isEmpty()) {
            console.log("errors found are ", errors);
            return response.status(400).json({ errors: errors.array() });
        }
        ////////////////////////////////////////////////

        const body = request.body;
        console.log("Body received is ", body);
        try {
            let already_user;
            /////////////////////////////////////////////////////////////////
            already_user = await recruiter_model.findOne({ email_id: request.body.email_id });

            if (already_user) {
                console.log(col.Red, 'Someone with same email-id (R) already registered', col.Reset);

                return response
                    .status(400)
                    .json({ errors: [{ msg: 'Someone with same email-id (R) already registered' }] });
            }
            console.log(col.Blue, "Not already a recruiter", col.Reset);
            //////////////////////////////////////////////////////////////////////////
            /////////////////////////////////////////////////////////////////
            already_user = await applicant_model.findOne({ email_id: request.body.email_id });

            if (already_user) {
                console.log(col.Red, 'Someone with same email-id (A) already registered', col.Reset);
                return response
                    .status(400)
                    .json({ errors: [{ msg: 'Someone with same email-id (A) already registered' }] });
            }
            console.log(col.Blue, "Not already an applicant", col.Reset);

            //////////////////////////////////////////////////////////////////////////

            const saltRounds = 10;

            //The password sent in the request is not stored in the database. We store the hash of the password that is generated with the bcrypt.hash function.
            //For more on bcypt saltRounds details, use this : When you are hashing your data the module will go through a series of rounds to give you a secure hash. The value you submit there is not just the number of rounds that the module will go through to hash your data. The module will use the value you enter and go through 2^rounds iterations of processing.
            //TODO: better hashing, read here : https://github.com/kelektiv/node.bcrypt.js/#a-note-on-rounds
            const passwordHash = await bcrypt.hash(body.password, saltRounds);
            let bio_got = "";
            let phone_got = "";
            if ("bio" in body) {
                bio_got = body.bio;
            }
            if ("phone_num" in body) {
                phone_got = body.phone_num;
            }

            const user = new recruiter_model({
                name: body.name,
                passwordHash: passwordHash,
                email_id: body.email_id,
                bio: bio_got,
                phone_num: phone_got
            })

            const saved_user = await user.save();
            console.log(col.Green, "recruiter_model registration seems to be successful", col.Reset);

            const userForToken = {
                user: {
                    email_id: user.email_id,
                    id: user.id
                }
            };

            console.log("userToken is ", userForToken);
            console.log("debug Env var is ", process.env.SECRET);
            const token = await jwt.sign(userForToken, process.env.SECRET);
            console.log("Login possible, chaces looking good");
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
        }
    });

//################################################################################################


//###################################################################################################
// @route   GET api/users/recruiter/get_profile
// @desc     Fetch profile of user
// @access   Private

//TODO: see req which is private, is made by same person and not another person
//add auth

users_r_Router.get('/get_profile', auth, async (request, response) => {
    console.log("Inside function GETTING RECRUITERS PROFILE");

    const body = request.query;
    console.log("BODY IS ", body);
    try {

        //name, email-id, skills_list, ed_list
        let curr_user = await recruiter_model.findOne({ email_id: body.email_id },
            { "name": 1, "email_id": 1, "phone_num": 1, "bio": 1 })
            .lean();

        if (!curr_user) {
            console.error(col.BgRed, 'Email ID not in RECRUITERS database', col.Reset);

            return response
                .status(400)
                .json({ errors: [{ msg: 'Email ID not in RECRUITERS database' }] });
        }

        console.log(col.Yellow, "Recruiter is  ", curr_user, "\n", col.Reset);
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

// @route    POST api/users/recruiter/edit_profile
// @desc    EDIT user
// @access   Public


//TODO: see req which is private, is made by same person and not another person
//add auth

users_r_Router.post('/edit_profile', auth,
    [
        check('name', 'Name is required').not().isEmpty(),
        check('phone_num', 'PHONE NUMBER is required').not().isEmpty(),
        check('email_id', 'Please include a valid email').isEmail()
    ],
    async (request, response) => {
        console.log(col.Green, "Trying to update Recruiter", col.Reset);
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
            let update = { bio: body.bio, phone_num: body.phone_num, name: body.name };
            /////////////////////////////////////////////////////////////////
            mod_user = await recruiter_model.findOneAndUpdate({ email_id: request.body.email_id }, update,
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





module.exports = users_r_Router;