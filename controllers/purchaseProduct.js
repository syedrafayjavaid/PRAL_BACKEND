const path = require("path");
const uuid4 = require("uuid4");
const ErrorResponse = require("../utils/errorResponse");
const asyncHandler = require("../middleware/async");
const PurchaseProduct = require("../models/PurchaseProduct");
const ProductTransfer = require("../models/ProductTransfer");
const Product = require("../models/Product");
const Employee = require("../models/Employee");
const { default: mongoose } = require("mongoose");
const { all } = require("../routes/productTransfer");




exports.getAllPurchaseProducts = asyncHandler(async (req, res, next) => {


  // NEW API
  const purchaseProduct = await PurchaseProduct.aggregate([

    {
      $lookup: {
        from: "products",
        localField: "productId",
        foreignField: "_id",
        as: "product"
      }
    }, {
      $lookup: {
        from: "offices",
        localField: "officeId",
        foreignField: "_id",
        as: "office"
      }
    }
  ])


  // OLD
  // const purchaseProduct = await PurchaseProduct.find();

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
    const newInStock = (getLastPurchaseProduct[0].purchaseProductId) + 1;
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


  // finding the previous record and calculating the average price and total quantity

  const records = await PurchaseProduct.find({ productId: req.body.productId });
  let sum = parseInt(req.body.price);
  let quantity = parseInt(req.body.quantity)
  let averagePrice = req.body.price;
  let productBody;


  // If the product is previously added 
  if (records.length > 0) {
    records.map((data) => {
      sum = sum + parseInt(data.price);
      // console.log("The incoming price has",data.price);
      // console.log("The sum of the product has",sum);
      quantity = quantity + parseInt(data.quantity);
    });


    console.log("sum has", sum);
    console.log("The records length has ", records.length + 1);

    averagePrice = sum / (records.length + 1);
    if (isNaN(averagePrice)) {
      averagePrice = req.body.price;
    }

    console.log("The average price has", averagePrice);
    console.log("The sum of the quanr has", quantity);


    productBody = {
      modifiedAt: Date.now(),
      averagePrice: averagePrice,
      quantity: quantity,
    };

  }

  else {
    // if the there is no record in database
    productBody = {
      modifiedAt: Date.now(),
      averagePrice: req.body.price,
      quantity: req.body.quantity,
    };


  }

  // Creating the purchased item new record
  const body = req.body;
  // body.inStore = req.body.quantity;
  const purchaseProduct = await PurchaseProduct.create(body);

  // updating the average price and quanity in the main product record
  const product = await Product.findByIdAndUpdate(
    { _id: req.body.productId },
    productBody,
    {
      new: true,
      runValidators: true,
    }
  );


  res.status(201).json({ success: true, data: purchaseProduct, message: "Item regestered successfully" });


});


