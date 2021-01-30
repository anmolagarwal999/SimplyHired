const mongoose = require('mongoose');
// import { isEmail } from 'validator';
// const isEmail = require('validator').isEmail;
const isEmail = require('validator').isEmail;


// const isEmail_valid = function(email) {
//     var re = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
//     return re.test(email)
// };



//for validators via mongoose libraries, details: https://www.npmjs.com/package/mongoose-unique-validator
const uniqueValidator = require('mongoose-unique-validator');


const applicant_schema = new mongoose.Schema({

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
	skills_list: [{
		type: String
	}],
	num_ratings:
	{
		type: Number,
		default: 0,
		validate:
		{
			validator:
				function (v) {
					if (Number.isInteger(v) && v >= 0) {
						return true;
					}
					return false;
				},
			message: 'Must be a non-negative integer'
		},
	},
	ratings_sum:
	{
		type: Number,
		default: 0,
		validate:
		{
			validator:
				function (v) {
					if (Number.isInteger(v) && v >= 0) {
						return true;
					}
					return false;
				},
			message: 'Must be a non-negative integer'
		},
	},
	//links for referening other schemas : https://stackoverflow.com/q/29078753/6427607 or https://mongoosejs.com/docs/populate.html
	applications_submitted:
		[
			{
				application_id: {
					type: mongoose.Schema.Types.ObjectId,
					ref: 'Application'
				},
				job_id: {
					type: mongoose.Schema.Types.ObjectId,
					ref: 'Job'
				}
			}
		],
	ed_list: [
		{
			institute: {
				type: String,
				required: true
			},
			start_yr: {
				type: String,
				required: true
			},
			end_yr: {
				type: String
			}
		}
	],
	num_open_applications:
	{
		type: Number,
		default: 0,
		validate:
		{
			validator:
				function (v) {
					if (Number.isInteger(v) && v >= 0) {
						return true;
					}
					return false;
				},
			message: 'Must be a non-negative integer'
		},
	},
	is_hired: {
		type: Boolean,
		default: false
	},
	profile_image_path:
	{
		type: String,
        deafult:""
	},
	//adding RESUME OR Photograph

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
applicant_schema.plugin(uniqueValidator);

const applicant_model = mongoose.model('Applicant', applicant_schema);

module.exports = applicant_model;
