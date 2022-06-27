const ErrorResponse = require("../utils/errorResponse");
const asyncHandler = require("../middleware/async");
const User = require("../models/User");
const uuid = require("uuid4");

exports.getUsers = asyncHandler(async (req, res, next) => {
  console.log("Get All users is claaed");
  const users = await User.find({});

  res.status(200).json({
    success: true,
    count: users.length,
    data: users,
  });
});

exports.registerUser = asyncHandler(async (req, res, next) => {
  const getLastUser = await User.find({}).sort({ employeeId: -1 }).limit(1);

  let employeeId;
  if (!getLastUser.length) {
    employeeId = 1;
  } else {
    const newUser = parseInt(getLastUser[0].employeeId) + 1;
    employeeId = newUser;
  }

  const { userName, email, password, role } = req.body;
  const user = await User.create({
    userName,
    email,
    password,
    role,
    employeeId,
  });

  // JWT token
  sendTokenResponse(user, 200, res);
});

exports.loginUser = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  // validate eamil and password
  if (!email || !password) {
    return next(
      new ErrorResponse(`Please provide and email and passowrd`, 400)
    );
  }
  const user = await User.findOne({ email }).select("+password");
  if (!user) {
    return next(new ErrorResponse(`Invalid credentials`, 401));
  }

  const isMatch = await user.matchPassword(password);
  if (!isMatch) {
    return next(new ErrorResponse(`Invalid credentials`, 401));
  }

  // JWT token
  sendTokenResponse(user, 200, res);
});

exports.deleteUser = asyncHandler(async (req, res, next) => {
  const user = await User.findByIdAndDelete(req.params.id);
  if (!user) {
    return next(
      new ErrorResponse(`User not found with id of ${req.params.id}`, 404)
    );
  }
  res.status(201).json({
    success: true,
    msg: `User deleted with id: ${req.params.id}`,
  });
});

exports.superUser = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  // validate eamil and password
  if (!email || !password) {
    return next(
      new ErrorResponse(`Please provide and email and passowrd`, 400)
    );
  }
  const user = await User.findOne({ email }).select("+password");
  if (!user) {
    return next(new ErrorResponse(`Invalid credentials`, 401));
  }

  const isMatch = await user.matchPassword(password);
  if (!isMatch) {
    return next(new ErrorResponse(`Invalid credentials`, 401));
  }
  else if (user.role === 'SA' || user.email === 'pralSA@gmail.com') {

    res.status(201).json({
      success: true,
      grantAccess: true,
    })
  }

});




const sendTokenResponse = (user, statusCode, res) => {
  const token = user.getSignedJwtToken();
  const options = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
  };

  res.status(statusCode).cookie("token", token, options).json({
    success: true,
    token,
    data: user,
  });
};
