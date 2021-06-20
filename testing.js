var cookieSession = require('cookie-session')
var express = require('express')

var app = express()

app.set('trust proxy', 1) // trust first proxy

app.use(cookieSession({
  name: 'sess',
  secret: "7134743777217A25432A462D4A614E64"
}))

app.get('/', function (req, res, next) {
  const before = JSON.stringify(req.session)
  // Update views
  req.session.views = (req.session.views || 0) + 1

  // Write response
  res.end(`${before} - ${req.session.views} views`)
})

app.listen(3000)