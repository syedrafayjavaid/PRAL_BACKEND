const path = require("path");
const uuid4 = require("uuid4");
const ErrorResponse = require("../utils/errorResponse");
const asyncHandler = require("../middleware/async");
const PurchaseProduct = require("../models/PurchaseProduct");
const Product = require("../models/Product");

exports.getAllPurchaseProducts = asyncHandler(async (req, res, next) => {
  const purchaseProduct = await PurchaseProduct.find();

  res.status(200).json({
    success: true,
    count: purchaseProduct.length,
    data: purchaseProduct,
  });
});

exports.createPurchaseProduct = asyncHandler(async (req, res, next) => {
  // console.log("Purcahase Prod incomming req", req.body);

  const getLastPurchaseProduct = await PurchaseProduct.find({})
    .sort({ _id: -1 })
    .limit(1);

  if (!getLastPurchaseProduct.length) {
    req.body.purchaseProductId = 1;
  } else {
    const newInStock = parseInt(getLastPurchaseProduct[0].purchaseProductId) + 1;
    req.body.purchaseProductId = newInStock;
  }

  if (req.files) {
    if (!req.files.QRCodeImage) {
      req.body.QRCodeImage = "no-QR";
      // return next(new ErrorResponse("Please upload a file", 404));
    } else {
      // for Image uploading
      const image = req.files.QRCodeImage;
      console.log("what is inside", image);
      if (!image.mimetype.startsWith("image")) {
        return next(new ErrorResponse("Please upload an image file", 404));
      }
      if (image.size > process.env.MAX_FILE_UPLOAD) {
        return next(
          new ErrorResponse(
            `Please upload an image less then ${process.env.MAX_FILE_UPLOAD} file`,
            404
          )
        );
      }
      image.name = `QR_${uuid4()}${path.parse(image.name).ext}`;

      image.mv(
        `${process.env.FILE_UPLOAD_PATH}/${image.name}`,
        asyncHandler(async (err) => {
          if (err) {
            console.error(err);
            return next(new ErrorResponse(`problem with file upload `, 500));
          }
        })
      );
      req.body.QRCodeImage = image.name;
    }

    if (!req.files.attachment) {
      req.body.attachment = "no-attachment";
    } else {
      // for Files uploading
      const file = req.files.attachment;
      let attachmentArray = [];
      if (file.length === 1) {
        if (file.size > process.env.MAX_FILE_UPLOAD) {
          return next(
            new ErrorResponse(
              `Please upload an file less then ${process.env.MAX_FILE_UPLOAD} file`,
              404
            )
          );
        }
        file.name = `file_${uuid4()}${path.parse(file.name).ext}`;

        file.mv(
          `${process.env.FILE_UPLOAD_PATH}/${file.name}`,
          asyncHandler(async (err) => {
            if (err) {
              console.error(err);
              return next(new ErrorResponse(`problem with file upload `, 500));
            }
          })
        );
      } else if (file.length > 1) {
        file.map((file) => {
          if (file.size > process.env.MAX_FILE_UPLOAD) {
            return next(
              new ErrorResponse(
                `Please upload an file less then ${process.env.MAX_FILE_UPLOAD} file`,
                404
              )
            );
          }
          file.name = `file_${uuid4()}${path.parse(file.name).ext}`;
          attachmentArray.push(file.name);

          file.mv(
            `${process.env.FILE_UPLOAD_PATH}/${file.name}`,
            asyncHandler(async (err) => {
              if (err) {
                console.error(err);
                return next(
                  new ErrorResponse(`problem with file upload `, 500)
                );
              }
            })
          );
        });
      }

      req.body.attachment = attachmentArray;
    }
  }

  const records = await PurchaseProduct.find({ productId: req.body.productId });
  let sum = 0;
  let quantity = 0;
  let averagePrice = 0;

  if (records) {
    records.map((data) => {
      sum = sum + data.price;
      quantity = quantity + data.quantity;
    });
    averagePrice = sum / records.length;

    if (isNaN(averagePrice)) {
      averagePrice = 0;
    }

    console.log("Avrerage price", averagePrice);
  }

  const productBody = {
    modifiedAt: Date.now(),
    averagePrice: averagePrice,
    quantity: quantity,
  };

  const product = await Product.findByIdAndUpdate(
    { _id: req.body.productId },
    productBody,
    {
      new: true,
      runValidators: true,
    }
  );
  const body = req.body;
  body.quantity = quantity;
  const purchaseProduct = await PurchaseProduct.create(body);

  res.status(201).json({
    success: true,
    data: purchaseProduct,
  });
});

