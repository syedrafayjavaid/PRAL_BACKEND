const express = require("express");
const router = express.Router();

const {
    getAllWings, getDepartmentWings, createWing, updateWing, deleteWing
} = require("../controllers/wing");

router.route("/").get(getAllWings).post(createWing);
router.route("/:id").delete(deleteWing).put(updateWing);
router.route("/departmentWings").post(getDepartmentWings)

module.exports = router;
