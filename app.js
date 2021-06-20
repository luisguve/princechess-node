const express = require("express")
const connectDB = require("./db/connect")
const env = require("dotenv").config()
if (env.error) {
  throw env.error
}
// Middleware
const cors = require("cors")
const cookieSession = require("cookie-session")
const bodyParser = require("body-parser")
const notFound = require("./middleware/not-found")
const errorHandlerMiddleware = require("./middleware/error-handler")
// const tasks = require("./routes/tasks")
// Routes
const username = require("./routes/username")
const game = require("./routes/game")
//const livedata = require("./routes/livedata")

const app = express()
// Middleware to read JSON and form data from request body,
// so that they are available in req.body
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended:true}))

app.use(cors({
  origin: ["http://localhost:8080", "https://princechess.netlify.app"],
  credentials: true
}))
app.use(cookieSession({
  name: "sess",
  secret: process.env.SESS_KEY
}))

// Routes
// app.use("/", username)
// app.use("/", game)
// app.use("/", livedata)
app.use("/", [username, game/*, livedata*/])

app.use(notFound)
app.use(errorHandlerMiddleware)
// app.get("/play", lookupMatch)
// app.get("/invite", )
// app.get("/game", )
// app.get("/wait", )
// app.get("/join", )
// app.get("/livedata", )

const PORT = process.env.PORT || 8000

const start = async () => {
  try {
    await connectDB(process.env.MONGO_URI)
    app.listen(PORT, () => console.log(`listening on port ${PORT}`))
  } catch (err) {
    console.log(err)
  }
}

start()

// Download insomnia
// https://updates.insomnia.rest/downloads/windows/latest?app=com.insomnia.app
