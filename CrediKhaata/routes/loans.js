const express = require("express");
const router = express.Router();
const loanController = require("../controllers/loanController");
const authenticateToken = require("../middleware/auth");

router.post("/", authenticateToken, loanController.createLoan);
router.get("/", authenticateToken, loanController.getLoans);
router.post("/:loanId/repayments", authenticateToken, loanController.recordRepayment);
router.get("/summary", authenticateToken, loanController.getSummary);
router.get("/overdue", authenticateToken, loanController.getOverdue);

module.exports = router;