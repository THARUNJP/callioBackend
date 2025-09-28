import jwt from "jsonwebtoken";

export const validateUserCookie = (token) => {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    return {
      isAuthorized: true,
      user_id: decoded.user_id, // extract user_id from payload
    };
  } catch (err) {
    return {
      isAuthorized: false,
      error: err.message || err, // return the error message
    };
  }
};