const jwt = require("jsonwebtoken");

exports.auth = (req, res, next) => {
  const token = req.header("Authorization")?.replace("Bearer ", "");

  if (!token) {
    console.log("❌ No token found in Authorization header");
    return res.status(401).json({
      success: false,
      message: "No token, authorization denied.",
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("✅ Token verified for user:", decoded.id);
    req.user = decoded;
    next();
  } catch (error) {
    console.log("❌ Token verification failed:", error.message);
    res.status(401).json({
      success: false,
      message: "Token is not valid.",
    });
  }
};
