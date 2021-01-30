/*
Concept to know before implementing:
Token - based authentication
1)user starts by logging in using a login form
2) This causes the React code to send the username and the password to the server address /api/login as a HTTP POST request.

3)If the username and the password are correct, the server generates a token which somehow identifies the logged in user.
    The token is signed digitally, making it impossible to falsify (with cryptographic means)
4)The backend responds with a status code indicating the operation was successful, and returns the token with the response.
5)The browser saves the token, for example to the state of a React application.
6)When the user creates a new note (or does some other operation requiring identification), the React code sends the token to the server with the request.
7)The server uses the token to identify the user
*/

require("dotenv").config();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const auth = require('../utils/auth_help');
const loginRouter = require('express').Router();
const recruiter_model = require('../models/recruiter_model');
const applicant_model = require('../models/applicant_model');
const { check, validationResult } = require('express-validator/check');
const col = require("../terminal_colors");
const assert_c = require("../utils/assert_func");


//#################################################################################################################
// @route    POST api/auth
// @desc     Authenticate user & get token
// @access   Public

loginRouter.post('/',
    [
        check('email_id', 'Please include a valid email').isEmail(),
        check('password', 'Non empty Password is needed to login').notEmpty()
    ],
    async (request, response) => {

        console.log(col.Green, "Inside login.js of backend", col.Reset);

        //Making sure all inputs are valid
        const errors_gen = validationResult(request);
        if (!errors_gen.isEmpty()) {
            console.log(col.Red, "Kenya Errors caught in express-validator", col.Reset);
            //The request could not be understood by the server due to malformed syntax. The client SHOULD NOT repeat the request without modifications.
            return response.status(400).json({ errors: errors_gen.array() });
        }


        const body = request.body;
        console.log("Attempt to login by cient-side");
        //check whether username is valid or not
        try {
            let user_type = "none";
            let user;
            user = await recruiter_model.findOne({ email_id: body.email_id });
            // console.log(user);

            if (user) {
                console.log(col.Yellow, "Intended user is (R)", col.Reset);
                user_type = "type_r";
            }
            else {
                user = await applicant_model.findOne({ email_id: body.email_id });
                if (user) {
                    console.log(col.Yellow, "Intended user is (A)", col.Reset);
                    user_type = "type_a";
                }

            }
            if (user_type === "none") {
                console.log(col.BgRed, "Login credentials are invalid", col.Reset);

                return response
                    .status(400)
                    .json({ errors: [{ msg: 'Email id not found in database' }] });
            }

            //The salt is usually included in the resulting hash-string in readable form.
            //So with storing the hash-string you also store the salt.
            //https://stackoverflow.com/a/46713082/6427607
            //My understanding is that, first salt is extracted from passwordHash and same salt is applied to 'password' entered by the user to see if 
            //the hashed version of the entered password matches with the hashed version of the original genuine password
            const passwordCorrect = (user === null) ? false : await bcrypt.compare(body.password, user.passwordHash);
            console.log(col.Green, "password correct status is ", passwordCorrect, col.Reset);

            //if username does not exist or passowrd is incorrect
            if (!(user && passwordCorrect)) {
                console.log(col.Red, "RedFlag: Password is incorrect", col.Reset);
                return response
                    .status(400)
                    .json({ errors: [{ msg: 'Incorrect password' }] });
            }
            // console.log("OUTSIDE possible");

            //see mechanism of tokens here : https://jwt.io/introduction
            //useful stuff about jwt tokens https://www.freecodecamp.org/news/what-are-json-web-tokens-jwt-auth-tutorial/
            //a token is created with the method jwt.sign. The token contains the username and the user id in a digitally signed form.
            const user_token_obj = {
                user: {
                    email_id: user.email_id,
                    id: user.id,
                    user_type: user_type
                }
            };

            console.log("user_token_obj is ", user_token_obj);
            console.log("Env var is ", process.env.SECRET);
            const token = await jwt.sign(user_token_obj, process.env.SECRET);
            console.log("Login possible, chaces looking good");
            console.log(col.BgGreen, "Login approved by BACKEND, sending token for future sessions", col.Reset);
            let obj_to_send={ token: token, email_id: user.email_id, user_type: user_type }
            console.log(col.BgYellow, "OBJ BEING SENT IS ",obj_to_send,  col.Reset)
            response
                .status(200)
                .send(obj_to_send)
        }
        catch (err) {
            //might be due to jwt.sign or the other await's in try block
            console.error(err.message);
            return response
                .status(500)
                .json({ errors: [{ msg: 'Server error' }] });
        }
    })
//#################################################################################################################

module.exports = loginRouter;