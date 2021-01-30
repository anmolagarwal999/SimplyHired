// It's important that dotenv gets imported before the database schema models is imported. This ensures that the environment variables from the .env file are available globally before the code from the other modules is imported.
require('dotenv').config();
const col = require("./terminal_colors");

const app = require('./app') // the actual Express application


const PORT_DEFAULT = 5000;

///////////////////////////////////////////////////////



const PORT = process.env.PORT || PORT_DEFAULT;

app.listen(PORT,
    //callback function
    function () {
        console.log(col.BgRed, 'I am cyan or am I ',col.Reset);  //cyan
        console.log(`Anmol's message : Server started on port ${PORT}`)
    });

