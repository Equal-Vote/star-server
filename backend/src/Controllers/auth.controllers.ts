import { isConstructorDeclaration } from "typescript"

var jwt = require('jsonwebtoken')

const getUser = (req: any, res: any, next: any) => {
  console.log('-> auth.getUser')
  //This will not verify whether the signature is valid, need to add verification
  req.user = jwt.decode(req.cookies.id_token)
  next()
}

const isLoggedIn = (req: any, res: any, next: any) => {
  console.log(`-> auth.isLoggedIn ${!!req.user}`)
  if (!req.user)
    return res.status('400').json({
      error: "Not Logged In"
    })
  next()
}

const assertOwnership = (req: any, res: any, next: any) => {
  console.log(`-> auth.assertOwnership ${req.body.Election.owner_id} ${req.user.sub}`)
  if (req.body.Election.owner_id != req.user.sub){
    console.log("NOT AUTHORIZED")
    return res.status('400').json({
      error: "Unauthorized: User does not own election"
    })
  }
  next()
}

module.exports = {
  getUser,
  isLoggedIn,
  assertOwnership,
}