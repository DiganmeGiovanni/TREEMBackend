
/**
 * OneDrive Music Collection service
 */

var ODMCollection = require('../entities/ODMusicCollection')


/**
 * Search for given audio files inside the collection [Same song name,
 * album and artist]. If some song is not found, it adds it to collection.
 *
 * @param  {array}         audioFiles    Items collection returned from OneDrive
 *                                       API request
 * @param  {string{        oDEmail       Files owner
 * @param  {ODMCollection} oDMCollection Where to search/add the song
 */
function upsertAudioFiles(audioFiles, oDEmail, oDMCollection) {
  for (var i = 0; i < audioFiles.length; i++) {
    upsertAudioFile(audioFiles[i], oDEmail, oDMCollection)
  }
}

/**
 * Search for a given audio file inside the collection [Same song name,
 * album and artist]. If the song is not found, it adds it to collection.
 *
 * @param  {Object}        audioFile     Item taken from OneDrive API request.
 * @param  {string}        oDEmail       File owner
 * @param  {ODMCollection} oDMCollection Where to search/add the song
 */
function upsertAudioFile(audioFile, oDEmail, oDMCollection) {
  var artistName   = audioFile.audio.artist
  var albumTitle   = audioFile.audio.album
  var albumYear    = audioFile.audio.year
  var albumDisc    = audioFile.audio.disc
  var albumDCount  = audioFile.audio.discCount
  var songTitle    = audioFile.audio.title
  var songDuration = audioFile.audio.duration
  var songTrackNo  = audioFile.audio.track
  var songGenre    = audioFile.audio.genre
  var songBitRate  = audioFile.audio.bitrate
  var fileId       = audioFile.id

  // TODO Create durationFormatted ...
  

  var album = {
    title: albumTitle,
    year: albumYear,
    disc: albumDisc,
    discCount: albumDCount
  }

  var song = {
    title: songTitle,
    duration: songDuration,
    durationFormatted: '00:00',
    trackNo: songTrackNo,
    bitRate: songBitRate,
    genre: songGenre,
    fileId: fileId,
    ownerInfo: {
      ODEmail: oDEmail
    }
  }

  var oDArtist = retrieveODArtist(artistName, oDMCollection)
  var oDAlbum  = retrieveODAlbum(album, oDArtist)
  upsertSong(song, oDAlbum)
}

/**
 * Search a given song inside an album, if the song is not found,
 * it inserts it to album songs.
 *
 * @param  {Object} song     Properties: title: String, duration, durationFormatted
 *                           trackNo, bitRate, genre, fileId,
 * @param  {ODAlbum} oDAlbum Album where to upsert the song
 * @return {ODSong}          The found/created song
 */
function upsertSong(song, oDAlbum) {

  for (var i = 0; i < oDAlbum.songs.length; i++) {
    if (oDAlbum.songs[i].title.trim().toUpperCase() === song.title.trim().toUpperCase()) {
      return oDAlbum.songs[i]
    }
  }

  var oDSong = {
    title: song.title,
    duration: song.duration,
    durationFormatted: song.durationFormatted,
    trackNo: song.trackNo,
    bitRate: song.bitRate,
    genre: song.genre,
    fileId: song.fileId,
    ownerInfo: song.ownerInfo
  }

  oDAlbum.songs.push(oDSong)
  return oDAlbum.songs[oDAlbum.songs.length - 1]
}

/**
 * Search for an album inside artist's albums, if the album is not found
 * it creates it and adds it to the albums list.
 *
 * @param  {Object}   album    Properties required: title, year, disc, discCount
 * @param  {ODArtist} oDArtist Where to search the album
 * @return {ODAlbum}           The found/created ODAlbum
 */
function retrieveODAlbum(album, oDArtist) {

  for (var i = 0; i < oDArtist.albums.length; i++) {
    if (oDArtist.albums[i].title.trim().toUpperCase() === album.title.trim().toUpperCase()) {
      return oDArtist.albums[i]
    }
  }

  var oDAlbum = {
    title: album.title,
    year: album.year,
    disc: album.disc,
    discCount: album.discCount,
    songs: []
  }

  oDArtist.albums.push(oDAlbum)
  return oDArtist.albums[oDArtist.albums.length - 1]
}

/**
 * Search for an artist inside collection, if the artist is not found,
 * it creates it and adds it to collection.
 *
 * @param  {string}              artistName    Name of the artist to search
 * @param  {ODMCollection}   oDMCollection Collection where to search
 * @return {ODArtist} The found/created ODArtist
 */
function retrieveODArtist(artistName, oDMCollection) {

  for (var i = 0; i < oDMCollection.artists.length; i++) {
    if (oDMCollection.artists[i].name.trim().toUpperCase() === artistName.trim().toUpperCase()) {
      return oDMCollection.artists[i]
    }
  }

  var oDArtist = {
    name: artistName,
    albums: []
  }

  oDMCollection.artists.push(oDArtist)
  return oDMCollection.artists[oDMCollection.artists.length - 1]
}

/**
 * Search for user's ODMCollection in database, if collection is not
 * found, creates a new one (BUT NOT SAVES) and sends it to callback.
 *
 * @param  {string}   email  ODMCollection owner
 * @param  {Function} callback Called with (err, oDMCollection)
 */
function retrieveODMCollection(email, callback) {
  ODMCollection.findOne({email: email}, function (err, oDMCollection) {
    if (err) { callback(err, null) }
    else if (!oDMCollection) {

      oDMCollection = new ODMCollection({
        email: email,
        artists: []
      })

      callback(null, oDMCollection)
    }
    else {
      callback(null, oDMCollection)
    }
  })
}


exports.upsertAudioFiles = upsertAudioFiles
exports.retrieveODMCollection = retrieveODMCollection
