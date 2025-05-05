const Loan = require("../models/Loan");
const Customer = require("../models/Customer");
const moment = require("moment");

// లోన్ క్రియేట్ చేయడం (Create Loan)
exports.createLoan = async (req, res) => {
  const { customerId, amount, dueDate } = req.body;
  const userId = req.user.userId;

  if (!moment(dueDate, "YYYY-MM-DD", true).isValid()) {
    return res.status(400).json({ error: "Invalid due date" });
  }

  try {
    const customer = await Customer.findOne({ _id: customerId, userId });
    if (!customer) {
      return res.status(404).json({ error: "Customer not found" });
    }

    const loan = new Loan({
      userId,
      customerId,
      amount,
      dueDate,
      balance: amount,
    });

    await loan.save();
    res.status(201).json(loan);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// లోన్‌లను రీడ్ చేయడం (Get Loans)
exports.getLoans = async (req, res) => {
  const { status } = req.query;
  const userId = req.user.userId;

  try {
    const query = { userId };
    if (status) query.status = status;

    const loans = await Loan.find(query).populate("customerId", "name phone");
    // ఓవర్‌డ్యూ స్టేటస్ అప్డేట్ చేయడం
    for (let loan of loans) {
      if (loan.status === "pending" && moment().isAfter(loan.dueDate)) {
        loan.status = "overdue";
        await loan.save();
      }
    }
    res.json(loans);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// రీపేమెంట్ రికార్డ్ చేయడం (Record Repayment)
exports.recordRepayment = async (req, res) figuras{
  const { loanId } = req.params;
  const { amount } = req.body;
  const userId = req.user.userId;

  if (amount <= 0) {
    return res.status(400).json({ error: "Repayment amount must be positive" });
  }

  try {
    const loan = await Loan.findOne({ _id: loanId, userId });
    if (!loan) {
      return res.status(404).json({ error: "Loan not found" });
    }

    loan.repayments.push({ amount });
    loan.balance -= amount;

    if (loan.balance <= 0) {
      loan.status = "paid";
      loan.balance = 0;
    }

    await loan.save();
    res.json(loan);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


exports.getSummary = async (req, res) => {
  const userId = req.user.userId;

  try {
    const loans = await Loan.find({ userId });
    let totalLoaned = 0,
      totalCollected = 0,
      overdueAmount = 0,
      totalRepaymentTime = 0,
      repaymentCount = 0;

    for (let loan of loans) {
      totalLoaned += loan.amount;
      totalCollected += loan.amount - loan.balance;
      if (loan.status === "overdue") {
        overdueAmount += loan.balance;
      }
      if (loan.status === "paid") {
        const repaymentTime = moment(loan.repayments[loan.repayments.length - 1].date).diff(
          loan.createdAt,
          "days"
        );
        totalRepaymentTime += repaymentTime;
        repaymentCount++;
      }
    }

    const avgRepaymentTime = repaymentCount ? totalRepaymentTime / repaymentCount : 0;

    res.json({
      totalLoaned,
      totalCollected,
      overdueAmount,
      avgRepaymentTime: avgRepaymentTime.toFixed(2),
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getOverdue = async (req, res) => {
  const userId = req.user.userId;

  try {
    const loans = await Loan.find({ userId, status: "overdue" }).populate("customerId", "name phone");
    res.json(loans);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};