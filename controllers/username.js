const getUsername = (req, res) => {
  const username = req.session.username
  res.send(username)
}

const postUsername = (req, res) => {
  const username = req.body.username
  req.session.username = username
  res.status(201).send(username)
}

module.exports = {
  getUsername,
  postUsername
}