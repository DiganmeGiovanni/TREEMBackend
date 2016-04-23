
/**
 * User Service.
 *
 * @Created on Apr 22, 2016
 */

var User = require('../entities/User')


exports.findUser = function (email, callback) {
  User.findOne({'email': email}, function (err, user) {
    if (err) { callback(err, null) }
    else {
      callback(null, user)
    }
  })
}

exports.registerUser = function (user, callback) {
  userExists(user.email, function (err, userExists) {
    if (err) { callback(err, null) }
    else if (userExists) {
      User.findOne({'email': user.email}, function (err, user) {
        if (err) { callback(err, null) }
        else {
          callback(null, user)
        }
      })
    }
    else {
      user.save(function (err, user) {
        if (err) { callback(err, null) }
        else {
          callback(null, user)
        }
      })
    }
  })
}

/**
 * Checks if there is a user with provided email in database
 * @param  {String}   email    Email to check
 * @param  {Function} callback Called with results (err, userExists)
 */
function userExists(email, callback) {
  User.findOne({'email': email}, function (err, user) {
    if (err) {
      callback(err, null)
    }
    else if (!user) {
      callback(null, false)
    }
    else {
      callback(null, true)
    }
  })
}
