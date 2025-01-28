const jwt = require("jsonwebtoken");
const User = require("../models/User");

// Authentication middleware
const authenticate = async (req, res, next) => {
  const token = req.header("Authorization")?.replace("Bearer ", "");

  if (!token) {
    return res.status(401).json({ message: "Authentication required" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("Decoded token:", decoded);

    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    req.userId = user._id; // Attach userId to request object
    req.userRole = user.role; // Attach user role to request object
    next();
  } catch (error) {
    console.error("Authentication error:", error.message);
    res.status(401).json({ message: "Invalid or expired token" });
  }
};

// Authorization middleware for admin role
const authorizeAdmin = async (req, res, next) => {
  try {
    const user = await User.findById(req.userId); // Fetch user by ID
    if (!user || user.role.toLowerCase() !== "admin") {
      return res.status(403).json({ message: "Admin access required" });
    }
    next();
  } catch (error) {
    console.error("Authorization error:", error.message);
    res.status(500).json({ message: "Error verifying admin status" });
  }
};

// Middleware for promoting a user to admin
const promoteToAdmin = async (req, res) => {
  try {
    const { userId } = req.body; // ID of the user to promote
    const userToPromote = await User.findById(userId);

    if (!userToPromote) {
      return res.status(404).json({ message: "User to promote not found" });
    }

    if (userToPromote.role.toLowerCase() === "admin") {
      return res.status(400).json({ message: "User is already an admin" });
    }

    userToPromote.role = "admin";
    await userToPromote.save();

    res.status(200).json({ message: "User successfully promoted to admin", user: userToPromote });
  } catch (error) {
    console.error("Error promoting user to admin:", error.message);
    res.status(500).json({ message: "Error promoting user to admin" });
  }
};

module.exports = { authenticate, authorizeAdmin, promoteToAdmin };
