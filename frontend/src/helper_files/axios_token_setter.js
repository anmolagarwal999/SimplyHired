import axios from "axios";


const set_axios_default_token = (token) => {
    console.log("Setting axios default token as ", token);
    if (token) {
        // Apply authorization token to header in every request if logged in
        axios.defaults.headers.common["anmol_token"] = token;
    } else {
        // Delete token from header
        console.log("Deleting axios dfault token");

        delete axios.defaults.headers.common["anmol_token"];
    }
};

export default set_axios_default_token;