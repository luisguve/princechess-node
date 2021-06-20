const express = require("express")
const { getAllTasks, getTask, createTask } = require("../controllers/tasks")

const router = express.Router()

router.get("/", getAllTasks)
router.post("/", createTask)
router.get("/:id", getTask)

module.exports = router
