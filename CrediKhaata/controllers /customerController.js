const Customer = require("../models/Customer");
const validator = require("validator");

// కస్టమర్ క్రియేట్ చేయడం (Create Customer)
exports.createCustomer = async (req, res) => {
  const { name, phone, address, trustScore } = req.body;
  const userId = req.user.userId;

  if (!validator.isMobilePhone(phone, "en-IN")) {
    return res.status(400).json({ error: "Invalid phone number" });
  }

  if (trustScore && (trustScore < 0 || trustScore > 100)) {
    return res.status(400).json({ error: "Trust score must be between 0 and 100" });
  }

  try {
    const customer = new Customer({ name, phone, address, trustScore, userId });
    await customer.save();
    res.status(201).json(customer);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// కస్టమర్‌లను రీడ్ చేయడం (Get Customers)
exports.getCustomers = async (req, res) => {
  try {
    const customers = await Customer.find({ userId: req.user.userId });
    res.json(customers);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// కస్టమర్ అప్డేట్ చేయడం (Update Customer)
exports.updateCustomer = async (req, res) => {
  const { customerId } = req.params;
  const { name, phone, address, trustScore } = req.body;

  if (phone && !validator.isMobilePhone(phone, "en-IN")) {
    return res.status(400).json({ error: "Invalid phone number" });
  }

  try {
    const customer = await Customer.findOneAndUpdate(
      { _id: customerId, userId: req.user.userId },
      { name, phone, address, trustScore },
      { new: true }
    );
    if (!customer) {
      return res.status(404).json({ error: "Customer not found" });
    }
    res.json(customer);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// కస్టమర్ డిలీట్ చేయడం (Delete Customer)
exports.deleteCustomer = async (req, res) => {
  const { customerId } = req.params;

  try {
    const customer = await Customer.findOneAndDelete({ _id: customerId, userId: req.user.userId });
    if (!customer) {
      return res.status(404).json({ error: "Customer not found" });
    }
    res.json({ message: "Customer deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};