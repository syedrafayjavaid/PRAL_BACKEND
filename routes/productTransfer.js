const express = require("express");
const router = express.Router();

const {
  createPoductTransfer, getAllProductsTransfer, getProductsTransferDetails, updateProductTransfer,ProductTransfer,modified
} = require("../controllers/productTransfer");

router.route("/").get(getAllProductsTransfer).post(createPoductTransfer);
router.route("/:id").get(getProductsTransferDetails);
router.route("/update").put(updateProductTransfer);
router.route("/transfer").post(ProductTransfer);
//   .delete(deletePurchaseProduct)
//   .put(updatePurchaseProduct);

module.exports = router;
