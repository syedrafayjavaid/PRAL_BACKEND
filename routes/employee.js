const express = require("express");
const router = express.Router();

const {
  getEmployees,
  createEmployee,
  getEmployee,
  updateEmployee,
  deleteEmployee,
  searchFilters,
  getEmployProductsCurrentDetails



} = require("../controllers/employee");
router.route("/").get(getEmployees).post(createEmployee);
router.route("/search").post(searchFilters);
router.route("/currentProducts/:id").post(getEmployProductsCurrentDetails);
router.route("/:id").get(getEmployee).delete(deleteEmployee).put(updateEmployee);

module.exports = router;
