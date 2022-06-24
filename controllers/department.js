const path = require("path");
const uuid4 = require("uuid4");
const ErrorResponse = require("../utils/errorResponse");
const asyncHandler = require("../middleware/async");
const Department = require("../models/Department");

exports.getDepartments = asyncHandler(async (req, res, next) => {
  const Department = await Department.find();
  res.status(200).json({
    success: true,
    count: Department.length,
    data: Department,
  });
});

exports.createDepartment = asyncHandler(async (req, res, next) => {
  // getting last entered category
  const getLatestDepartment = await Department.find({}).sort({ _id: -1 }).limit(1);

  if (!getLatestDepartment.length) {
    req.body.DepartmentId = 1;
  } else {
    const newDepartmentId = getLatestDepartment[0].DepartmentId + 1;
    req.body.DepartmentId = newDepartmentId;
  }

  const Department = await Department.create(req.body);
  res.status(200).json({
    success: true,
    data: Department,
  });
});

exports.getDepartment = asyncHandler(async (req, res, next) => {
  const Department = await Department.findById(req.params.id);
  if (!Department) {
    return next(
      new ErrorResponse(`Department not found with id of ${req.params.id}`, 404)
    );
  }
  res.status(200).json({
    success: true,
    data: Department,
  });
});

exports.updateDepartment = asyncHandler(async (req, res, next) => {
  const data = req.body;
  data.modifiedAt = Date.now();

  const Department = await Department.findByIdAndUpdate(req.params.id, data, {
    new: true,
    runValidators: true,
  });
  if (!Department) {
    return next(
      new ErrorResponse(`Department not found with id of ${req.params.id}`, 404)
    );
  }
  res.status(200).json({
    success: true,
    data: Department,
  });
});

exports.deleteDepartment = asyncHandler(async (req, res, next) => {
  const Department = await Department.findByIdAndDelete(req.params.id);
  if (!Department) {
    return next(
      new ErrorResponse(`Department not found with id of ${req.params.id}`, 404)
    );
  }
  res.status(201).json({
    success: true,
    msg: `Department deleted with id: ${req.params.id}`,
  });
});