exports.getPurchaseProduct = asyncHandler(async (req, res, next) => {

  // NEW API
  const purchaseProduct = await PurchaseProduct.aggregate([

    {
      $match: {
        _id: mongoose.Types.ObjectId(req.params.id)
      }
    },
    {
      $lookup: {
        from: "products",
        localField: "productId",
        foreignField: "_id",
        as: "product"
      }
    }, {
      $lookup: {
        from: "offices",
        localField: "officeId",
        foreignField: "_id",
        as: "office"
      }
    }
  ])

  // OLD
  // const purchaseProduct = await PurchaseProduct.findById(req.params.id);

  if (!purchaseProduct) {
    return next(
      new ErrorResponse(
        `Purchase Product not found with id of ${req.params.id}`,
        404
      )
    );
  }
  else {

    // Getting all the unique ids
    const allProductsTransfered = await ProductTransfer.aggregate([{ $match: { ItemId: mongoose.Types.ObjectId(req.params.id) } }, { $group: { _id: "$uuid" } }])

    // console.log("All Products transfer has",allProductsTransfered)
    // finding the quantity of lastly added record for each group id and getting sum
    var totalQuantity = 0;
    await Promise.all(allProductsTransfered.map(async (ids) => {
      var uuid = ids._id
      var quantityFound = await ProductTransfer.find({ ItemId: req.params.id, uuid: uuid })
      if (quantityFound.length > 0) {
        var [{ quantity }] = quantityFound;
        totalQuantity = totalQuantity + parseInt(quantity);
      }
    }))


    // Calcualting in stock quatity 
    const stockQuantity = purchaseProduct.quantity;
    const availableStock = stockQuantity - totalQuantity;

    console.log("The stockQuantity ", stockQuantity);
    console.log("The availableStock ", availableStock);

    res.status(200).json({
      success: true,
      data: purchaseProduct,
      stock: availableStock
    });

  }

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

  // Updating the Item record 
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
  } else {


    // finding the previous record and calculating the average price and total quantity
    const records = await PurchaseProduct.find({ productId: req.body.productId });
    let sum = parseInt(0);
    let quantity = parseInt(0)
    let averagePrice = parseInt(0);
    let productBody;


    // If the product is previously added 
    if (records.length > 0) {
      records.map((data) => {
        sum = sum + parseInt(data.price);
        // console.log("The incoming price has",data.price);
        // console.log("The sum of the product has",sum);
        quantity = quantity + parseInt(data.quantity);
      });


      // console.log("The sum Of the Price has",sum);
      // console.log("The records length has ",records.length);

      averagePrice = sum / (records.length);
      if (isNaN(averagePrice)) {
        averagePrice = req.body.price;
      }

      // console.log("The average price has",averagePrice);
      // console.log("The sum of the quanr has",quantity); 


      productBody = {
        modifiedAt: Date.now(),
        averagePrice: averagePrice,
        quantity: quantity,
      };

    }

    else {
      // if the there is no record in database
      productBody = {
        modifiedAt: Date.now(),
        averagePrice: 0,
        quantity: 0,
      };


    }
    // updating the average price and quanity in the main product record
    const product = await Product.findByIdAndUpdate(
      { _id: req.body.productId },
      productBody,
      {
        new: true,
        runValidators: true,
      }
    );


    res.status(200).json({
      success: true,
      data: purchaseProduct,
    });

  }

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
  } else {

    // finding the previous record and calculating the average price and total quantity
    const records = await PurchaseProduct.find({ productId: req.body.productId });
    let sum = parseInt(0);
    let quantity = parseInt(0)
    let averagePrice = parseInt(0);
    let productBody;
    console.log("yes i am here");

    // If the product is previously added 
    if (records.length > 0) {
      records.map((data) => {
        sum = sum + parseInt(data.price);
        // console.log("The incoming price has",data.price);
        // console.log("The sum of the product has",sum);
        quantity = quantity + parseInt(data.quantity);
      });


      console.log("sum has", sum);
      console.log("The records length has ", records.length);

      averagePrice = sum / (records.length);
      if (isNaN(averagePrice)) {
        averagePrice = req.body.price;
      }

      console.log("The average price has", averagePrice);
      console.log("The sum of the quanr has", quantity);


      productBody = {
        modifiedAt: Date.now(),
        averagePrice: averagePrice,
        quantity: quantity,
      };

    }

    else {
      // if the there is no record in database
      productBody = {
        modifiedAt: Date.now(),
        averagePrice: 0,
        quantity: 0,
      };


    }
    // updating the average price and quanity in the main product record
    const product = await Product.findByIdAndUpdate(
      { _id: req.body.productId },
      productBody,
      {
        new: true,
        runValidators: true,
      }
    );


    // sending the response 
    res.status(201).json({
      success: true,
      msg: `Purchase Product deleted with id: ${req.params.id}`,
    });


  }

});


