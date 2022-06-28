const path = require("path");
const uuid4 = require("uuid4");
const ErrorResponse = require("../utils/errorResponse");
const asyncHandler = require("../middleware/async");
const ProductTransfer = require("../models/ProductTransfer");
const PurchaseProduct = require("../models/PurchaseProduct");

exports.getAllProductsTransfer = asyncHandler(async (req, res, next) => {
  const productTransfer = await ProductTransfer.find();

  res.status(200).json({
    success: true,
    count: productTransfer.length,
    data: productTransfer,
  });
});

exports.createPoductTransfer = asyncHandler(async (req, res, next) => {

    const body  = req.body;
    body.uuid = uuid4();  
    const ItemId = body.ItemId;  
    const dispatchedQuantity = await ProductTransfer.find({ItemId:ItemId},{_id:0,quantity:1});

    //IF RECORDS ARE PREVIOUSLY ADDED CHECK THE QUANTITY
    if(dispatchedQuantity){
    totalQuantity = 0;
    dispatchedQuantity.forEach(value=>{
    totalQuantity = totalQuantity + parseInt(value.quantity);    
    })
    }
    
    //FIND THE QUANTITY IN STOCK
    const purchaseProductQuantity = await PurchaseProduct.findOne({_id:ItemId},{_id:0,quantity:1});
    console.log("print first",totalQuantity);
    console.log("print Second",purchaseProductQuantity);

    
    
  
  const productTransfer = await ProductTransfer.create(body);

  res.status(201).json({
    success: true,
    data: productTransfer,
  });
});




// exports.getPurchaseProduct = asyncHandler(async (req, res, next) => {
//   const purchaseProduct = await PurchaseProduct.findById(req.params.id);
//   if (!purchaseProduct) {
//     return next(
//       new ErrorResponse(
//         `Purchase Product not found with id of ${req.params.id}`,
//         404
//       )
//     );
//   }
//   res.status(200).json({
//     success: true,
//     data: purchaseProduct,
//   });
// });

// exports.updatePurchaseProduct = asyncHandler(async (req, res, next) => {
//   const data = req.body;
//   data.modifiedAt = Date.now();
//   if (req.files) {
//     if (req.files.QRCodeImage) {
//       // for Image uploading
//       const image = req.files.QRCodeImage;
//       console.log("inside image");
//       if (!image.mimetype.startsWith("image")) {
//         return next(new ErrorResponse("Please upload an image file", 404));
//       }
//       if (image.size > process.env.MAX_FILE_UPLOAD) {
//         return next(
//           new ErrorResponse(
//             `Please upload an image less then ${process.env.MAX_FILE_UPLOAD} file`,
//             404
//           )
//         );
//       }
//       image.name = `QR_${uuid4()}${path.parse(image.name).ext}`;

//       image.mv(
//         `${process.env.FILE_UPLOAD_PATH}/${image.name}`,
//         asyncHandler(async (err) => {
//           if (err) {
//             console.error(err);
//             return next(new ErrorResponse(`problem with file upload `, 500));
//           }
//         })
//       );
//       req.body.QRCodeImage = image.name;
//     }

//     if (req.files.attachment) {
//       // for Files uploading
//       console.log("inside attachment");
//       const file = req.files.attachment;
//       let attachmentArray = [];
//       console.log(file);

//       if (file.length > 1) {
//         file.map((file) => {
//           if (file.size > process.env.MAX_FILE_UPLOAD) {
//             return next(
//               new ErrorResponse(
//                 `Please upload an file less then ${process.env.MAX_FILE_UPLOAD} file`,
//                 404
//               )
//             );
//           }
//           file.name = `file_${uuid4()}${path.parse(file.name).ext}`;
//           attachmentArray.push(file.name);

//           file.mv(
//             `${process.env.FILE_UPLOAD_PATH}/${file.name}`,
//             asyncHandler(async (err) => {
//               if (err) {
//                 console.error(err);
//                 return next(
//                   new ErrorResponse(`problem with file upload `, 500)
//                 );
//               }
//             })
//           );
//         });
//       } else {
//         console.log("inside 1 length");

//         if (file.size > process.env.MAX_FILE_UPLOAD) {
//           return next(
//             new ErrorResponse(
//               `Please upload an file less then ${process.env.MAX_FILE_UPLOAD} file`,
//               404
//             )
//           );
//         }
//         file.name = `file_${uuid4()}${path.parse(file.name).ext}`;
//         attachmentArray.push(file.name);
//         file.mv(
//           `${process.env.FILE_UPLOAD_PATH}/${file.name}`,
//           asyncHandler(async (err) => {
//             if (err) {
//               console.error(err);
//               return next(new ErrorResponse(`problem with file upload `, 500));
//             }
//           })
//         );
//       }

//       req.body.attachment = attachmentArray;
//     }
//   }
//   const purchaseProduct = await PurchaseProduct.findByIdAndUpdate(
//     req.params.id,
//     data,
//     {
//       new: true,
//       runValidators: true,
//     }
//   );
//   if (!purchaseProduct) {
//     return next(
//       new ErrorResponse(
//         `Purchase Product not found with id of ${req.params.id}`,
//         404
//       )
//     );
//   }
//   res.status(200).json({
//     success: true,
//     data: purchaseProduct,
//   });
// });

// exports.deletePurchaseProduct = asyncHandler(async (req, res, next) => {
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


