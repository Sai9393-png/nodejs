const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");

dotenv.config();

const app = express();
app.use(express.json());

// రూట్స్ ఇంపోర్ట్ (Import Routes)
const authRoutes = require("./routes/auth");
const customerRoutes = require("./routes/customers");
const loanRoutes = require("./routes/loans");

// MongoDB కనెక్షన్ (Connect to MongoDB)
mongoose
  .connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("MongoDB connection error:", err));

// రూట్స్ సెటప్ (Setup Routes)
app.use("/api/auth", authRoutes);
app.use("/api/customers", customerRoutes);
app.use("/api/loans", loanRoutes);

// ఎర్రర్ హ్యాండ్లింగ్ (Error Handling)
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Something went wrong!" });
});

// సర్వర్ స్టార్ట్ (Start Server)
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});