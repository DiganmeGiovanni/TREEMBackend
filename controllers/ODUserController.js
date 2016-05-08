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
var ODLibrary = require('../entities/ODLibrary')
var TREEMCons = require('../constants/TREEMConstants')


////////////////////////////////////////////////////////////////////////////////
/// Calls that consumes local data

exports.postODUser = function (req, res) {
  if (!req.body.email || !req.body.odemail || !req.body.reftoken) {
    errController.sendBadParams(res)
  }
  else {

    var oDUser = new ODUser({
      ODEmail: req.body.odemail,
      email: req.body.email,
      refToken: req.body.reftoken,
      tokenCreatedAt: new Date()
    })

    oDUserService.upsertUser(oDUser, function (err, oDUser) {
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
        res.status(200)
        res.json(oDEmails)
      }
    })
  }
}


////////////////////////////////////////////////////////////////////////////////
/// Calls that consumes OneDrive API

exports.getChildren = function (req, res) {
  if (!req.query.odemail) {
    errController.sendBadParams(res)
  }
  else {
    var oDEmail  = req.query.odemail
    var parentId = req.query.parentId
    var filter   = req.query.filter

    oDClient.listChildren(oDEmail, parentId, filter, function (err, children) {
      if (err) {
        errController.send500(res)
      }
      else {

        //
        // Check if folder is library or not
        ODLibrary.find({ODEmail: oDEmail}, function (err, oDLibraries) {
          if (err) { errController.send500(res) }
          else {
            for (var i=0; i< children.value.length; i++) {
              var isLibrary = false
              for (var j=0; j< oDLibraries.length; j++) {
                if (oDLibraries[j].folderId === children.value[i].id) {
                  isLibrary = true
                }
              }

              children.value[i].isTREEMLibrary = isLibrary
            }

            res.status(200)
            res.json(children)
          }
        })
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
 * This function is called by OneDrive api during signing/login process
 * with an authentication code. User will be redirected to main web client
 * page with authentication code as query parameter.
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
