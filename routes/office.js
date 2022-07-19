const express = require("express");
const router = express.Router();

const {
  getOffices,
  createOffice,
  getOffice,
  updateOffice,
  deleteOffice,
  searchOffice,
  MultiSuggestion
} = require("../controllers/office");

router.route("/").get(getOffices).post(createOffice);
router.route("/:id").get(getOffice).delete(deleteOffice).put(updateOffice);
router.route("/searchOffice").post(searchOffice);
router.route("/multiSuggestion").post(MultiSuggestion);
module.exports = router;
