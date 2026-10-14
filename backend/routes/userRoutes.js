const express = require("express");
const router = express.Router();
const multer = require("multer");
const upload = multer({ dest: "uploads/" });
const { auth } = require("../middlewares/auth");
const {
  registerUser,
  loginUser,
  uploadProfilePic,
  getProfile,
  logoutUser,
} = require("../controllers/userController");

router.post("/signup", registerUser);
router.post("/login", loginUser);
router.get("/profile", auth, getProfile);
router.post("/upload-pic", auth, upload.single("profilePic"), uploadProfilePic);
router.get("/check-user", auth, getProfile);
router.post("/logout", logoutUser);

module.exports = router;
