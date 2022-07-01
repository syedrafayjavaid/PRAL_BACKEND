const express = require("express");
const router = express.Router();

const {
  getAllPurchaseProducts,
  createPurchaseProduct,
  getPurchaseProduct,
  updatePurchaseProduct,
  deletePurchaseProduct,
  searchPurchaseProduct,

} = require("../controllers/purchaseProduct");
// router.route("/vendors").get(searchVendors);
router.route("/").get(getAllPurchaseProducts).post(createPurchaseProduct);
router.route("/:id").get(getPurchaseProduct).delete(deletePurchaseProduct).put(updatePurchaseProduct);
router.route("/searchFilters").post(searchPurchaseProduct);


module.exports = router;
