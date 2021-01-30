const jwt = require('jsonwebtoken');
// const config = require('config');

module.exports = function (req, res, next) {
  // Get token from header
  console.log("Entered authentication function");
  const token = req.header('anmol_token');

  // Check if not token
  if (!token) {
    console.log("No token found");
    return res.status(401).json({ msg: 'No token, authorization denied' });
  }

  // Verify token
  try {
    console.log("sec key is ", process.env.SECRET);
    const decoded = jwt.verify(token, process.env.SECRET);
    console.log("decoded");
    if (!token || !decoded.user.id) {
      console.log("Received token is missing or invalid");
      //If there is no token, or the object decoded from the token does not contain the user's identity (decodedToken.id is undefined), error status code 401 unauthorized is returned and the reason for the failure is explained in the response body
      return response.status(401).json({ msg: 'token missing or invalid' });
    }
    req.user = decoded.user;
    //   user: {
    //     email_id: user.email_id,
    //     id: user.id,
    //     user_type: user_type
    // }
    next();
  } catch (err) {
    console.log(err.message);
    res.status(401).json({ msg: 'Token is not valid' });
  }
};