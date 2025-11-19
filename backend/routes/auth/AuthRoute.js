const express = require("express");
const { login } = require("../../controllers/auth/AuthController");
const { verifyToken } = require("../../middleware/middleware");
const { resSuccess, resError } = require("../../helpers/sendResponse");
const router = express.Router();

router.post("/login", login);       // LOGIN
router.get("/verify", verifyToken, (req, res) => {
  try {
    // req.user sudah di-set di middleware verifyToken
    return resSuccess(res, "Token valid", { user: req.user });
  } catch (err) {
    console.error(err);
    return resError(res, "Token tidak valid", err.message, 401);
  }
});

module.exports = router;
