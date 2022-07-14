const express = require("express");
const router = express.Router();

const {
    getAllWings, getDepartmentWings, createWing, updateWing, deleteWing
} = require("../controllers/wing");

router.route("/").get(getAllWings).post(createWing);
router.route("/:id").get(getDepartmentWings).delete(deleteWing).put(updateWing);

module.exports = router;
