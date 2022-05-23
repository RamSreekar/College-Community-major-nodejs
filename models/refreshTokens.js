const mongoose = require("mongoose");

const refreshTokensSchema = new mongoose.Schema({
  date: {
    type: String,
    required: true,
  },
  refToken: {
    type: String,
    default: "None",
  },
  /*
  tokens: {
    type: Object,
    default: {},
  },
  */
});

module.exports = mongoose.model("RefTokens", refreshTokensSchema);
