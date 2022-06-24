const express = require("express");
const path = require("path");
const dotenv = require("dotenv");
const cors = require("cors");
const morgan = require("morgan");
const errorHandler = require("./middleware/error");
const connectDB = require("./config/db");
const fileUpload = require("express-fileupload");

// Route files
const bootcamps = require("./routes/bootcamps");
const products = require("./routes/product");
const category = require("./routes/category");
const productType = require("./routes/productType");
const office = require("./routes/office");
const inStock = require("./routes/inStock");
const brand = require("./routes/brand");
const department = require("./routes/department");
const employee = require("./routes/employee");
const purchaseProduct = require("./routes/purchaseProduct");
const auth = require("./routes/auth");

// load env variables
dotenv.config({ path: "./config/config.env" });

// Datebase connection
connectDB();

const app = express();
app.use(express.json());
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}
app.use(cors());

// file upload
app.use(fileUpload());

// set static folder
app.use(express.static(path.join(__dirname, "public")));

// mount route
app.use("/api/v1/bootcamps", bootcamps);
app.use("/api/v1/products", products);
app.use("/api/v1/category", category);
app.use("/api/v1/productType", productType);
app.use("/api/v1/office", office);
app.use("/api/v1/inStock", inStock);
app.use("/api/v1/brand", brand);
app.use("/api/v1/department", department);
app.use("/api/v1/employee", employee);
app.use("/api/v1/purchaseProduct", purchaseProduct);
app.use("/api/v1/auth", auth);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const server = app.listen(
  PORT,
  console.log(`server running in ${process.env.NODE_ENV} mode on port ${PORT}`)
);

// handle unhandled rejection
process.on("unhandledRejection", (err, promise) => {
  console.log(`Error ${err.message}`);
  server.close(() => {
    process.exit(1);
  });
});
