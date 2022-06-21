const mongoose = require("mongoose");

const EmployeeSchema = new mongoose.Schema({
  employeeId: {
    type: String,
    required: true,
    unique: true,
  },
  name: {
    type: String,
    required: true,
  },
  photo: {
    type: String,
  },
  office: {
    type: String,
  },
  detail: {
    type: String,
  },
  CNIC: {
    type: String,
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
  purchase: {
    type: Boolean,
    required: [true, "Yss or No"],
  },
  officeId: { type: mongoose.Schema.Types.ObjectId, ref: "Office" },
  purchasedItems: [{ type: mongoose.Schema.Types.ObjectId, ref: "Product" }],
});

module.exports = mongoose.model("Employee", EmployeeSchema);
