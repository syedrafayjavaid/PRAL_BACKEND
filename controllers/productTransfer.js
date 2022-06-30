const path = require("path");
const uuid4 = require("uuid4");
const ErrorResponse = require("../utils/errorResponse");
const asyncHandler = require("../middleware/async");
const ProductTransfer = require("../models/ProductTransfer");
const PurchaseProduct = require("../models/PurchaseProduct");
const Product = require("../models/Product");
const Employee = require("../models/Employee");
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
  const employId = body.employId;

  const employeeDetails = await Employee.findOne({_id:employId});

  if(employeeDetails){
    body.employName = employeeDetails.name;
    body.employID = employeeDetails.employID;
  }

  // // Getting all the unique ids
  // const allUniqueIds = await ProductTransfer.aggregate([{ $group: { _id: "$uuid" } }])
  const allUniqueIds = await ProductTransfer.aggregate([{ $match: { ItemId: mongoose.Types.ObjectId(ItemId) } }, { $group: { _id: "$uuid" } }])



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


  // console.log("All unique ids",allUniqueIds);

  if (allUniqueIds.length > 0) {

    // Getting the last id of the group
    const lastUUID = allUniqueIds[allUniqueIds.length - 1]._id

    // console.log("The length of the object", allUniqueIds.length);

    // finding the quantity of lastly added record for each group id and getting sum
    var totalQuantity = 0;
    await Promise.all(allUniqueIds.map(async (ids) => {
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
        var itemDetails = await PurchaseProduct.findOne({ _id: itemEntryId });
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
        if (itemDetails) {
          data.price = itemDetails.price;
          data.srNo = itemDetails.srNo;
          data.tagNo = itemDetails.tagNo;
          data.QRCodeImage = itemDetails.QRCodeImage;
      }

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

      console.log("The data array has",dataArray);

      // if (lastUUID === uuid) {

        


      // }



      // else {

      //   return next(
      //     new ErrorResponse(
      //       `No Data found in the record`,
      //       404
      //     )
      //   );
      // }


    }))


    console.log("The final data array has",dataArray);
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
  else {

    return next(
      new ErrorResponse(
        `No Data found in the record`,
        404
      )
    );

  }



});



exports.modified = asyncHandler(async (req, res, next) => {

  const ItemId = req.params.id;
  const dataArray = [];
  const allUniqueIds = await ProductTransfer.aggregate([{ $match: { ItemId: mongoose.Types.ObjectId(ItemId) } }, { $group: { _id: "$uuid" } }])
  await Promise.all(  allUniqueIds.map(async (ids) => {
    var uuid = ids._id
    var quantityFound = await ProductTransfer.find({ ItemId: ItemId, uuid: uuid }).sort({ createdAt: -1 }).limit(1);
    console.log("single item has",quantityFound);
    dataArray.push(quantityFound);
    
  }))
console.log("The data array has",dataArray);
  // sending response       
  res.status(201).json({
    success: true,
    data: dataArray,
    message: "Products fetched successfully"
  });

});



exports.updateProductTransfer = asyncHandler(async (req, res, next) => {


  const body = req.body;
  const ItemId = body.ItemId;
  const UUID = body.uuid;

  // Getting all the unique ids
  // const allUniqueIds = await ProductTransfer.aggregate([{ $group: { _id: "$uuid" } }])
  const allUniqueIds = await ProductTransfer.aggregate([{ $match: { ItemId: mongoose.Types.ObjectId(ItemId) } }, { $group: { _id: "$uuid" } }])


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




exports.ProductTransfer = asyncHandler(async (req, res, next) => {


  // const body = req.body;
  // const ItemId = body.ItemId;
  // const UUID = body.uuid;

  // // Product Transfer incoming id
  // const _id = body._id;

  // // Finding the previous Purchase Product record
  // const PreviousRecord = await ProductTransfer.findById(_id);

  // if(PreviousRecord){


  //   if(PreviousRecord.quantity > req.body.quantity ){


  //     const quantityDifference = parseInt(PreviousRecord.quantity) - parseInt(req.body.quantity);


  //     // creating the new record in the previous employ Product history
  //     const previousData = {};
  //     previousData = body;
  //     previousData.quantity = quantityDifference;
  //     console.log("The Previous data has",previousData);
  //     const purchaseProduct = await PurchaseProduct.create(body);


  //     //
  //     const



    

  //   }

  // // console.log("The previous record has",PreviousRecord);

  // }






  // data ={};
  // data.status = "expired"
  // // Finding the last Product Transfer 
  // const lastProductTransfer = await ProductTransfer.findByIdAndUpdate(_id,data);

  // // console.log("THE PRODUCT HAS ",lastProductTransfer);










  // // Getting all the unique ids
  // const allUniqueIds = await ProductTransfer.aggregate([{ $group: { _id: "$uuid" } }])

  // // finding the quantity of lastly added record for each group id and getting sum
  // var totalQuantity = 0;
  // allUniqueIds.map(async (ids) => {
  //   var uuid = ids._id
  //   var quantityFound = await ProductTransfer.find({ ItemId: ItemId, uuid: uuid }).sort({ createdAt: -1 }).limit(1);
  //   if (quantityFound.length > 0)
  //     var [{ quantity }] = quantityFound;
  //   if (UUID !== uuid) {
  //     totalQuantity = totalQuantity + parseInt(quantity);
  //   }

  // })




  // //FIND THE QUANTITY IN STOCK
  // const stockQuantityfound = await PurchaseProduct.findOne({ _id: ItemId }, { _id: 0, quantity: 1 });
  // var stockQuantity = 0;
  // var sumQuantity = 0;
  // if (stockQuantityfound) {
  //   stockQuantity = stockQuantityfound.quantity;
  //   console.log("The quantity already assigned to users", totalQuantity);
  //   console.log("The Total Quantity that was in stock intially", stockQuantity);
  //   sumQuantity = totalQuantity + parseInt(req.body.quantity);
  //   console.log("The Sum of the quantity previously assigned and currently ordered", sumQuantity);
  // }


  // // CHECKING IF THE ACTUAL QUANTITY EQUALS OR GREATER THEN SUM OF ALL QUANTITIES IS LESS THAN QUNATITY
  // if (stockQuantity >= sumQuantity) {

  //   const productTransfer = await ProductTransfer.create(body);
  //   res.status(201).json({
  //     success: true,
  //     data: productTransfer,
  //     message: "Product Transfered Successfully"
  //   });


  // }
  // else {

  //   return next(
  //     new ErrorResponse(
  //       `The quantity exceeds the item quantity available in store`,
  //       404
  //     )
  //   );


  // }


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


