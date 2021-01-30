
const is_valid_email = (mail) => {
    if (/^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/.test(mail)) {
        return (true);
    }
    return (false);
}

const get_pos_integer = (num) => {
    let tmp_str = (num.replace(/\D+/g, ""));
    if (tmp_str === "") {
        return "";
    }
    else {
        return Number(tmp_str);
    }

}

const is_valid_phone_num = (v) => {
    var re = /^\d{10}$/;
    return (v == null || v.trim().length < 1) || re.test(v)
}


function get_iso_date_str_from_obj(d) {
    function pad(n) { return n < 10 ? '0' + n : n }
    let str_got = d.getUTCFullYear() + '-'
        + pad(d.getUTCMonth() + 1) + '-'
        + pad(d.getUTCDate()) + 'T'
        + pad(d.getUTCHours()) + ':'
        + pad(d.getUTCMinutes());
    console.log("Retuerning ", str_got);
    return str_got;
}

// var date = new Date();
// var currentISODateTime = ISODateString(date);
// var ISODateTimeToCompareWith = marker.timestamp;

export default { is_valid_email, is_valid_phone_num, get_pos_integer, get_iso_date_str_from_obj };