import jwt from "jsonwebtoken";

export const authenticateJWT = (req, res, next) => {
  try {
    const token = req.cookies.token;
    if (!token) {
      return res.status(401).json({
        status: "fail",
        message: "Access denied. No token provided in cookies.",
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Attach user info to request object
    req.user_id = decoded.user_id;
    req.user_name = decoded.user_name;
    req.email = decoded.email;
    console.log("hi 1");

    next();
  } catch (err) {
    console.error("JWT verification failed:", err);
    return res.status(403).json({
      status: "fail",
      message: "Invalid or expired token",
    });
  }
};
