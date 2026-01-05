const express = require("express");
const router = express.Router();
const {
  createUser,
  getUsers,
  getUserById,
  updateUser,
  deleteUser,
} = require("../../controllers/user/UserController");
const { uploadPhoto } = require("../../middleware/upload");

router.post("/", uploadPhoto, createUser);
router.get("/", getUsers);
router.get("/:nik", getUserById);
router.put("/:nik", uploadPhoto, updateUser);
router.delete("/:nik", deleteUser);

module.exports = router;
