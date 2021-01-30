const mongoose = require('mongoose');


//for validators via mongoose libraries, details: https://www.npmjs.com/package/mongoose-unique-validator
const uniqueValidator = require('mongoose-unique-validator');


const job_schema = new mongoose.Schema({
	title: { type: String, required: true },
	employer_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Recruiter', required: true },
	max_applications:
	{
		type: Number,
		required: true,
		validate:
		{
			validator:
			function (v) {
				if (Number.isInteger(v) && v > 0) {
					return true;
				}
				return false;
			},
			message: 'Max number of applications acceptable Must be a positive integer'
		},
	},
	num_slots:
	{
		type: Number,
		required: true,
		validate:
		{
			validator:
			function (v) {
				if (Number.isInteger(v) && v > 0) {
					return true;
				}
				return false;
			},
			message: 'Number of slots Must be a non-negative integer'
		},
	},
	date_of_posting: { type: String, required: true },
	date_of_deadline: { type: String, required: true },
	reqd_skills: [{ type: String }],
	job_duration:
	{
		type: Number,
		required: true,
		validate:
		{
			validator:
			function (v) {
				if (Number.isInteger(v) && v >= 0 && v <= 6) {
					return true;
				}
				return false;
			},
			message: 'DURATION Must be a non-negative integer less than 6'
		},
	},
	salary:
	{
		type: Number,
		required: true,
		validate:
		{
			validator:
			function (v) {
				if (Number.isInteger(v) && v >= 0) {
					return true;
				}
				return false;
			},
			message: 'Salary Must be a non-negative integer'
		},
	},
	job_type:
	{
		type: String,
		enum: ['full_time', 'part_time', 'work_from_home'],
		default: 'full_time'
	},
	applications_received: [
	{
		type: mongoose.Schema.Types.ObjectId,
		ref: 'Application'
	}
	],
	applications_approved: [
	{
		type: mongoose.Schema.Types.ObjectId,
		ref: 'Application'
	}
	],
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
	is_deleted: {
		type: Boolean,
		default: false
	},
	is_deadline_over: {
		type: Boolean,
		default: false
	},
	are_apps_full: {
		type: Boolean,
		default: false
	}, 
	are_slots_full: {
		type: Boolean,
		default: false
	}

});


job_schema.plugin(uniqueValidator);

const job_model = mongoose.model('Job', job_schema);

module.exports = job_model;
