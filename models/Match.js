const mongoose = require("mongoose")

const MatchSchema = new mongoose.Schema({
  _id: String,
  white: {
    id: String,
    username: String
  },
  black: {
    id: String,
    username: String
  }
})

module.exports = mongoose.model("Match", MatchSchema)