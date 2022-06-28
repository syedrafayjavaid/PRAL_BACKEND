const express = require("express");
const router = express.Router();

const {
  createPoductTransfer,getAllProductsTransfer
} = require("../controllers/productTransfer");

router.route("/").get(getAllProductsTransfer).post(createPoductTransfer);
// router
//   .route("/:id")
//   .get(getPurchaseProduct)
//   .delete(deletePurchaseProduct)
//   .put(updatePurchaseProduct);

module.exports = router;
