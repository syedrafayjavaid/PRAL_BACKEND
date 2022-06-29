const path = require("path");
const uuid4 = require("uuid4");
const ErrorResponse = require("../utils/errorResponse");
const asyncHandler = require("../middleware/async");
const ProductTransfer = require("../models/ProductTransfer");
const PurchaseProduct = require("../models/PurchaseProduct");
const { default: mongoose } = require("mongoose");

exports.getAllProductsTransfer = asyncHandler(async (req, res, next) => {
  const productTransfer = await ProductTransfer.find();
  res.status(200).json({
    success: true,
    count: productTransfer.length,
    data: productTransfer,
  });
});

exports.createPoductTransfer = asyncHandler(async (req, res, next) => {

  const body = req.body;
  body.uuid = uuid4();
  const ItemId = body.ItemId;
  // const dispatchedQuantity = await ProductTransfer.find({ ItemId: ItemId }, { _id: 0, quantity: 1 });

  // //IF RECORDS ARE PREVIOUSLY ADDED CHECK THE QUANTITY
  // if (dispatchedQuantity) {
  //   totalQuantity = 0;
  //   dispatchedQuantity.forEach(value => {
  //     totalQuantity = totalQuantity + parseInt(value.quantity);
  //   })
  // }

  // Getting all the unique ids
  const allUniqueIds = await ProductTransfer.aggregate([{ $group: { _id: "$uuid" } }])
  console.log("All unique uuids are ", allUniqueIds);

  // finding the quantity of lastly added record for each group id and getting sum
  const totalQuantity = 0;
  allUniqueIds.map(async (ids) => {
    const uuid = ids._id
    const [{ quantity }] = await ProductTransfer.find({ uuid: uuid }).sort({ createdAt: -1 }).limit(1);
    totalQuantity = totalQuantity + parseInt(quantity);
  })





  //FIND THE QUANTITY IN STOCK
  const { quantity } = await PurchaseProduct.findOne({ _id: ItemId }, { _id: 0, quantity: 1 });
  console.log("print first", totalQuantity);
  console.log("print Second", quantity);
  const sumQuantity = totalQuantity + parseInt(req.body.quantity);
  console.log("The totla sum of the qunatities", sumQuantity);

  // CHECKING IF THE ACTUAL QUANTITY EQUALS OR GREATER THEN SUM OF ALL QUANTITIES IS LESS THAN QUNATITY
  if (quantity >= sumQuantity) {

    const productTransfer = await ProductTransfer.create(body);
    res.status(201).json({
      success: true,
      data: productTransfer,
      message: "Product Transfered Successfully"
    });


  }
  else {

    return next(
      new ErrorResponse(
        `The quantity exceeds the item quantity available in store`,
        404
      )
    );


  }



});


exports.getProductsTransferDetails = asyncHandler(async (req, res, next) => {

  console.log("Incoming item id", req.body.ItemId);
  const ItemId = req.params.id;
  console.log("Incoming employ id", req.body.employId);

  const productTransfer = await ProductTransfer.find({ ItemId });
  res.status(200).json({
    success: true,
    count: productTransfer.length,
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

exports.updateProductTransfer = asyncHandler(async (req, res, next) => {


  const body = req.body;
  const ItemId = req.body.ItemId;
  const UUID = req.body.uuid;

  // Getting all the unique ids
  const allUniqueIds = await ProductTransfer.aggregate([{ $group: { _id: "$uuid" } }])
  console.log("All unique uuids are ", allUniqueIds);

  // finding the quantity of lastly added record for each group id and getting sum
  const totalQuantity = 0;
  allUniqueIds.map(async (ids) => {
    const uuid = ids._id
    const [{ quantity }] = await ProductTransfer.find({ uuid: uuid }).sort({ createdAt: -1 }).limit(1);
    totalQuantity = totalQuantity + parseInt(quantity);
  })


  //FIND THE QUANTITY IN STOCK
  const { quantity } = await PurchaseProduct.findOne({ _id: ItemId }, { _id: 0, quantity: 1 });
  console.log("print first", totalQuantity);
  console.log("print Second", quantity);
  const sumQuantity = totalQuantity + parseInt(req.body.quantity);
  console.log("The totla sum of the qunatities", sumQuantity);

  // CHECKING IF THE ACTUAL QUANTITY EQUALS OR GREATER THEN SUM OF ALL QUANTITIES IS LESS THAN QUNATITY
  if (quantity >= sumQuantity) {

    const productTransfer = await ProductTransfer.create(body);
    res.status(201).json({
      success: true,
      data: productTransfer,
      message: "Product Transfered Successfully"
    });


  }
  else {

    return next(
      new ErrorResponse(
        `The quantity exceeds the item quantity available in store`,
        404
      )
    );


  }






});

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


