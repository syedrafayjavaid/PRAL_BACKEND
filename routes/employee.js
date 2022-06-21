const express = require("express");
const router = express.Router();

const {
  getEmployees,
  createEmployee,
  getEmployee,
  updateEmployee,
  deleteEmployee,
} = require("../controllers/employee");

router.route("/").get(getEmployees).post(createEmployee);
router
  .route("/:id")
  .get(getEmployee)
  .delete(deleteEmployee)
  .put(updateEmployee);

module.exports = router;
