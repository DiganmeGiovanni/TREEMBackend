
/**
 * APITOKEN Entity
 * Represents a token generated by backend for client apps
 * token:     The generated token string
 * clientId:  web | mobile | desktop
 * email:     The token owner email
 * expiresAt: Token expiration date
 *
 * @author Giovanni Aguirre
 * @Created on: Apr 12, 2015
 */

var mongoose = require('mongoose')

var apiTokenSchema = new mongoose.Schema({
  token: String,
  clientId: String,
  email: String,
  expiresAt: Date,
})

module.exports = mongoose.model('ApiToken', apiTokenSchema)
