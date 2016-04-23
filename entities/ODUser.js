
/**
 * ODUser entity
 * Represents each OneDrive user.
 *
 * @author Giovanni Aguirre
 * @Created on: Sep 19, 2015
 */

var mongoose = require('mongoose')

var ODUserSchema = new mongoose.Schema({
  ODEmail: String,
  email: String,
  refToken: String,
  tokenCreatedAt: [String],
})

module.exports = mongoose.model('ODUser', ODUserSchema)
