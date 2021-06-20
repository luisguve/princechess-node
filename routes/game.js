const express = require("express")
const { lookupMatch } = require("../controllers/game")

const router = express.Router()

router.get("/play", lookupMatch)

module.exports = router