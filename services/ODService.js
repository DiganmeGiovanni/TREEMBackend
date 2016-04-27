
/**
 * ODUser Service
 *
 * @Created on: Apr 22, 2016
 */

var User   = require('../entities/User')
var ODUser = require('../entities/ODUser')
var ODAToken = require('../entities/ODAToken')

var oDClient = require('../RClients/ODClient')


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

exports.obtainAccessToken = function (oDEmail, callback) {

  var queryParams = {
    ODEmail: oDEmail,
    expiresAt: { $gt: new Date() }
  }

  ODAToken.findOne(queryParams, function (err, oDAToken) {
    if (err || !oDAToken) {
      console.log('Valid access token NOT FOUND')
      ODUser.findOne({ODEmail: oDEmail}, function (err, oDUser) {
        if (err) { callback(err, null) }
        else {
          oDClient.accessTokenFromRefToken(oDUser.refToken, function (err, accessToken) {
            if (err) {
              callback(err, null)
            }
            else {
              var expDate = new Date()
              expDate.setTime(expDate.getTime() + 50000)

              oDAToken = new ODAToken({
                ODEmail: oDEmail,
                aToken: accessToken,
                expiresAt: expDate
              })

              oDAToken.save(function (err, oDAToken) {
                if (err) { callback(err, null) }
                else {
                  callback(null, oDAToken.aToken)
                }
              })
            }
          })
        }
      })
    }
    else {
      console.log('Valid access token WAS FOUND')
      callback(null, oDAToken.aToken)
    }
  })
}

exports.upsertUser = function (oDUser, callback) {
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