exports.searchPurchaseProduct = asyncHandler(async (req, res, next) => {


  // MAKING VARIABLES NEEDED
  const id = req.body.productId;
  const custodian = req.body.custodian;
  const tagNo = req.body.tagNo;
  const srNo = req.body.srNo;
  const purchaseOrder = req.body.purchaseOrder;
  const venderEmail = req.body.venderEmail;
  const ownership = req.body.ownership;
  const status = req.body.status;
  const sDate = req.body.startDate;
  const eDate = req.body.endDate;
  const startQuantity = req.body.startQuantity;
  const endQuantity = req.body.endQuantity;
  const startPrice = req.body.startPrice;
  const endPrice = req.body.endPrice;
  const features = req.body.features;


  let startDate = new Date(sDate);
  startDate.setHours(0, 0, 0, 0);

  let endDate = new Date(eDate);
  endDate.setDate(endDate.getDate() + 1);
  endDate.setHours(0, 0, 0, 0);


  const query = {};

  // MAKING A QUERY
  if (id !== "") {
    query.productId = id;
  }
  if (custodian !== "") {
    query.custodian = custodian;
  }
  if (tagNo !== "") {
    query.tagNo = tagNo;
  }
  if (srNo !== "") {
    query.srNo = srNo;
  }
  if (venderEmail !== "") {
    query.venderEmail = venderEmail;
  }
  if (ownership !== "") {
    query.ownership = ownership;
  }
  if (status !== "") {
    query.status = status;
  }
  if (sDate !== "" && eDate !== "") {
    query.dataOfPurchase = { $gte: new Date(startDate), $lte: new Date(endDate) }
  }
  if (startQuantity !== "" || endQuantity !== "") {
    query.quantity = { $gte: startQuantity, $lte: endQuantity }
  }
  if (startPrice !== "" || endPrice !== "") {
    query.price = { $gte: startPrice, $lte: endPrice }
  }
  if (purchaseOrder !== "") {
    query.purchaseOrder = purchaseOrder;
  }
  if (features.length > 0) {
    query.features = { $all: features }
  }


  console.log("The query has", query);

  // FINDING THE RESULTS AGAINTS QUERY
  // NEW API
  const result = await PurchaseProduct.aggregate([

    {
      $match: query

    },
    {
      $lookup: {
        from: "products",
        localField: "productId",
        foreignField: "_id",
        as: "product"
      }
    }, {
      $lookup: {
        from: "offices",
        localField: "officeId",
        foreignField: "_id",
        as: "office"
      }
    }
  ])

  //OLD
  // let result = await PurchaseProduct.find(query);
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




// API'S NOT IN USE

exports.searchPurchaseProductOld = asyncHandler(async (req, res, next) => {

  const id = req.body.productId;
  const custodian = req.body.custodian;
  const tagNo = req.body.tagNo;
  const srNo = req.body.srNo;
  const venderEmail = req.body.venderEmail;

  try {
    if (
      id !== "" &&
      custodian !== "" &&
      tagNo !== "" &&
      srNo !== "" &&
      venderEmail !== ""
    ) {
      console.log("Pass 31");
      console.log("The Dynamic has", id);
      let employee = await PurchaseProduct.find({
        _id: id,
        custodian: custodian,
        tagNo: tagNo,
        srNo: srNo,
        venderEmail: venderEmail,
      });
      if (!employee) {
        return next(
          new ErrorResponse(
            `Employee not found with email ${req.body.productId}`,
            404
          )
        );
      }
      res.status(201).json({
        success: true,
        data: employee,
      });
    } else if (
      custodian !== "" &&
      tagNo !== "" &&
      srNo !== "" &&
      venderEmail !== ""
    ) {
      console.log("Pass 30");
      let employee = await PurchaseProduct.find({
        custodian: custodian,
        tagNo: tagNo,
        srNo: srNo,
        venderEmail: venderEmail,
      });
      if (!employee) {
        return next(new ErrorResponse(`Employee not found`, 404));
      }
      res.status(201).json({
        success: true,
        data: employee,
      });
    } else if (
      id !== "" &&
      custodian !== "" &&
      srNo !== "" &&
      venderEmail !== ""
    ) {
      console.log("Pass 29");
      console.log("The Dynamic has", id);

      console.log("It is  a valid email");
      let employee = await PurchaseProduct.find({
        _id: id,
        tagNo: tagNo,
        srNo: srNo,
        venderEmail: venderEmail,
      });
      if (!employee) {
        return next(
          new ErrorResponse(
            `Employee not found with email ${req.body.dynamic}`,
            404
          )
        );
      }
      res.status(201).json({
        success: true,
        data: employee,
      });
    } else if (
      id !== "" &&
      custodian !== "" &&
      srNo !== "" &&
      venderEmail !== ""
    ) {
      console.log("The Dynamic has", dynamic);
      console.log("Pass 28");
      console.log("It is  a valid email");
      let employee = await PurchaseProduct.find({
        _id: id,
        custodian: custodian,
        srNo: srNo,
        venderEmail: venderEmail,
      });
      if (!employee) {
        return next(
          new ErrorResponse(
            `Employee not found with email ${req.body.productId}`,
            404
          )
        );
      }
      res.status(201).json({
        success: true,
        data: employee,
      });
    } else if (
      id !== "" &&
      custodian !== "" &&
      tagNo !== "" &&
      venderEmail !== ""
    ) {
      console.log("Pass 27");
      console.log("The Dynamic has", id);

      console.log("It is  a valid email");
      let employee = await PurchaseProduct.find({
        _id: id,
        custodian: custodian,
        tagNo: tagNo,
        venderEmail: venderEmail,
      });
      if (!employee) {
        return next(new ErrorResponse(`Employee not found `, 404));
      }
      res.status(201).json({
        success: true,
        data: employee,
      });
    } else if (id !== "" && custodian !== "" && tagNo !== "" && srNo !== "") {
      let employee = await PurchaseProduct.find({
        _id: id,
        custodian: custodian,
        tagNo: tagNo,
        srNo: srNo,
      });
      if (!employee) {
        return next(new ErrorResponse(`Employee not found `, 404));
      }
      res.status(201).json({
        success: true,
        data: employee,
      });
    } else if (tagNo !== "" && srNo !== "" && venderEmail !== "") {
      console.log("Pass 25");
      let employee = await PurchaseProduct.find({
        tagNo: tagNo,
        srNo: srNo,
        venderEmail: venderEmail,
      });
      if (!employee) {
        return next(new ErrorResponse(`Employee not found `, 404));
      }
      res.status(201).json({
        success: true,
        data: employee,
      });
    } else if (custodian !== "" && srNo !== "" && venderEmail !== "") {
      console.log("Pass 24");
      let employee = await PurchaseProduct.find({
        custodian: custodian,
        srNo: srNo,
        venderEmail: venderEmail,
      });
      if (!employee) {
        return next(new ErrorResponse(`Employee not found`, 404));
      }
      res.status(201).json({
        success: true,
        data: employee,
      });
    } else if (custodian !== "" && tagNo !== "" && venderEmail !== "") {
      console.log("Pass 23");
      let employee = await PurchaseProduct.find({
        custodian: custodian,
        tagNo: tagNo,
        venderEmail: venderEmail,
      });
      if (!employee) {
        return next(new ErrorResponse(`Employee not found `, 404));
      }
      res.status(201).json({
        success: true,
        data: employee,
      });
    } else if (custodian !== "" && tagNo !== "" && srNo !== "") {
      console.log("Pass 22");
      let employee = await PurchaseProduct.find({
        custodian: custodian,
        tagNo: tagNo,
        srNo: srNo,
      });
      if (!employee) {
        return next(new ErrorResponse(`Employee not found`, 404));
      }
      res.status(201).json({
        success: true,
        data: employee,
      });
    } else if (id !== "" && srNo !== "" && venderEmail !== "") {
      console.log("Pass 21");
      console.log("The Dynamic has", dynamic);

      console.log("It is  a valid email");
      let employee = await PurchaseProduct.find({
        _id: id,
        srNo: srNo,
        venderEmail: venderEmail,
      });
      if (!employee) {
        return next(new ErrorResponse(`Employee not found `, 404));
      }
      res.status(201).json({
        success: true,
        data: employee,
      });
    } else if (id !== "" && tagNo !== "" && venderEmail !== "") {
      console.log("Pass 20");

      console.log("It is  a valid email");
      let employee = await PurchaseProduct.find({
        _id: id,
        tagNo: tagNo,
        venderEmail: venderEmail,
      });
      if (!employee) {
        return next(new ErrorResponse(`Employee not found `, 404));
      }
      res.status(201).json({
        success: true,
        data: employee,
      });
    } else if (id !== "" && tagNo !== "" && srNo !== "") {
      console.log("Pass 19");
      console.log("The Dynamic has", id);

      console.log("It is  a valid email");
      let employee = await PurchaseProduct.find({
        _id: id,
        tagNo: tagNo,
        srNo: srNo,
      });
      if (!employee) {
        return next(new ErrorResponse(`Employee not found `, 404));
      }
      res.status(201).json({
        success: true,
        data: employee,
      });
    } else if (id !== "" && custodian !== "" && venderEmail !== "") {
      console.log("Pass 18");
      console.log("The Dynamic has", dynamic);

      console.log("It is  a valid email");
      let employee = await PurchaseProduct.find({
        _id: id,
        custodian: custodian,
        venderEmail: venderEmail,
      });
      if (!employee) {
        return next(new ErrorResponse(`Employee not found `, 404));
      }
      res.status(201).json({
        success: true,
        data: employee,
      });
    } else if (id !== "" && custodian !== "" && srNo !== "") {
      console.log("Pass 17");
      console.log("The Dynamic has", id);

      console.log("It is  a valid email");
      let employee = await PurchaseProduct.find({
        _id: id,
        custodian: custodian,
        srNo: srNo,
      });
      if (!employee) {
        return next(new ErrorResponse(`Employee not found `, 404));
      }
      res.status(201).json({
        success: true,
        data: employee,
      });
    } else if (id !== "" && custodian !== "" && tagNo !== "") {
      console.log("Pass 16");
      console.log("It is  a valid email");
      let employee = await PurchaseProduct.find({
        _id: id,
        custodian: custodian,
        tagNo: tagNo,
      });
      if (!employee) {
        return next(new ErrorResponse(`Employee not found `, 404));
      }
      res.status(201).json({
        success: true,
        data: employee,
      });
    } else if (srNo !== "" && venderEmail !== "") {
      console.log("Pass 15");
      let employee = await PurchaseProduct.find({
        srNo: srNo,
        venderEmail: venderEmail,
      });
      if (!employee) {
        return next(new ErrorResponse(`Employee not found `, 404));
      }
      res.status(201).json({
        success: true,
        data: employee,
      });
    }

    // else if (subCategory !== "" && startPrice !== "") {

    //   console.log("Pass 15");
    //   let response = await Product.find({ subCategory: subCategory, salePrice: { $gte: startPrice, $lte: endPrice } }).sort({ rating: -1 })
    //   console.log("response is :", response)
    //   res.send({ code: 0, data: response })

    // }
    else if (tagNo !== "" && venderEmail !== "") {
      console.log("Pass 14");
      let employee = await PurchaseProduct.find({
        tagNo: tagNo,
        venderEmail: venderEmail,
      });
      if (!employee) {
        return next(new ErrorResponse(`Employee not found `, 404));
      }
      res.status(201).json({
        success: true,
        data: employee,
      });
    } else if (tagNo !== "" && srNo !== "") {
      console.log("Pass 13");
      let employee = await PurchaseProduct.find({
        tagNo: tagNo,
        srNo: srNo,
      });
      if (!employee) {
        return next(new ErrorResponse(`Employee not found `, 404));
      }
      res.status(201).json({
        success: true,
        data: employee,
      });
    } else if (custodian !== "" && venderEmail !== "") {
      console.log("Pass 12");
      let employee = await PurchaseProduct.find({
        custodian: custodian,
        venderEmail: venderEmail,
      });
      if (!employee) {
        return next(new ErrorResponse(`Employee not found `, 404));
      }
      res.status(201).json({
        success: true,
        data: employee,
      });
    } else if (custodian !== "" && srNo !== "") {
      console.log("Pass 11");
      let employee = await PurchaseProduct.find({
        custodian: custodian,
        srNo: srNo,
      });
      if (!employee) {
        return next(new ErrorResponse(`Employee not found `, 404));
      }
      res.status(201).json({
        success: true,
        data: employee,
      });
    } else if (custodian !== "" && tagNo !== "") {
      console.log("Pass 10");
      let employee = await PurchaseProduct.find({
        custodian: custodian,
        tagNo: tagNo,
      });
      if (!employee) {
        return next(new ErrorResponse(`Employee not found `, 404));
      }
      res.status(201).json({
        success: true,
        data: employee,
      });
    } else if (id !== "" && venderEmail !== "") {
      console.log("Pass 9");
      console.log("It is  a valid email");
      let employee = await PurchaseProduct.find({
        _id: id,
        venderEmail: venderEmail,
      });
      if (!employee) {
        return next(new ErrorResponse(`Employee not found `, 404));
      }
      res.status(201).json({
        success: true,
        data: employee,
      });
    } else if (id !== "" && srNo !== "") {
      console.log("Pass 8");
      console.log("It is  a valid email");
      let employee = await PurchaseProduct.find({
        _id: id,
        srNo: srNo,
      });
      if (!employee) {
        return next(new ErrorResponse(`Employee not found `, 404));
      }
      res.status(201).json({
        success: true,
        data: employee,
      });
    } else if (id !== "" && tagNo !== "") {
      console.log("Pass 7");
      console.log("It is  a valid email");
      let employee = await PurchaseProduct.find({
        _id: id,
        tagNo: tagNo,
      });
      if (!employee) {
        return next(new ErrorResponse(`Employee not found `, 404));
      }
      res.status(201).json({
        success: true,
        data: employee,
      });
    } else if (id !== "" && custodian !== "") {
      console.log("Pass 6");
      console.log("It is  a valid email");
      let employee = await PurchaseProduct.find({
        _id: id,
        custodian: custodian,
      });
      if (!employee) {
        return next(new ErrorResponse(`Employee not found `, 404));
      }
      res.status(201).json({
        success: true,
        data: employee,
      });
    } else if (venderEmail !== "") {
      console.log("Pass 5");
      let employee = await PurchaseProduct.find({
        venderEmail: venderEmail,
      });
      if (!employee) {
        return next(new ErrorResponse(`Employee not found `, 404));
      }
      res.status(201).json({
        success: true,
        data: employee,
      });
    } else if (srNo !== "") {
      console.log("Pass 4");
      let employee = await PurchaseProduct.find({ seNo: srNo });
      if (!employee) {
        return next(new ErrorResponse(`Employee not found `, 404));
      }
      res.status(201).json({
        success: true,
        data: employee,
      });
    } else if (tagNo !== "") {
      console.log("Pass 3");
      let employee = await PurchaseProduct.find({
        tagNo: tagNo,
      });
      if (!employee) {
        return next(new ErrorResponse(`Employee not found `, 404));
      }
      res.status(201).json({
        success: true,
        data: employee,
      });
    } else if (custodian !== "") {
      console.log("Pass 2");
      let employee = await PurchaseProduct.find({ custodian: custodian });
      if (!employee) {
        return next(new ErrorResponse(`Employee not found `, 404));
      }
      res.status(201).json({
        success: true,
        data: employee,
      });
    } else if (id !== "") {
      console.log("Pass 1");
      console.log("It is  a valid email");
      let employee = await PurchaseProduct.find({ _id: id });
      if (!employee) {
        return next(new ErrorResponse(`Employee not found `, 404));
      }
      res.status(201).json({
        success: true,
        data: employee,
      });
    } else {
      console.log("pass 0");
      return next(new ErrorResponse(`Employee not found `, 404));
    }
  } catch (e) {
    console.log("Error occured, possible cause: " + e.message);
    res.send({ code: 1, error: "Error occured, possible cause: " + e.message });
  }
});

