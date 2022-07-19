const express = require("express");
const router = express.Router();

const {
  getAllPurchaseProducts,
  createPurchaseProduct,
  getPurchaseProduct,
  updatePurchaseProduct,
  deletePurchaseProduct,
  searchPurchaseProduct,
  getCreatedBySuggestion,
  getVendorsSuggestion,
  getallFeaturesSuggestion,
  getProductFeaturesSuggestion

} = require("../controllers/purchaseProduct");
// router.route("/vendors").get(searchVendors);
router.route("/").get(getAllPurchaseProducts).post(createPurchaseProduct);
router.route("/:id").get(getPurchaseProduct).delete(deletePurchaseProduct).put(updatePurchaseProduct);
router.route("/createdBySuggestions").post(getCreatedBySuggestion);
router.route("/vendorsSuggestions").post(getVendorsSuggestion)
router.route("/searchFilters").post(searchPurchaseProduct);
router.route("/allFeaturesSuggestions").post(getallFeaturesSuggestion);
router.route("/allFeaturesSuggestions/:id").post(getProductFeaturesSuggestion);


module.exports = router;
