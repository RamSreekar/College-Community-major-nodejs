const mongoose = require("mongoose");

const refreshTokensSchema = new mongoose.Schema({
  date: {
    type: String,
    required: true,
  },
  tokens: {
    type: Array,
    required: true,
  },
});

module.exports = mongoose.model("RefTokens", refreshTokensSchema);
