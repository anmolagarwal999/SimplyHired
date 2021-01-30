import axios from 'axios'
const baseUrl = 'http://localhost:5000/api/login'

const login = async credentials => {
  console.log("Client trying to login with input as follows: ", credentials);
  const response = await axios.post(baseUrl, credentials);
  console.log("Response to login attempt ", response);
  return response.data;
}

export default { login }