const express = require("express");
const router = express.Router();
const RentalController = require("../../controllers/rental/RentalController");

router.post("/", RentalController.createRent);
router.get("/", RentalController.getRents);
router.get("/:rentId", RentalController.getRentById);
router.put("/:rentId", RentalController.updateRent);
router.put("/:rentId/approve", RentalController.approveRent);
router.put("/:rentId/reject", RentalController.rejectRent);
router.delete("/:rentId", RentalController.deleteRent);

module.exports = router;
