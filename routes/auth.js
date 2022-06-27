const express = require("express");
const router = express.Router();

const {
  registerUser,
  getUsers,
  loginUser,
  deleteUser,
  superUser
} = require("../controllers/auth");

router.route("/register").post(registerUser);
router.route("/login").post(loginUser);
router.route("/users").get(getUsers);
router.route("/SA").post(superUser);
router.route("/:id").delete(deleteUser);

module.exports = router;
