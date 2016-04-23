
/**
 * ODUser Service
 *
 * @Created on: Apr 22, 2016
 */

var User   = require('../entities/User')
var ODUser = require('../entities/ODUser')


exports.findUser = function (oDEmail, callback) {
  ODUser.findOne({'ODEmail': oDEmail}, function (err, oDUser) {
    if (err) { callback(err, null) }
    else {
      callback(null, oDUser)
    }
  })
}

exports.findODEmails = function (email, callback) {
  ODUser.find({'email': email}, function (err, oDUsers) {
    if (err) { callback(err, null) }
    else {
      var oDEmails = []
      for (var i=0; i <oDUsers.length; i++) {
        oDEmails.push(oDUsers[i].ODEmail)
      }

      callback(null, oDEmails)
    }
  })
}

exports.registerUser = function (oDUser, callback) {
  userExists(oDUser.ODEmail, function (err, userExists) {
    if (err) { callback(err, null) }
    else if (userExists) {
      ODUser.findOne({ODEmail: oDUser.ODEmail}, function (err, oDUser) {
        if (err) { callback(err, null) }
        else {
          callback(null, oDUser)
        }
      })
    }
    else {
      oDUser.save(function (err, oDUser) {
        if (err) { callback(err, null) }
        else {
          callback(null, oDUser)
        }
      })
    }
  })
}

/**
 * Checks if there is a ODUser with provided email in database
 * @param  {String}   oDEmail  Email to check
 * @param  {Function} callback Called with results (err, userExists)
 */
function userExists(oDEmail, callback) {
  ODUser.findOne({ODEmail: oDEmail}, function (err, oDUser) {
    if (err) {
      callback(err, null)
    }
    else if (!oDUser) {
      callback(null, false)
    }
    else {
      callback(null, true)
    }
  })
}
