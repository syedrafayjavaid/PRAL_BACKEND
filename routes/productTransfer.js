const express = require("express");
const router = express.Router();

const {
createPoductTransfer,getProductsTransferDetails,updateProductTransfer,ProductTransfer,getAllProductsTransfer
} = require("../controllers/productTransfer");

router.route("/").get(getAllProductsTransfer).post(createPoductTransfer);
router.route("/:id").get(getProductsTransferDetails);
router.route("/update").put(updateProductTransfer);
router.route("/transfer").post(createPoductTransfer,getProductsTransferDetails,updateProductTransfer,ProductTransfer,getAllProductsTransfer
  );


module.exports = router;
