const ErrorResponse = require("../utils/errorResponse");
const asyncHandler = require("../middleware/async");
const Wing = require("../models/Wing");

exports.getAllWings = asyncHandler(async (req, res, next) => {
  const wing = await Wing.find();
  res.status(200).json({
    success: true,
    count: wing.length,
    data: wing,
  });
});

exports.createWing = asyncHandler(async (req, res, next) => {
  // getting last entered wing
  const getLatestWings = await Wing.find({}).sort({ _id: -1 }).limit(1);

  if (!getLatestWings.length) {
    req.body.DepartmentId = 1;
  } else {
    const newWingId = parseInt(getLatestWings[0].wingId) + 1;
    req.body.wingId = newWingId;
  }

  const wing = await Wing.create(req.body);
  res.status(200).json({
    success: true,
    data: wing,
  });
});

exports.getDepartmentWings = asyncHandler(async (req, res, next) => {


  const department = req.body.departmentId;

  const wing = await Wing.find({ department });
  if (!wing) {
    return next(
      new ErrorResponse(`Wing not found for the Deparmnet  id of ${req.params.id}`, 404)
    );
  }
  res.status(200).json({
    success: true,
    data: wing,
  });
});

exports.updateWing = asyncHandler(async (req, res, next) => {
  const data = req.body;
  data.modifiedAt = Date.now();

  const wing = await Wing.findByIdAndUpdate(req.params.id, data, {
    new: true,
    runValidators: true,
  });
  if (!wing) {
    return next(
      new ErrorResponse(`Wing not found with id of ${req.params.id}`, 404)
    );
  }
  res.status(200).json({
    success: true,
    data: wing,
  });
});

exports.deleteWing = asyncHandler(async (req, res, next) => {
  const wing = await Wing.findByIdAndDelete(req.params.id);
  if (!wing) {
    return next(
      new ErrorResponse(`Department not found with id of ${req.params.id}`, 404)
    );
  }
  res.status(201).json({
    success: true,
    msg: `Wing deleted with id: ${req.params.id}`,
  });
});
