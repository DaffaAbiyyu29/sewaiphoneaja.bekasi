const express = require("express");
const router = express.Router();
const UserController = require("../../controllers/user/UserController");
const { uploadPhoto } = require("../../middleware/upload");

router.post("/", uploadPhoto, UserController.createUser);
router.get("/", UserController.getUsers);
router.get("/:nik", UserController.getUserById);
router.put("/:nik", uploadPhoto, UserController.updateUser);
router.delete("/:nik", UserController.deleteUser);

module.exports = router;
