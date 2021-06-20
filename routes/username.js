const express = require("express")
const { getUsername, postUsername } = require("../controllers/username")

const router = express.Router()

router.get("/username", getUsername)
router.post("/username", postUsername)

module.exports = router