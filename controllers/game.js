const { nanoid } = require("nanoid")
const { waitings, newMatch, getRoom } = require("./match")
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

const joinGame = asyncWrapper(async (req, res, next) => {
  // Get user ID from session.
  let { session: { userID, username } } = req
  if (!userID) {
    return res.status(403).send("Unknown user")
  }
  const { id:gameID, clock } = req.query
  if (!clock) {
    return next(createCustomError("Unset clock", 400))
  }
  const mins = Number(clock)
  if (isNaN(mins)) {
    return next(createCustomError(`Clock must be a number. Was ${clock}`, 400))
  }
  const match = await getRoom(gameID)
  if (!match) {
    return next(createCustomError("Match not found", 404))
  }
  let color
  switch (userID) {
    case match.white.id:
    color = "white"
    break
    case match.black.id:
    color = "black"
    break
    default:
    return next(createCustomError("User is neither black nor white", 403))
  }
  if (!username) username = process.env.DEFAULT_USERNAME
  res.status(200).json({msg: "Starting game...", color})
  //
  // ↓ Go code ↓
  /*cleanup := func() {
    rout.m.Lock()
    delete(rout.matches, gameId)
    rout.m.Unlock()
    rout.ldHub.finishGame<- match
  }
  switchColors := func() {
    rout.m.Lock()
    temp := match.white
    match.white = match.black
    match.black = temp
    rout.matches[gameId] = match
    rout.m.Unlock()
  }*/
  // rout.serveGame(w, r, gameId, color, clock, cleanup, switchColors, username, uid)
  // ↑ Go code ↑
})

module.exports = {
  newGame,
  joinGame
}