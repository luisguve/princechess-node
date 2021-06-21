const { nanoid } = require("nanoid")
const { waitings, newMatch } = require("./match")
const asyncWrapper = require('../middleware/async')

const newGame = asyncWrapper(async (req, res ) => {
  const { session } = req
  // Get user ID and username from session. If not present, set one.
  let { userID, username } = session
  if (!userID) {
    userID = nanoid()
    session.userID = userID
  }
  if (!username) {
    username = process.env.DEFAULT_USERNAME
  }
  const { clock } = req.query
  if (!clock) {
    return res.status(400).send("Empty clock time")
  }
  let waiting
  switch (clock) {
    case "1":
    waiting = waitings["_1min"]
    break
    case "3":
    waiting = waitings["_3min"]
    break
    case "5":
    waiting = waitings["_5min"]
    break
    case "10":
    waiting = waitings["_10min"]
    break
    default:
    return res.status(400).send(`${clock} is not a valid clock`)
  }
  const {
    playRoomId,
    color,
    oppUsername
  } = await newMatch(userID, username, waiting)
  const data = {
    "color": color,
    "roomId": playRoomId,
    "opp": oppUsername
  }
  res.status(200).json(data)
})

module.exports = {
  newGame
}