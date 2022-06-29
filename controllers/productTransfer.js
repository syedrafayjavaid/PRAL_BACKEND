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


  // Getting all the unique ids
  const allUniqueIds = await ProductTransfer.aggregate([{ $group: { _id: "$uuid" } }])
  

     // finding the quantity of lastly added record for each group id and getting sum
    var totalQuantity = 0;
    allUniqueIds.map(async (ids) => {
    var uuid = ids._id
    var  quantityFound = await ProductTransfer.find({ItemId:ItemId, uuid: uuid }).sort({ createdAt: -1 }).limit(1);
    if(quantityFound.length>0){
      var  [{quantity}] = quantityFound;
      totalQuantity = totalQuantity + parseInt(quantity);
    } 
    })

  
 

  //FIND THE QUANTITY IN STOCK
  const  stockQuantityfound  = await PurchaseProduct.findOne({ _id: ItemId }, { _id: 0, quantity: 1 });
    var stockQuantity = 0;
    var sumQuantity = 0;
  if(stockQuantityfound){
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

  // Getting all differenr unique ids for the a specific item
  const allUniqueIds = await ProductTransfer.aggregate([ { $match : { ItemId : mongoose.Types.ObjectId(ItemId) } },{ $group: { _id: "$uuid" } } ])
  
  // console.log("AllItemTransfer Details is",allUniqueIds);

    // finding the quantity of lastly added record for each group id and getting sum
    var totalQuantity = 0;
    var data = [];
    allUniqueIds.map(async (ids) => {
    var uuid = ids._id
    var  quantityFound = await ProductTransfer.find({ItemId:ItemId, uuid: uuid }).sort({ createdAt: -1 }).limit(1);
    if(quantityFound.length>0){
      data.push(quantityFound);
    var employId = quantityFound[0].employId;
    var productId = quantityFound[0].productId;
    var itemEntryId = quantityFound[0].ItemId;
    // console.log("The employ id has",employId);
    // console.log("The Product id has",productId);
    // console.log("The itemId id has",itemEntryId);
    var employDetails = await Employee.findOne({_id:employId});
    var itemDetails = await PurchaseProduct.findOne({_id:itemEntryId});
    var productDetails = await Product.findOne({_id:productId});
    if(employDetails){
      console.log("This is the employDetails",quantityFound[0]);
      quantityFound.employDetails =employDetails ;
    }
    if(productDetails){
      console.log("This is the employDetails",employDetails);
      quantityFound.push(productDetails);

    }
    if(itemDetails){
      console.log("This is the itemDetails",itemDetails);
      quantityFound.push(itemDetails);

      
    }

      /// calculating the total quantity previously dispatched
      var  [{quantity}] = quantityFound;
      totalQuantity = totalQuantity + parseInt(quantity);

  }

  data.push(quantityFound);
    })

  
 

  //FIND THE QUANTITY IN STOCK
  const  stockQuantityfound  = await PurchaseProduct.findOne({ _id: ItemId }, { _id: 0, quantity: 1 });
    var stockQuantity = 0;
    var sumQuantity = 0;
  if(stockQuantityfound){
     stockQuantity = stockQuantityfound.quantity;
    console.log("The quantity already assigned to users", totalQuantity);
    console.log("The Total Quantity that was in stock intially", stockQuantity);
     sumQuantity = totalQuantity + parseInt(req.body.quantity);
    console.log("The Sum of the quantity previously assigned and currently ordered", sumQuantity);
  }

  const inStockQauntity = stockQuantity - sumQuantity;



    res.status(201).json({
      success: true,
      inStockQauntity:inStockQauntity ,
      data: data,
      message: "Products fetched successfully"
    });


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


exports.updateProductTransfer = asyncHandler(async (req, res, next) => {


  const body = req.body;
  const ItemId = body.ItemId;

  // Getting all the unique ids
  const allUniqueIds = await ProductTransfer.aggregate([{ $group: { _id: "$uuid" } }])
  
     // finding the quantity of lastly added record for each group id and getting sum
    var totalQuantity = 0;
    allUniqueIds.map(async (ids) => {
    var uuid = ids._id
    var  quantityFound = await ProductTransfer.find({ItemId:ItemId, uuid: uuid }).sort({ createdAt: -1 }).limit(1);
    if(quantityFound.length>0)
      var  [{quantity}] = quantityFound;
      totalQuantity = totalQuantity + parseInt(quantity);
    })

  
 

  //FIND THE QUANTITY IN STOCK
  const  stockQuantityfound  = await PurchaseProduct.findOne({ _id: ItemId }, { _id: 0, quantity: 1 });
    var stockQuantity = 0;
    var sumQuantity = 0;
  if(stockQuantityfound){
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


