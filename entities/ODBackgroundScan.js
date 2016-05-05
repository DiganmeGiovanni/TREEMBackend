
/**
 * Background Job
 * Represents a task to scan user library/libraries while client is not
 * waiting for a response from server.
 *
 * @author Giovanni Aguirre
 * @Created on Apr 28, 2016
 */

var mongoose = require('mongoose')

var ODBackgroundScanSchema = new mongoose.Schema({
  ODEmail: String,
  startedAt: Date,
  inProgress: Boolean,
  success: Boolean
})

module.exports = mongoose.model('ODBackgroundScan', ODBackgroundScanSchema)
