import axios from 'axios'
const baseUrl = 'http://localhost:5000/api/notes'


let token = null;

const setToken = newToken => {
    console.log("Trying to set the token variable to ", `bearer ${newToken}`);
    //The noteService module contains a private variable token. Its value can be changed with a function setToken, which is exported by the module. create, now with async/await syntax, sets the token to the Authorization header. The header is given to axios as the third parameter of the post method.
    token = `bearer ${newToken}`;
}
//The modified getAll function still returns a promise, as the then method of a promise also returns a promise.
const getAll = () => {
    console.log("Trying to get all resources from server : Goliath");
    const request = axios.get(baseUrl);
    return request.then((response) => { console.log(response); return response.data; });
}

const create = async newObject => {
    console.log("Trying to create a new resource");

    const config = {
        headers: { Authorization: token },
    };

    //The header is given to axios as the third parameter of the post method.
    const response = await axios.post(baseUrl, newObject, config)

    return response.data;
}

const update = (id, newObject) => {
    console.log("Trying to update a resource");

    const request = axios.put(`${baseUrl}/${id}`, newObject)
    return request.then((response) => { console.log(response); return response.data; })
}

export default {
    getAll: getAll,
    create: create,
    update: update,
    setToken: setToken
}