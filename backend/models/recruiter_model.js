const mongoose = require('mongoose');
const isEmail = require('validator').isEmail;


//for validators via mongoose libraries, details: https://www.npmjs.com/package/mongoose-unique-validator
const uniqueValidator = require('mongoose-unique-validator');


const recruiter_schema = new mongoose.Schema({
    // username:
    // {
    //     type: String,
    //     unique: true,
    //     required: true
    // },
    name:
    {
    	type: String,
    	required: true
    },
    passwordHash: String,
    email_id: {
        //https://stackoverflow.com/q/18022365/6427607
        type: String,
        unique: true,
        required: true,
        validate: [isEmail, 'invalid email']
    },
    phone_num:
    {
    	type: String,
        //Not a mandatory field
        validate: {
        	validator: function (v) {
        		var re = /^\d{10}$/;
        		return (v == null || v.trim().length < 1) || re.test(v)
        	},
        	message: 'Provided phone number is invalid.'
        }
    },
    bio:
    {
    	type: String,
    	default: ""
    },
    job_listings_posted: [
    {
    	type: mongoose.Schema.Types.ObjectId,
    	ref: 'Jobs'
    }
    ]

});



// userSchema.set('toJSON', {
//     transform: (document, returnedObject) => {
//         returnedObject.id = returnedObject._id.toString();
//         delete returnedObject._id;
//         delete returnedObject.__v;
//         // the passwordHash should not be revealed
//         delete returnedObject.passwordHash;
//     }
// })
recruiter_schema.plugin(uniqueValidator);

const recruiter_model = mongoose.model('Recruiter', recruiter_schema);

module.exports = recruiter_model;
