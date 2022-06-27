const path = require("path");
const uuid4 = require("uuid4");
const ErrorResponse = require("../utils/errorResponse");
const asyncHandler = require("../middleware/async");
const Office = require("../models/Office");

exports.getOffices = asyncHandler(async (req, res, next) => {
  const office = await Office.find();

  res.status(200).json({
    success: true,
    count: office.length,
    data: office,
  });
});

exports.createOffice = asyncHandler(async (req, res, next) => {
  const getLastOffice = await Office.find({}).sort({ _id: -1 }).limit(1);

  if (!getLastOffice.length) {
    req.body.officeId = 1;
  } else {
    const newOffice = parseInt(getLastOffice[0].officetId) + 1;
    req.body.officetId = newOffice;
  }

  // for file uploading
  if (!req.files) {
    req.body.photo = "no-image";
    // return next(new ErrorResponse("Please upload a file", 404));
  } else {
    const file = req.files.photo;
    if (!file.mimetype.startsWith("image")) {
      return next(new ErrorResponse("Please upload an image file", 404));
    }
    if (file.size > process.env.MAX_FILE_UPLOAD) {
      return next(
        new ErrorResponse(
          `Please upload an image less then ${process.env.MAX_FILE_UPLOAD} file`,
          404
        )
      );
    }
    file.name = `photo_${uuid4()}${path.parse(file.name).ext}`;

    file.mv(
      `${process.env.FILE_UPLOAD_PATH}/${file.name}`,
      asyncHandler(async (err) => {
        if (err) {
          console.error(err);
          return next(new ErrorResponse(`problem with file upload `, 500));
        }
      })
    );
    req.body.photo = file.name;
  }

  const office = await Office.create(req.body);
  res.status(201).json({
    success: true,
    data: office,
  });
});

exports.getOffice = asyncHandler(async (req, res, next) => {
  const office = await Office.findById(req.params.id);
  if (!office) {
    return next(
      new ErrorResponse(`Office not found with id of ${req.params.id}`, 404)
    );
  }
  res.status(200).json({
    success: true,
    data: office,
  });
});

exports.updateOffice = asyncHandler(async (req, res, next) => {
  const data = req.body;
  data.modifiedAt = Date.now();

  // for file uploading
  if (req.files) {
    const file = req.files.photo;
    if (!file.mimetype.startsWith("image")) {
      return next(new ErrorResponse("Please upload an image file", 404));
    }
    if (file.size > process.env.MAX_FILE_UPLOAD) {
      return next(
        new ErrorResponse(
          `Please upload an image less then ${process.env.MAX_FILE_UPLOAD} file`,
          404
        )
      );
    }
    file.name = `photo_${uuid4()}${path.parse(file.name).ext}`;

    file.mv(
      `${process.env.FILE_UPLOAD_PATH}/${file.name}`,
      asyncHandler(async (err) => {
        if (err) {
          console.error(err);
          return next(new ErrorResponse(`problem with file upload `, 500));
        }
      })
    );
    req.body.photo = file.name;
  }

  const office = await Office.findByIdAndUpdate(req.params.id, data, {
    new: true,
    runValidators: true,
  });
  if (!office) {
    return next(
      new ErrorResponse(`Office not found with id of ${req.params.id}`, 404)
    );
  }
  res.status(200).json({
    success: true,
    data: office,
  });
});

exports.deleteOffice = asyncHandler(async (req, res, next) => {
  const office = await Office.findByIdAndDelete(req.params.id);
  if (!office) {
    return next(
      new ErrorResponse(`Office not found with id of ${req.params.id}`, 404)
    );
  }
  res.status(201).json({
    success: true,
    msg: `Office deleted with id: ${req.params.id}`,
  });
});
