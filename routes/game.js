const express = require("express")
const { newGame } = require("../controllers/game")

const router = express.Router()

router.get("/play", newGame)

module.exports = router