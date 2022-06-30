const path = require("path");
const uuid4 = require("uuid4");
const ErrorResponse = require("../utils/errorResponse");
const asyncHandler = require("../middleware/async");
const ProductTransfer = require("../models/ProductTransfer");
const PurchaseProduct = require("../models/PurchaseProduct");
const Product = require("../models/Product");
const Employee = require("../models/Employee");

const { default: mongoose } = require("mongoose");
const { log } = require("console");

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


  // Getting all the unique ids
  const allUniqueIds = await ProductTransfer.aggregate([{ $group: { _id: "$uuid" } }])


  // finding the quantity of lastly added record for each group id and getting sum
  var totalQuantity = 0;
  allUniqueIds.map(async (ids) => {
    var uuid = ids._id
    var quantityFound = await ProductTransfer.find({ ItemId: ItemId, uuid: uuid }).sort({ createdAt: -1 }).limit(1);
    if (quantityFound.length > 0) {
      var [{ quantity }] = quantityFound;
      totalQuantity = totalQuantity + parseInt(quantity);
    }
  })




  //FIND THE QUANTITY IN STOCK
  const stockQuantityfound = await PurchaseProduct.findOne({ _id: ItemId }, { _id: 0, quantity: 1 });
  var stockQuantity = 0;
  var sumQuantity = 0;
  if (stockQuantityfound) {
    stockQuantity = stockQuantityfound.quantity;
    console.log("The quantity already assigned to users", totalQuantity);
    console.log("The Total Quantity that was in stock intially", stockQuantity);
    sumQuantity = totalQuantity + parseInt(req.body.quantity);
    console.log("The Sum of the quantity previously assigned and currently ordered", sumQuantity);
  }


  // CHECKING IF THE ACTUAL QUANTITY EQUALS OR GREATER THEN SUM OF ALL QUANTITIES IS LESS THAN QUNATITY
  if (stockQuantity >= sumQuantity) {

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

  const ItemId = req.params.id;
  var dataArray = [];
  var data = {};

  // Getting all differenr unique ids for the a specific item
  const allUniqueIds = await ProductTransfer.aggregate([{ $match: { ItemId: mongoose.Types.ObjectId(ItemId) } }, { $group: { _id: "$uuid" } }])

  if (allUniqueIds.length > 0) {

    // Getting the last id of the group
    const lastUUID = allUniqueIds[allUniqueIds.length - 1]._id

    console.log("The length of the object", allUniqueIds.length);

    // finding the quantity of lastly added record for each group id and getting sum
    var totalQuantity = 0;
    allUniqueIds.forEach(async ids => {
      var uuid = ids._id
      var quantityFound = await ProductTransfer.find({ ItemId: ItemId, uuid: uuid }).sort({ createdAt: -1 }).limit(1);

      if (quantityFound.length > 0) {

        var employId = quantityFound[0].employId;
        var productId = quantityFound[0].productId;
        var itemEntryId = quantityFound[0].ItemId;
        // console.log("The employ id has", employId);
        // console.log("The Product id has", productId);
        // console.log("The itemId id has", itemEntryId);
        var employDetails = await Employee.findOne({ _id: employId });
        // var itemDetails = await PurchaseProduct.findOne({ _id: itemEntryId });
        var productDetails = await Product.findOne({ _id: productId });



        if (employDetails) {
          data.employName = employDetails.name;
          data.employEmail = employDetails.emailAddress;
          data.EmployId = employDetails.employeeId;
        }
        if (productDetails) {
          data.ProductName = productDetails.name;
          data.ProductBrandName = productDetails.BrandName;
          data.ProductCategoryName = productDetails.categoryName;
          data.ProductModel = productDetails.model;
        }
        // if (itemDetails) {


        // }

        /// calculating the total quantity previously dispatched
        var [{ quantity }] = quantityFound;
        totalQuantity = totalQuantity + parseInt(quantity);
        // console.log("Quantity found has  ", quantityFound);
        // console.log("Data object has  ", data);



        // Merging the Record 

        data.quantity = quantityFound[0].quantity;
        data.EmployMId = quantityFound[0].employId;
        data.ProductMId = quantityFound[0].productId;
        data.ItemMID = quantityFound[0].ItemId;
        data.createdAt = quantityFound[0].createdAt;
        data.createdBy = quantityFound[0].createdBy;
        data.transferedTo = quantityFound[0].transferedTo;
        data.transferedFrom = quantityFound[0].transferedFrom;


        dataArray.push(data);


      }

      if (lastUUID === uuid) {

        //FIND THE QUANTITY IN STOCK
        const stockQuantityfound = await PurchaseProduct.findOne({ _id: ItemId }, { _id: 0, quantity: 1 });
        var stockQuantity = 0;
        var sumQuantity = 0;
        if (stockQuantityfound) {
          stockQuantity = stockQuantityfound.quantity;
          console.log("The quantity already assigned to users", totalQuantity);
          console.log("The Total Quantity that was in stock intially", stockQuantity);
        }

        const inStockQauntity = stockQuantity - totalQuantity;

        // sending response       
        res.status(201).json({
          success: true,
          inStockQauntity: inStockQauntity,
          data: dataArray,
          message: "Products fetched successfully"
        });



      }



      // else {

      //   return next(
      //     new ErrorResponse(
      //       `No Data found in the record`,
      //       404
      //     )
      //   );
      // }


    })

  }
  else {

    return next(
      new ErrorResponse(
        `No Data found in the record`,
        404
      )
    );

  }



});

exports.updateProductTransfer = asyncHandler(async (req, res, next) => {


  const body = req.body;
  const ItemId = body.ItemId;
  const UUID = body.uuid;

  // Getting all the unique ids
  const allUniqueIds = await ProductTransfer.aggregate([{ $group: { _id: "$uuid" } }])

  // finding the quantity of lastly added record for each group id and getting sum
  var totalQuantity = 0;
  allUniqueIds.map(async (ids) => {
    var uuid = ids._id
    var quantityFound = await ProductTransfer.find({ ItemId: ItemId, uuid: uuid }).sort({ createdAt: -1 }).limit(1);
    if (quantityFound.length > 0)
      var [{ quantity }] = quantityFound;
    if (UUID !== uuid) {
      totalQuantity = totalQuantity + parseInt(quantity);
    }

  })




  //FIND THE QUANTITY IN STOCK
  const stockQuantityfound = await PurchaseProduct.findOne({ _id: ItemId }, { _id: 0, quantity: 1 });
  var stockQuantity = 0;
  var sumQuantity = 0;
  if (stockQuantityfound) {
    stockQuantity = stockQuantityfound.quantity;
    console.log("The quantity already assigned to users", totalQuantity);
    console.log("The Total Quantity that was in stock intially", stockQuantity);
    sumQuantity = totalQuantity + parseInt(req.body.quantity);
    console.log("The Sum of the quantity previously assigned and currently ordered", sumQuantity);
  }


  // CHECKING IF THE ACTUAL QUANTITY EQUALS OR GREATER THEN SUM OF ALL QUANTITIES IS LESS THAN QUNATITY
  if (stockQuantity >= sumQuantity) {

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


