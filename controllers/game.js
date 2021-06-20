const { nanoid } require("nanoid")
const EventEmitter = require('events')

const waitings = {
  _1min = {
    player: null,
    opp: new EventEmitter()
  },
  _3min = {
    player: null,
    opp: new EventEmitter()
  },
  _5min = {
    player: null,
    opp: new EventEmitter()
  },
  _10min = {
    player: null,
    opp: new EventEmitter()
  }
}

// Make new room by storing match into the database
const makeRoom = async match => {

}

const newMatch = (userID, username, waiting) => {
  let response = {
    playRoomId: "",
    color: "",
    oppUsername: ""
  }
  let waitForOpponent = true
  if (!waiting.player) {
    waiting.player = {
      userID,
      username
    }
  } else {
    if (waiting.player.userID === userID) {
      // The same user waiting for opponent is the opponent.
      // Reset user waiting for opponent.
      waiting.player = {
        userID,
        username
      }
      waiting.opp.emit("cancel")
    } else {
      // A player is ALREADY waiting for opponent.
      waitForOpponent = false
    }
  }
  return new Promise((resolve, reject) => {
    // Wait opponent for up to 5 seconds.
    const deadline = setTimeout(() => {
      waiting.player = null
      resolve(response)
    }, 5000)
    // Check whether to wait for an opponent to join.
    if (waitForOpponent) {
      waiting.opp.on("join", match => {
        // Found opponent; stop deadline.
        clearTimeout(deadline)
        response = {
          playRoomId: match.gameID,
          color: "white",
          oppUsername: match.black.username
        }
        resolve(response)
        match.white = {
          userID,
          username,
        }
        makeRoom(match)
      })
      waiting.opp.on("cancel", () => {
        clearTimeout(deadline)
        resolve(response) // Default response
      })
    } else {
      // A player is ALREADY waiting for opponent.
      // Create room ID and join the match.
      const playRoomId = nanoid()
      waiting.opp.emit("join", {
        gameID: playRoomId,
        black: {
          userID,
          username,
        }
      })
      response = {
        playRoomId,
        color: "black",
        oppUsername: waiting.player.username
      }
      resolve(response)
      waiting.player = null
    }
  })
}

const lookupMatch = (req, res ) => {
  // ↓ JS code ↓
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
  const { clock } = req.params
  if (!clock) {
    return res.status(400).send("Empty clock time")
  }
  let waiting
  switch (clock) {
    case "1":
    waiting = waitings[_1min]
    break
    case "3":
    waiting = waitings[_3min]
    break
    case "5":
    waiting = waitings[_5min]
    break
    case "10":
    waiting = waitings[_10min]
    break
    default:
    return res.status(400).send(`${clock} is not a valid clock`)
  }
  newMatch(userID, username, waiting)
  .then(({playRoomId, color, oppUsername}) => {
    const data = {
      "color": color,
      "roomId": playRoomId,
      "opp": oppUsername
    }
    res.status(200).json(data)
  })
  .catch(() => res.status(500).send("Something went wrong"))
  // ↑ JS code ↑
  // 
  // ↓ Go code ↓
  var (
    waiting *user
    waitOpp chan match
  )
  switch vars["clock"] {
  case "1":
    waiting = &rout.waiting1min
    waitOpp = rout.opp1min
  case "3":
    waiting = &rout.waiting3min
    waitOpp = rout.opp3min
  case "5":
    waiting = &rout.waiting5min
    waitOpp = rout.opp5min
  case "10":
    waiting = &rout.waiting10min
    waitOpp = rout.opp10min
  default:
    http.Error(w, "Invalid clock time: " + vars["clock"], http.StatusBadRequest)
    return
  }

  playRoomId, color, opp := rout.newMatch(uid, username, waiting, waitOpp)

  res := map[string]string{
    "color": color,
    "roomId": playRoomId,
    "opp": opp,
  }

  resB, err := json.Marshal(res)
  if err != nil {
    log.Println("Could not marshal response:", err)
    http.Error(w, err.Error(), http.StatusInternalServerError)
  }

  if _, err := w.Write(resB); err != nil {
    log.Println(err)
  }
}

module.exports = {
  lookupMatch
}