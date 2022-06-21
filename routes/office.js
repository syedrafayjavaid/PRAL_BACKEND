const express = require("express");
const router = express.Router();

const {
  getOffices,
  createOffice,
  getOffice,
  updateOffice,
  deleteOffice,
} = require("../controllers/office");

router.route("/").get(getOffices).post(createOffice);
router.route("/:id").get(getOffice).delete(deleteOffice).put(updateOffice);

module.exports = router;
