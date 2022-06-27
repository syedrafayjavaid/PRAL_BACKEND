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
  designation: {
    type: String,
  },
  dateOfJoining: {
    type: Date,
  },
  department: {
    type: String
  },
  wing: {
    type: String
  },
  pg: {
    type: Number
  },
  placeOfPosting: {
    type: String
  },
  emailAddress: {
    type: String
  },
  mobileNumber: {
    type: String
  },
  remarks: {
    type: String,
  },
  cnic: {
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
  officeId: { type: mongoose.Schema.Types.ObjectId, ref: "Office" },
  purchasedItems: [{ type: mongoose.Schema.Types.ObjectId, ref: "Product" }],
  reportingManager: { type: mongoose.Schema.Types.ObjectId, ref: "Employee" },
});

module.exports = mongoose.model("Employee", EmployeeSchema);
