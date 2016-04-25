/**
 * User controller
 * Manage user web service request
 *
 * @author Giovanni Aguirre
 * @Created on: Jul 14, 2014
 * @updated on: Apr 25, 2015
 */

var errController = require('./ErrorController')
var userService = require('../services/UserService')
var User = require('../entities/User')

/**
 * Manages user posts
 * @param  {Object} req Express framework request object
 * @param  {Object} res Express framework response object
 *
 */
exports.postUser = function (req, res) {
  if (!req.body.fname || !req.body.lname || !req.body.email || !req.body.country) {
    errController.sendBadParams(res)
  }
  else {
    var user = new User({
      fname       : req.body.fname,
      lname       : req.body.lname,
      email       : req.body.email,
      country     : req.body.country,
      birthday    : new Date(),
      enabled     : true,
      lastSession : new Date(),
      createdAt   : new Date(),
      sessionCount: 1
    })

    userService.upsertUser(user, function (err, user) {
      if (err) { errController.send500(res) }
      else {
        res.status(201)
        res.json(user)
      }
    })
  }
}

exports.getUser = function (req, res) {
  if (!req.query.email) { errController.sendBadParams(res) }
  else {
    userService.findUser(req.query.email, function (err, user) {
      if (err) { errController.send500() }
      else if (!user) {
        errController.sendError(res, 404, 'User not found')
      }
      else {
        res.status(200)
        res.json(user)
      }
    })
  }
}
