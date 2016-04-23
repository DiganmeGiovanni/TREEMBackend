
/**
 * User Entity
 * Represents to each application user
 *
 * @author Giovanni Aguirre
 * @Created on: Sep 19, 2014
 */

var mongoose = require('mongoose')

var userSchema = new mongoose.Schema({
  fname: String,
  lname: String,
  email: String,
  country: String,
  birthday: Date,
  enabled: Boolean,
  lastSession: Date,
  createdAt: Date,
  sessionCount: Number
})

module.exports = mongoose.model('User', userSchema)
