
/**
 * ODLibrary Entity
 * Represents the root folder of a collection of
 * music folders for an OneDrive User.
 *
 * @author Giovanni Aguirre
 * @Created on: Apr 25, 2014
 */

var mongoose = require('mongoose')

var ODLibrarySchema = new mongoose.Schema({
  ODEmail: String,
  folderName: String,
  folderId: String,
})

module.exports = mongoose.model('ODLibrary', ODLibrarySchema)
