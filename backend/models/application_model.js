const mongoose = require('mongoose');


//for validators via mongoose libraries, details: https://www.npmjs.com/package/mongoose-unique-validator
const uniqueValidator = require('mongoose-unique-validator');


const application_schema = new mongoose.Schema({
	status:
	{
		type: String,
		enum: ['applied', 'rejected', 'accepted', 'job_deleted', 'shortlisted'],
		required: true
	},
	applicant_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Applicant', required: true },
	sop:
	{
		type: String,
		default: ""
	},
	job_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Job', required: true },
	date_of_application: { type: String, required: true },
	person_rating: {
		type: Number,
		default: -1
	},
	job_rating: {
		type: Number,
		default: -1
	},
	date_of_joining: {type:String}
});


application_schema.plugin(uniqueValidator);

const application_model = mongoose.model('Application', application_schema);

module.exports = application_model;
