const express = require("express");
const router = express.Router();
const {
  createDetail,
  //   getDetails,
  getDetailById,
  deleteDetail,
  updateDetail,
} = require("../../controllers/rental/DetailRentalController");
const { verifyToken } = require("../../middleware/middleware");

router.post("/", createDetail);
// router.get("/", verifyToken, getDetails);
router.get("/:detailId", verifyToken, getDetailById);
router.put("/:detailId", verifyToken, updateDetail);
router.delete("/:detailId", verifyToken, deleteDetail);

module.exports = router;