exports.getPurchaseProduct = asyncHandler(async (req, res, next) => {
  const purchaseProduct = await PurchaseProduct.findById(req.params.id);
  if (!purchaseProduct) {
    return next(
      new ErrorResponse(
        `Purchase Product not found with id of ${req.params.id}`,
        404
      )
    );
  }
  res.status(200).json({
    success: true,
    data: purchaseProduct,
  });
});

exports.updatePurchaseProduct = asyncHandler(async (req, res, next) => {
  const data = req.body;
  data.modifiedAt = Date.now();
  if (req.files) {
    if (req.files.QRCodeImage) {
      // for Image uploading
      const image = req.files.QRCodeImage;
      console.log("inside image");
      if (!image.mimetype.startsWith("image")) {
        return next(new ErrorResponse("Please upload an image file", 404));
      }
      if (image.size > process.env.MAX_FILE_UPLOAD) {
        return next(
          new ErrorResponse(
            `Please upload an image less then ${process.env.MAX_FILE_UPLOAD} file`,
            404
          )
        );
      }
      image.name = `QR_${uuid4()}${path.parse(image.name).ext}`;

      image.mv(
        `${process.env.FILE_UPLOAD_PATH}/${image.name}`,
        asyncHandler(async (err) => {
          if (err) {
            console.error(err);
            return next(new ErrorResponse(`problem with file upload `, 500));
          }
        })
      );
      req.body.QRCodeImage = image.name;
    }

    if (req.files.attachment) {
      // for Files uploading
      console.log("inside attachment");
      const file = req.files.attachment;
      let attachmentArray = [];
      console.log(file);

      if (file.length > 1) {
        file.map((file) => {
          if (file.size > process.env.MAX_FILE_UPLOAD) {
            return next(
              new ErrorResponse(
                `Please upload an file less then ${process.env.MAX_FILE_UPLOAD} file`,
                404
              )
            );
          }
          file.name = `file_${uuid4()}${path.parse(file.name).ext}`;
          attachmentArray.push(file.name);

          file.mv(
            `${process.env.FILE_UPLOAD_PATH}/${file.name}`,
            asyncHandler(async (err) => {
              if (err) {
                console.error(err);
                return next(
                  new ErrorResponse(`problem with file upload `, 500)
                );
              }
            })
          );
        });
      } else {
        console.log("inside 1 length");

        if (file.size > process.env.MAX_FILE_UPLOAD) {
          return next(
            new ErrorResponse(
              `Please upload an file less then ${process.env.MAX_FILE_UPLOAD} file`,
              404
            )
          );
        }
        file.name = `file_${uuid4()}${path.parse(file.name).ext}`;
        attachmentArray.push(file.name);
        file.mv(
          `${process.env.FILE_UPLOAD_PATH}/${file.name}`,
          asyncHandler(async (err) => {
            if (err) {
              console.error(err);
              return next(new ErrorResponse(`problem with file upload `, 500));
            }
          })
        );
      }

      req.body.attachment = attachmentArray;
    }
  }
  const purchaseProduct = await PurchaseProduct.findByIdAndUpdate(
    req.params.id,
    data,
    {
      new: true,
      runValidators: true,
    }
  );
  if (!purchaseProduct) {
    return next(
      new ErrorResponse(
        `Purchase Product not found with id of ${req.params.id}`,
        404
      )
    );
  }
  res.status(200).json({
    success: true,
    data: purchaseProduct,
  });
});

























exports.deletePurchaseProduct = asyncHandler(async (req, res, next) => {
  const purchaseProduct = await PurchaseProduct.findByIdAndDelete(
    req.params.id
  );
  if (!purchaseProduct) {
    return next(
      new ErrorResponse(
        `Purchase Product not found with id of ${req.params.id}`,
        404
      )
    );
  }
  res.status(201).json({
    success: true,
    msg: `Purchase Product deleted with id: ${req.params.id}`,
  });
});


// exports.searchFilters = asyncHandler(async (req, res, next) => {
//   const purchaseProduct = await PurchaseProduct.findByIdAndDelete(
//     req.params.id
//   );
//   if (!purchaseProduct) {
//     return next(
//       new ErrorResponse(
//         `Purchase Product not found with id of ${req.params.id}`,
//         404
//       )
//     );
//   }
//   res.status(201).json({
//     success: true,
//     msg: `Purchase Product deleted with id: ${req.params.id}`,
//   });
// });
