/**
 * ODUser Controller
 *
 * @author Giovanni Aguirre
 * @Created on: Aug 3, 2014
 * @Updated on: Apr 25, 2015
 */

var errController = require('./ErrorController')
var oDUserService = require('../services/ODService')

var ODUser = require('../entities/ODUser')


exports.postODUser = function (req, res) {
  if (!req.body.email || !req.body.odemail || !req.body.reftoken) {
    errController.sendBadParams(ress)
  }
  else {

    var oDUser = new ODUser({
      ODEmail: req.body.odemail,
      email: req.body.email,
      refToken: req.body.reftoken,
      tokenCreatedAt: new Date()
    })

    oDUserService.registerUser(oDUser, function (err, oDUser) {
      if (err) { errController.send500(res) }
      else {
        res.status(201)
        res.json(oDUser)
      }
    })
  }
}

exports.getODUser = function (req, res) {
  if (!req.query.odemail) {
    errController.sendBadParams(res)
  }
  else {
    oDUserService.findUser(req.query.odemail, function (err, oDUser) {
      if (err) { errController.send500(res) }
      else if(!oDUser) {
        errController.sendError(res, 404, 'ODUser not found')
      }
      else {
        res.status(200)
        res.json(oDUser)
      }
    })
  }
}

/**
 * Get all the OneDrive accounts registered with a specific user
 * @param  {Object} req Expressjs generated request object
 * @param  {Object} res Expressjs generated response object
 */
exports.getODUsersForUser = function (req, res) {
  if (!req.query.email) {
    errController.sendBadParams(res)
  }
  else {
    oDUserService.findODEmails(req.query.email, function (err, oDEmails) {
      if (err) { errController.send500(res) }
      else {
        res.status(500)
        res.json(oDEmails)
      }
    })
  }
}
