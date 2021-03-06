
/**
 * OneDrive Music Collections
 *
 * @author Giovanni Aguirre
 * @Created on Apr 28, 2016
 */

var mongoose = require('mongoose')

var ODSongOwnerSchema = new mongoose.Schema({
  ODEmail: String
})

var ODSongSchema = new mongoose.Schema({
  title: String,
  duration: Number,
  durationFormatted: String,
  trackNo: Number,
  bitRate: Number,
  genre: String,
  fileId: String,
  ownerInfo: ODSongOwnerSchema
})

var ODAlbumSchema = new mongoose.Schema({
  coverUrl: String,
  title: String,
  year: Number,
  disc: Number,
  discCount: Number,
  songs: [ODSongSchema]
})

var ODArtistSchema = new mongoose.Schema({
  name: String,
  albums: [ODAlbumSchema]
})


var ODMusicCollectionSchema = new mongoose.Schema({
  email: String,
  artists: [ODArtistSchema]
})

module.exports = mongoose.model('ODMCollection', ODMusicCollectionSchema)
