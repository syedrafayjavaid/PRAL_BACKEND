const mongoose = require("mongoose");

PurchaseProductSchema = new mongoose.Schema({
  purchaseProductId: {
    type: Number,
  },
  model: {
    type: String,
  },
  price: {
    type: Number,
  },
  purchaseOrder: {
    type: String,
  },
  dataOfPurchase: {
    type: Date,
  },
  attachment: {
    type: [String],
  },
  comment: {
    type: String,
    maxlength: [500, "Comment can not be more than 500 character"],
  },
  ownership: {
    type: String,
    enum: ["PRAL", "FBR"],
  },
  status: {
    type: String,
    enum: ["inuse", "replacement", "scrap"],
  },
  quantity: {
    type: Number,
  },
  QRCode: {
    type: String,
  },
  QRCodeImage: {
    type: String,
  },
  vender: {
    type: String,
  },
  active: {
    type: Boolean,
  },
  createdBy: {
    type: String,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  modifiedBy: {
    type: String,
  },
  modifiedAt: {
    type: Date,
  },
  purchasedBy: { type: mongoose.Schema.Types.ObjectId, ref: "Employee" },
  custodian: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
  officeId: { type: mongoose.Schema.Types.ObjectId, ref: "Office" },
});

module.exports = mongoose.model("PurchaseProduct", PurchaseProductSchema);
