
/**
 * ODAToken Entity
 * Access token for OneDrive users generated by OneDrive API.
 *
 * @author Giovanni Aguirre
 * @Created on: May 7, 2015
 */

var mongoose = require('mongoose')

var ODATokenSchema = new mongoose.Schema({
  ODEmail: String,
  aToken: String,
  expiresAt: Date,
})

module.exports = mongoose.model('ODAToken', ODATokenSchema)
