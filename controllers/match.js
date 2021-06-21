const EventEmitter = require("events")
const { nanoid } = require("nanoid")
const { Mutex } = require("async-mutex")
const Match = require("../models/Match")

const waitings = {
  _1min: {
    player: null,
    opp: new EventEmitter()
  },
  _3min: {
    player: null,
    opp: new EventEmitter()
  },
  _5min: {
    player: null,
    opp: new EventEmitter()
  },
  _10min: {
    player: null,
    opp: new EventEmitter()
  }
}

const mutex = new Mutex()

// Make new room by storing match into the database
const makeRoom = match => {
  Match.create({
    ...match,
    _id: match.gameID
  })
}

// Get room by it's ID
const getRoom = async gameID => Match.findOne({_id: gameID})

const newMatch = async (userID, username, waiting, clock) => {
  let response = {
    playRoomId: "",
    color: "",
    oppUsername: ""
  }
  // Avoid race condition here. Multiple requests need access to the same
  // resource: the parameter waiting, which belongs to waitings, a globally
  // scoped constant declared on line 5. This resource will be read and
  // written asynchronously.
  let waitForOpponent = true
  const release = await mutex.acquire()
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
  release()
  return new Promise((resolve, reject) => {
    // Wait opponent for up to 5 seconds.
    const deadline = setTimeout(() => {
      mutex.acquire().then(release => {
        waiting.player = null
        release()
      })
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
          id: userID,
          username,
        }
        match.clock = clock
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
          id: userID,
          username
        }
      })
      response = {
        playRoomId: playRoomId,
        color: "black",
        oppUsername: waiting.player.username
      }
      resolve(response)
      // Release player spot.
      mutex.acquire().then(release => {
        waiting.player = null
        release()
      })
    }
  })
}

module.exports = {
  waitings,
  newMatch,
  getRoom
}
