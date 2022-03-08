var jwt = require('jsonwebtoken')

const getUser = (req:any, res:any, next:any) => {
    //This will not verify whether the signature is valid, need to add verification
    req.user = jwt.decode(req.cookies.id_token)
    next()
  }

module.exports = {
    getUser,
}