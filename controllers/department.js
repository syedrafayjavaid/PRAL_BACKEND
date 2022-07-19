const path = require("path");
const uuid4 = require("uuid4");
const ErrorResponse = require("../utils/errorResponse");
const asyncHandler = require("../middleware/async");
const Department = require("../models/Department");
const Wing = require("../models/Wing");
const { default: mongoose } = require("mongoose");


exports.getDepartments = asyncHandler(async (req, res, next) => {
  const department = await Department.find();
  res.status(200).json({
    success: true,
    count: department.length,
    data: department,
  });
});

exports.createDepartment = asyncHandler(async (req, res, next) => {
  // getting last entered category
  const getLatestDepartment = await Department.find({}).sort({ _id: -1 }).limit(1);

  if (!getLatestDepartment.length) {
    req.body.DepartmentId = 1;
  } else {
    const newDepartmentId = parseInt(getLatestDepartment[0].DepartmentId) + 1;
    req.body.DepartmentId = newDepartmentId;
  }

  const department = await Department.create(req.body);
  res.status(200).json({
    success: true,
    data: department,
  });
});

exports.getDepartment = asyncHandler(async (req, res, next) => {
  const department = await Department.findById(req.params.id);
  if (!department) {
    return next(
      new ErrorResponse(`Department not found with id of ${req.params.id}`, 404)
    );
  }
  res.status(200).json({
    success: true,
    data: department,
  });
});

exports.updateDepartment = asyncHandler(async (req, res, next) => {
  const data = req.body;
  data.modifiedAt = Date.now();

  const department = await Department.findByIdAndUpdate(req.params.id, data, {
    new: true,
    runValidators: true,
  });
  if (!department) {
    return next(
      new ErrorResponse(`Department not found with id of ${req.params.id}`, 404)
    );
  }
  res.status(200).json({
    success: true,
    data: department,
  });
});

exports.deleteDepartment = asyncHandler(async (req, res, next) => {
  const department = await Department.findByIdAndDelete(req.params.id);
  if (!department) {
    return next(
      new ErrorResponse(`Department not found with id of ${req.params.id}`, 404)
    );
  }
  res.status(201).json({
    success: true,
    msg: `Department deleted with id: ${req.params.id}`,
  });
});


exports.searchDepartment = asyncHandler(async (req, res, next) => {

  console.log("Yes i am getting called  ");

  // MAKING VARIABLES NEEDED
  const departmentId = req.body.departmentId;
  const wingName = req.body.wingName;


  const query = {};

  // MAKING A QUERY
  if (departmentId !== "") {
    query.department = departmentId;
  }
  if (wingName !== "") {
    query.name = wingName;
  }
  
  
  console.log("The query has", query);

  //FINDING THE RESULTS AGAINTS QUERY
  const result = await Wing.aggregate([
    {
      $match: query
    }
    ,
    {
      $lookup: {
        from: "departments",
        localField: "department",
        foreignField: "_id",
        as: "department"
      }
    },
    {
      $project:
       {
        departments : "$department"
      }
    }

  ])


  
  if (!result.length) {
    return next(
      new ErrorResponse(
        `No Results found`,
        404
      )
    );
  }
  res.status(201).json({
    success: true,
    count: result.length,
    data: result,
  });



});
