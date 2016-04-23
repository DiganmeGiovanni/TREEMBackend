/**
 * ODUser Controller
 *
 * @author Giovanni Aguirre
 * @Created on: Aug 3, 2014
 * @Updated on: Apr 25, 2015
 */

var errController = require('./ErrorController')
var oDClient      = require('../RClients/ODClient')
var oDUserService = require('../services/ODService')
var userService   = require('../services/UserService')

var ODUser = require('../entities/ODUser')
var TREEMCons = require('../constants/TREEMConstants')


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


////////////////////////////////////////////////////////////////////////////////
// OneDrive authentication functions (Next functions do all the magic)

exports.oDCodeLogin = function (req, res) {
  if (!req.query.code) {
    errController.sendBadParams(res)
  }
  else {
    oDClient.signinWithCode(req.query.code, function (err, user) {
      if (err) {
        errController.send500(res)
      }
      else {
        userService.registerSession(user)

        res.status(200)
        res.json(user)
      }
    })
  }
}

/**
 * This function is called by OneDrive api during signin/login process
 * with an authenticatoin code. User will be redirected to main webclient
 * page with authenticatoin code as query parameter.
 *
 * @param  {[type]} req [description]
 * @param  {[type]} res [description]
 */
exports.oDRedirect = function (req, res) {
  if (!req.query.code) {
    errController.sendBadParams(res)
  }
  else {
    var targetUrl = TREEMCons.TREEM_WEBCLIENT_URL + "?odcode=" + req.query.code

    res.redirect(targetUrl)
    res.end()
  }
}
