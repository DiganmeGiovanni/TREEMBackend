

var ODLibrary     = require('../entities/ODLibrary')
var ODMCollection = require('../entities/ODMusicCollection')
var ODBScan       = require('../entities/ODBackgroundScan')

var oDMCService = require('./ODMusicCollectionService')
var oDClient    = require('../RClients/ODClient')


function abortOldScan(oDEmail, callback) {
  var oldestDate = new Date()
  oldestDate.setTime(oldestDate.getTime() - (1000 * 60 * 10))

  var query = {
    ODEmail: oDEmail,
    inProgress:1,
    success: 0,
    startedAt: { $lt: oldestDate}
  }

  ODBScan.findOne(query, function (err, oDBScan) {
    if (!err && oDBScan) {

      oDBScan.inProgress = 0
      oDBScan.success = 1
      oDBScan.save(function () {
        callback()
      })
    }
    else {
      callback()
    }
  })
}

function clearScanningTask(oDEmail) {
  ODBScan.findOne({ODEmail: oDEmail}, function (err, oDBScan) {
    if (!err && oDBScan) {

      oDBScan.inProgress = 0
      oDBScan.success    = 1

      oDBScan.save(function (oDBScan) { })
    }
  })
}

function getScanStatus(oDEmail, callback) {
  abortOldScan(oDEmail, function () {
    ODBScan.findOne({ODEmail: oDEmail}, function (err, oDBScan) {
      callback(err, oDBScan)
    })
  })
}

function inProgressScan(oDEmail, callback) {
  abortOldScan(oDEmail, function () {
    ODBScan.findOne({ODEmail: oDEmail, inProgress: 1, success: 0}, function (err, oDBScan) {
      if (!err) {
        callback(oDBScan)
      }
      else {
        callback(null)
      }
    })
  })
}

function registerScanningTask(oDEmail, callback) {
  ODBScan.findOne({ODEmail: oDEmail}, function (err, oDBScan) {
    if (!err) {
      if (oDBScan) {

        oDBScan.startedAt  = new Date()
        oDBScan.inProgress = 1
        oDBScan.success    = 0

        oDBScan.save(function (oDBScan) {
          callback()
        })
      }
      else {
        var oDBScan = new ODBScan({
          ODEmail: oDEmail,
          startedAt: new Date(),
          inProgress: 1,
          success: 0
        })

        oDBScan.save(function (oDBScan) {
          callback()
        })
      }
    }
  })
}

/**
 * Search for user's ODMCollection in database, if collection is not
 * found, creates a new one (BUT NOT SAVES) and sends it to callback.
 *
 * @param  {string}   oDEmail  ODMCollection owner
 * @param  {Function} callback Called with (err, oDMCollection)
 */
function retrieveODMCollection(oDEmail, callback) {
  ODMCollection.findOne({ODEmail: oDEmail}, function (err, oDMCollection) {
    if (err) { callback(err, null) }
    else if (!oDMCollection) {
      oDMCollection = new ODMCollection({
        ODEmail: oDEmail,
        artists: []
      })

      callback(null, oDMCollection)
    }
    else {
      callback(null, oDMCollection)
    }
  })
}

/**
 * Retrieves all the children folders inside a given parent folder.
 *
 * @param  {string}   oDEmail  Owner of parent folder
 * @param  {string}   folderId Id of parent folder
 * @param  {Function} callback Called with an array of children ids
 */
function retrieveSubFoldersIds(oDEmail, folderId, callback) {
  oDClient.listChildren(oDEmail, folderId, 'folder', function (err, response) {
    if (err) { callback([]) }
    else {
      var subFolders = response.value
      var subFoldersIds = []

      for (var i = 0; i < subFolders.length; i++) {
        subFoldersIds.push(subFolders[i].id)
      }

      callback(subFoldersIds)
    }
  })
}

/**
 * Iterates over each user's library and sends it
 * to {@link #scanLibrary()}
 *
 * @param  {string} ODEmail Owner of libraries to scan
 */
function scanLibraries(oDEmail) {

  // Get all user libraries
  ODLibrary.find({ODEmail: oDEmail}, function (err, oDLibraries) {
    if (err) { console.error(err) }
    else {
      if (oDLibraries.length > 0) {

        // Retrieves user ODMCollection
        retrieveODMCollection(oDEmail, function (err, oDMCollection) {
          if (err) { console.error(err) }
          else {

            // Register scanning process
            registerScanningTask(oDEmail, function () {

              // Scan each library
              oDMCollection.artists = []
              scanEachLibrary(0, oDLibraries, oDMCollection)
            })
          }
        })
      }
    }
  })
}

function scanEachLibrary(index, oDLibraries, oDMCollection) {
  if (index < oDLibraries.length) {
    var oDEmail = oDLibraries[index].ODEmail
    var foldersIds = []
    foldersIds.push(oDLibraries[index].folderId)

    scanFolders(0, foldersIds, oDEmail, oDMCollection, function () {

      // Go to next library only when previous scan finishes
      index = index + 1
      scanEachLibrary(index, oDLibraries, oDMCollection)
    })
  }
  else {
    oDMCollection.save(function (err, oDMCollection) {

      clearScanningTask(oDMCollection.ODEmail)
      console.log('Libraries scanning finished')
    })
  }
}

function scanFolders(index, foldersIds, oDEmail, oDMCollection, callback) {
  if (index < foldersIds.length) {

    // Retrieve all audio from folder
    scanAudioFolder(oDEmail, foldersIds[index], oDMCollection, function () {

      // Retrieve all sub folders inside folder and scan each one
      retrieveSubFoldersIds(oDEmail, foldersIds[index], function (subFoldersIds) {
        if (subFoldersIds.length > 0) {
          scanFolders(0, subFoldersIds, oDEmail, oDMCollection, function () {

            index = index + 1
            scanFolders(index, foldersIds, oDEmail, oDMCollection, callback)
          })
        }
        else {

          index = index + 1
          scanFolders(index, foldersIds, oDEmail, oDMCollection, callback)
        }
      })
    })
  }
  else {
    callback()
  }
}

function scanAudioFolder(oDEmail, folderId, oDMCollection, callback) {
  oDClient.listChildren(oDEmail, folderId, 'audio', function (err, response) {
    if (!err) {
      var audioFiles = response.value
      oDMCService.upsertAudioFiles(audioFiles, oDMCollection)
      callback()
    }
    else{
      console.error('Error al scanear el folder: ' + folderId)
      callback()
    }
  })
}


exports.getScanStatus   = getScanStatus
exports.inProgressScans = inProgressScan
exports.scanLibraries   = scanLibraries
