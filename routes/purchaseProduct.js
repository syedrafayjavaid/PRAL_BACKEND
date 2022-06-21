const express = require("express");
const router = express.Router();

const {
  getAllPurchaseProducts,
  createPurchaseProduct,
  getPurchaseProduct,
  updatePurchaseProduct,
  deletePurchaseProduct,
} = require("../controllers/purchaseProduct");

router.route("/").get(getAllPurchaseProducts).post(createPurchaseProduct);
router
  .route("/:id")
  .get(getPurchaseProduct)
  .delete(deletePurchaseProduct)
  .put(updatePurchaseProduct);

module.exports = router;
