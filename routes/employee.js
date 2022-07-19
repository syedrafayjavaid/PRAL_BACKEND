const express = require("express");
const router = express.Router();

const {
  getEmployees,
  createEmployee,
  getEmployee,
  updateEmployee,
  deleteEmployee,
  searchFilters,
  getEmployProductsCurrentDetails,
  designationSuggestion

} = require("../controllers/employee");
router.route("/").get(getEmployees).post(createEmployee);
router.route("/search").post(searchFilters);
router.route("/designationSuggestions").post(designationSuggestion);
router.route("/currentProducts/:id").get(getEmployProductsCurrentDetails);
router.route("/:id").get(getEmployee).delete(deleteEmployee).put(updateEmployee);

module.exports = router;
