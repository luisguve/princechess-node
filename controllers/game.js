const { nanoid } = require("nanoid")
const { waitings, newMatch, getRoom } = require("./match")
const asyncWrapper = require("../middleware/async")
const { createCustomError } = require("../errors/custom-error")

const newGame = asyncWrapper(async (req, res, next) => {
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
    return next(createCustomError("Empty clock time", 400))
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
    return next(createCustomError(`${clock} is not a valid clock`, 400))
  }
  const {
    playRoomId,
    color,
    oppUsername
  } = await newMatch(userID, username, waiting, Number(clock))
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
  if (!userID) return next(createCustomError("Unknown user", 401))

  const { id:gameID } = req.query
  if (!gameID) return next(createCustomError("Unset ID", 400))

  const match = await getRoom(gameID)
  if (!match) return next(createCustomError("Match not found", 404))

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
  res.status(200).json({match, color})
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