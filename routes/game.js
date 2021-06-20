const express = require("express")
const { newGame } = require("../controllers/game")

const router = express.Router()

router.get("/play", newGame)

// router.get("/game", joinGame)
// router.get("/invite", createInviteLink)
// router.get("/wait", waitForFriend)
// router.get("/join", joinInvitation)

module.exports = router