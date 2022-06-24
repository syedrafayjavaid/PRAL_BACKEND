const express = require("express");
const router = express.Router();

const {
  getDepartments,
  createDepartment,
  getDepartment,
  updateDepartment,
  deleteDepartment,
} = require("../controllers/department");

router.route("/").get(getDepartments).post(createDepartment);
router.route("/:id").get(getDepartment).delete(deleteDepartment).put(updateDepartment);

module.exports = router;
