import { executeQuery } from "../config/db.js";
import jwt from "jsonwebtoken";
import cookie from "cookie"
const JWT_SECRET = process.env.JWT_SECRET // store in .env in production
const REFRESH_TOKEN_SECRET = process.env.REFRESH_SECRET;

export const Login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ status: "fail", message: "Email and password required" });
    }

    // Query user from database
    const query = "SELECT user_id, user_name, email, password FROM users WHERE email = $1";
    const result = await executeQuery(query, [email]);

    if (result.length === 0) {
      return res.status(401).json({ status: "fail", message: "Invalid credentials" });
    }

    const user = result[0];

    // Plain text password check
    if (user.password !== password) {
      return res.status(401).json({ status: "fail", message: "Invalid credentials" });
    }

    // Generate JWT
    const token = jwt.sign(
      {
        user_id: user.user_id,
        user_name: user.user_name,
        email: user.email
      },
      JWT_SECRET,
      { expiresIn: "15m" }
    );
    const refreshToken = jwt.sign(
      {
        user_id: user.user_id,
        user_name: user.user_name,
        email: user.email
      },
      REFRESH_TOKEN_SECRET,
      { expiresIn: "30d" }
    );

res.cookie("token", token, {
  httpOnly: true,
  maxAge:  15 * 60 * 1000,       // in milliseconds
  secure:true,
  sameSite: "Strict",
  path: "/"
});

res.cookie("refreshToken", refreshToken, {
  httpOnly: true,
  maxAge: 30 * 24 * 60 * 60 * 1000,     // in milliseconds
  secure: true,
  sameSite: "Strict",
  path: "/"
});
    // Return token with status
    res.status(200).json({ status: "success", message:"Login Successful" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ status: "error", message: "Server error" });
  }
};

export const getAllUser = async (req, res) => {
  const user_id = req.user_id;

  try {
    const query = `SELECT user_id,user_name,email,is_active FROM users WHERE user_id != $1`;
    const response = await executeQuery(query, [user_id]);

    if (!response || response.length === 0) {
      return res.status(204).json({ status: "no_content", message: "No users found" });
    }

    return res.status(200).json({ status: "success", data: response });
  } catch (err) {
    console.error("Error fetching users:", err);
    return res.status(500).json({ status: "error", message: "Server error" });
  }
};

export const refreshToken = (req, res) => {
  try {
   const refreshToken = req.cookies.refreshToken;
    
    if (!refreshToken) {
      return res.status(401).json({ status: "fail", message: "Refresh token missing" });
    }

    // Verify refresh token
    jwt.verify(refreshToken, REFRESH_TOKEN_SECRET, (err, decoded) => {
      if (err) {
        return res.status(403).json({ status: "fail", message: "Invalid or expired refresh token" });
      }

      // Generate new access token
      const newAccessToken = jwt.sign(
        {
          user_id: decoded.user_id,
          user_name: decoded.user_name,
          email: decoded.email,
        },
        JWT_SECRET,
        { expiresIn: "1h" }
      );

      // Set new cookie
      res.setHeader(
        "Set-Cookie",
        `token=${newAccessToken}; HttpOnly; Path=/; Max-Age=3600; Secure; SameSite=Strict`
      );

      res.status(200).json({ status: "success", message: "Access token refreshed" });
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: "error", message: "Server error" });
  }
};
