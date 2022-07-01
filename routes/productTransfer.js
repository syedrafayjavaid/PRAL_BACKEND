const express = require("express");
const router = express.Router();

const {
  createPoductTransfer, getAllProductsTransfer, getProductsTransferDetails, updateProductTransfer,ProductTransfer,modified,updateProductTransferDemo,getProductsTransferDetailsDemo
} = require("../controllers/productTransfer");

router.route("/").get(getAllProductsTransfer).post(createPoductTransfer);
router.route("/:id").get(getProductsTransferDetailsDemo);
router.route("/update").put(updateProductTransferDemo);
router.route("/transfer").post(ProductTransfer);
//   .delete(deletePurchaseProduct)
//   .put(updatePurchaseProduct);

module.exports = router;
