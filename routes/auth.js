const express = require("express");
const router = express.Router();

const {
  registerUser,
  getUsers,
  loginUser,
  deleteUser,
} = require("../controllers/auth");

router.route("/register").post(registerUser);
router.route("/login").post(loginUser);
router.route("/allUsers").get(getUsers);
router.route("/:id").delete(deleteUser);

module.exports = router;
