const job_model=require("../models/job_model");



function has_deadline_crossed(time_str) {
    let current_dts = new Date();
    let deadline_str = time_str + ":59";

    //do this only if currently, deadline still seems to be unset. We don;t want to overwrite.


    let deadline_dts = new Date(deadline_str);
    //convert them to Date objects, subtract and check diff
    let time_diff = deadline_dts - current_dts + (330 * 60 * 1000);
    console.log("deadline dts obj is ", deadline_dts);
    console.log("Current dts obj is ", current_dts);
    console.log("Time diff is ", time_diff);
    console.log("Time diff in minutes seems to be  ", time_diff / (1000 * 60));
    if (time_diff <= 0) {
        return true;
    }
    return false;
}

async function update_deadline_validity() {

    try {
        //fetch all jobs from database
        //https://kb.objectrocket.com/mongo-db/mongoose-find-all-818
        let all_jobs = await job_model.find({}, { date_of_deadline: 1, is_deadline_over: 1 });
        //see current time string
        let current_dts = new Date();


        let arr_len = all_jobs.length;
        //current date in returned in GMT format.
        //deadline day is assumed to be IST and is done -5:30 to convert to UTC. 
        //Actaully, deadline day is already in UTC. So, we need to manually increase deadline day by 5.5.

        let update_arr_ids = [];
        console.log("all jobs array is ", all_jobs);
        //iterate
        for (let i = 0; i < arr_len; i++) {
            //for each job, extract deadline string
            let deadline_str = all_jobs[i].date_of_deadline + ":59";

            //do this only if currently, deadline still seems to be unset. We don;t want to overwrite.
            console.log(all_jobs[i].is_deadline_over);
            if (all_jobs[i].is_deadline_over === false) {
                let deadline_dts = new Date(deadline_str);
                //convert them to Date objects, subtract and check diff
                let time_diff = deadline_dts - current_dts + (330 * 60 * 1000);
                console.log("deadline dts obj is ", deadline_dts);
                console.log("Current dts obj is ", current_dts);
                console.log("Time diff is ", time_diff);
                console.log("Time diff in minutes seems to be  ", time_diff / (1000 * 60));
                if (time_diff <= 0) {
                    update_arr_ids.push(all_jobs[i]._id);
                    console.log("Found one to be modified");
                    // return;
                }
            }
            console.log("---------------------------------------------------");

        }

        let update_len = update_arr_ids.length;
        for (let i = 0; i < update_len; i++) {
            let updated_element = await job_model.findByIdAndUpdate(update_arr_ids[i], { "is_deadline_over": true }, {
                new: true
            });

        }
    }
    catch (err) {
        //might be due to jwt.sign or the other await's in try block
        console.error("Error message is ", err.message);
        return false;
    }

    return true;
}


module.exports = {
   update_deadline_validity, has_deadline_crossed
}