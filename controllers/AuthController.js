
/**
 * ApiToken Controller
 *
 * @author Giovanni Aguirre
 * @Created on: Apr 12, 2015
 * @Updated on: Sep 19, 2015
 */

var passport       = require('passport')
var BearerStrategy = require('passport-http-bearer')

var ApiToken = require('../entities/APIToken')


/**
 * First, search for an unexpired token. If token does not exists,
 * creates a new one and send to callback.
 *
 * NOTE: Verify thirdparty token before to use this function to obtain
 * a valid token
 *
 * @param  {string}   email    User's account email [Make sure the
 *                             email is registered]
 * @param  {string}   clientId web | mobile | desktop
 * @param  {Function} callback When token's ready call with
 *                             params: (err, apiToken)
 */
exports.getApiToken = function (email, clientId, callback) {
  searchUnexpiredToken(email, clientId, function (err, apiToken) {

    if (apiToken) {
      callback(err, apiToken)
    }
    else { // Generates new apiToken valid for next 24 hours

      var expirationDate = new Date()
      expirationDate.setDate(expirationDate.getDate() + 1)

      var apiToken = new ApiToken({
        token: generateToken(email, 50),
        clientId: clientId,
        email: email,
        expiresAt: expirationDate
      })

      apiToken.save(function(err, apiToken) {
        callback(err, apiToken)
      })
    }
  })
}

exports.isAuth = passport.authenticate('bearer', { session: false});

// TODO: Check if token belongs to connected user
passport.use(new BearerStrategy(function (token, callback) {

  var qryParameters = {
    'token': token,
    'expiresAt': { $gt: new Date() },
  }

  ApiToken.findOne(qryParameters, function (err, apiToken) {
    if (err) return callback(err);
    if (!apiToken) { return callback(null, false) }
    else {
      return callback(null, apiToken, { scope: '*'})
    }
  })

}))

/**
 * Busca un token no expirado para el usuario con el email
 * y clientId indicados
 * Search for a non expired token for user owner of given
 * email and clientId
 *
 * @param {String} email Token owner's email
 * @param {String} clientId : web | mobile | desktop
 * @param {Function} callback Function to exec when query completes
 */
function searchUnexpiredToken(email, clientId, callback) {
  var qryParameters = {
    'email': email,
    'clientId': clientId,
    expiresAt: { $gt: new Date() },
  }

  ApiToken.findOne(qryParameters, function (err, token) {
    if (err || !token) {
      callback(err, null)
    }
    else {
      callback(null, token)
    }
  })
}

/**
 * Generates random tokens and insert the user email
 * (base64 encoded) in token string
 *
 * @param length :: Number of chars in token before and after
 *                  base64 encoded user email string
 * @return {String} [0 ... length random chars] + '{base64 email}'
 *                     + [0 ... length random chars]
 */
function generateToken(email, length) {
  var buffer     = []
  var chars      = 'IJKLMNOPQRSTUVWXYZ-*abcdefghijklmnopqrstuvwxyz$%^0123456789'
  var charlenght = chars.length

  for (var i=0; i<length; ++i) {
    buffer.push(chars[getRandomInt(0, charlenght-1)])
  }

  var emailBase64 = new Buffer(email).toString('base64')
  for (var i=0; i<length; ++i) {
    buffer.push(chars[getRandomInt(0, charlenght-1)])
  }

  return buffer.join('')
}

/**
 * Gets a random int between min and max
 *
 * @param  {int} min Minimal posible value
 * @param  {int} max Maximal posible value
 * @return {int} Random int between min and max
 */
function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max-min + 1)) + min
}
