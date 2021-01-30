// const config = require('./utils/config');
const express = require('express');
const app = express();
const cors = require('cors');
const users_r_Router = require('./controllers/users_r');
const users_a_Router = require('./controllers/users_a');
const helperRouter = require('./controllers/update_helpers');
const loginRouter = require('./controllers/login');
const applicationRouter = require('./controllers/application_related').applicationRouter;
const jobRouter=require("./controllers/listings")
const middleware = require('./utils/middleware');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const col = require("./terminal_colors");


////////////////////////////////////////////////////////
/*Middleware are functions that can be used for handling request and response objects.
The json-parser we used earlier takes the raw data from the requests that's stored in the request object, parses it into a JavaScript object and assigns it to the request object as a new property body.
*/


// DB config
//getting the mongo URI
//You have set db name as 'dass_1'
const DB_NAME = "dass_finalizing_4";
const url_encoded_pw = encodeURIComponent('<placeholder>@123');
const url = `mongodb+srv://tonybanner:${url_encoded_pw}@cluster0.mjt3t.mongodb.net/${DB_NAME}?retryWrites=true&w=majority`;
console.log(url);

mongoose.connect(url,
    { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false, useCreateIndex: true })
    .then(function () {
        console.log(col.Green, "Anmol's note Berlin : MongoDB connected");
    })
    .catch(function (err) {
        console.log("Anmol's notes Tokyo : An error occurred " + err);
    });

app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
// app.use(express.static('build'));
app.use(express.static(__dirname));



// Notice that json-parser is taken into use before the requestLogger middleware, because otherwise request.body will not be initialized when the logger is executed!
app.use(middleware.requestLogger); //prints the intro message for a request

//#######################################################################################

/*The first request parameter contains all of the information of the HTTP request,
and the second response parameter is used to define how the request is responded to.
*/
app.get('/',
    function (req, res) {
        //The status code of the response defaults to 200.

        res.send('APwI s RUNNING')
    });


    
app.use('/api/users/recruiter', users_r_Router);
app.use('/api/users/applicant', users_a_Router);
app.use('/api/recruiters/listings', jobRouter);
app.use('/api/auth', loginRouter);
app.use('/api/help', helperRouter);
app.use('/api/application', applicationRouter);
//###############################################################


app.use(middleware.unknownEndpoint);
app.use(middleware.errorHandler);

module.exports = app;
