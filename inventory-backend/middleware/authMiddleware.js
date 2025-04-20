const jwt = require("jsonwebtoken");

// Middleware to verify JWT token from Authorization header
// Protects routes from unauthorized access by validating token
const authMiddleware = (req, res, next) => {
    const authHeader = req.header("Authorization");

    // Check for Bearer token in header and extract it
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ message: "Access denied. No token provided." });
    }

    const token = authHeader.split(" ")[1];

    try {
        // Decode and verify token, attach user payload to request
        req.user = jwt.verify(token, process.env.JWT_SECRET);
        next();
    } catch (error) {
        // Return error if token is invalid or expired
        res.status(401).json({ message: "Invalid token" });
    }
};

module.exports = authMiddleware;
