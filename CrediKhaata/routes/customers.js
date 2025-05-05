const express = require("express");
const router = express.Router();
const customerController = require("../controllers/customerController");
const authenticateToken = require("../middleware/auth");

router.post("/", authenticateToken, customerController.createCustomer);
router.get("/", authenticateToken, customerController.getCustomers);
router.put("/:customerId", authenticateToken, customerController.updateCustomer);
router.delete("/:customerId", authenticateToken, customerController.deleteCustomer);

module.exports = router;