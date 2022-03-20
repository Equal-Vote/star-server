var jwt = require('jsonwebtoken')

const getUser = (req: any, res: any, next: any) => {
  //This will not verify whether the signature is valid, need to add verification
  req.user = jwt.decode(req.cookies.id_token)
  next()
}

const isLoggedIn = (req: any, res: any, next: any) => {
  if (!req.user)
    return res.status('400').json({
      error: "Not Logged In"
    })
  next()
}

module.exports = {
  getUser,
  isLoggedIn,
}