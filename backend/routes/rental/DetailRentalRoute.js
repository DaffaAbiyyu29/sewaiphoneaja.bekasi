const express = require("express");
const router = express.Router();
const DetailController = require("../../controllers/rental/DetailRentalController");

router.post("/", DetailController.createDetail);
router.get("/", DetailController.getDetails);
router.get("/:detailId", DetailController.getDetailById);
router.put("/:detailId", DetailController.updateDetail);
router.delete("/:detailId", DetailController.deleteDetail);

module.exports = router;
