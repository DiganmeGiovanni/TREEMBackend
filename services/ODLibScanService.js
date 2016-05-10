

var ODLibrary     = require('../entities/ODLibrary')
var ODBScan       = require('../entities/ODBackgroundScan')

var oDService = require('./ODService')
var oDMCService = require('./ODMCollectionService')
var oDClient    = require('../RClients/ODClient')


function abortOldScan(email, callback) {
  var oldestDate = new Date()
  oldestDate.setTime(oldestDate.getTime() - (1000 * 60 * 10))

  var query = {
    email: email,
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

function clearScanningTask(email) {
  ODBScan.findOne({email: email}, function (err, oDBScan) {
    if (!err && oDBScan) {

      oDBScan.inProgress = 0
      oDBScan.success    = 1

      oDBScan.save(function (oDBScan) { })
    }
  })
}

function getScanStatus(email, callback) {
  abortOldScan(email, function () {
    ODBScan.findOne({email: email}, function (err, oDBScan) {
      callback(err, oDBScan)
    })
  })
}

function inProgressScan(email, callback) {
  abortOldScan(email, function () {
    ODBScan.findOne({email: email, inProgress: 1, success: 0}, function (err, oDBScan) {
      if (!err) {
        callback(oDBScan)
      }
      else {
        callback(null)
      }
    })
  })
}

function registerScanningTask(email, callback) {
  ODBScan.findOne({email: email}, function (err, oDBScan) {
    if (!err) {
      if (oDBScan) {

        oDBScan.startedAt  = new Date()
        oDBScan.inProgress = 1
        oDBScan.success    = 0

        oDBScan.save(function (err, oDBScan) {
          callback()
        })
      }
      else {
        var oDBScan = new ODBScan({
          email: email,
          startedAt: new Date(),
          inProgress: 1,
          success: 0
        })

        oDBScan.save(function (err, oDBScan) {
          callback()
        })
      }
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
function scanLibraries(email) {

  // Get all user ODAccounts
  oDService.findODEmails(email, function (err, oDEmails) {
    if (!err) {

      if (oDEmails.length > 0) {
        
        // Retrieve user's music collection
        oDMCService.retrieveODMCollection(email, function (err, oDMCollection) {
          if (!err) {

            registerScanningTask(email, function () {

              // Scan each account libraries
              scanEachAccount(0, oDEmails, oDMCollection)
            })
          }
        })
      }
    }
  })
}

function scanEachAccount(index, oDEmails, oDMCollection) {
  if (index < oDEmails.length) {
    var oDEmail = oDEmails[index]

    // Retrieve all account libraries
    ODLibrary.find({ODEmail: oDEmail}, function (err, oDLibraries) {
      if (err) { console.error(err) }
      else {

        scanEachLibrary(0, oDLibraries, oDMCollection, function () {

          index = index + 1
          scanEachAccount(index, oDEmails, oDMCollection)
        })
      }
    })
  }
  else {
    oDMCollection.artists.sort(function (artist1, artist2) {
      if (artist1.name > artist2.name) {
        return 1
      }
      else if (artist1.name < artist2.name) {
        return -1
      }
      else {
        return 0
      }
    })

    oDMCollection.save(function (err, oDMCollection) {

      clearScanningTask(oDMCollection.email)
      console.log('Libraries scanning for: ' + oDMCollection.email + ' finished')
    })
  }
}

function scanEachLibrary(index, oDLibraries, oDMCollection, callback) {
  if (index < oDLibraries.length) {
    var oDEmail = oDLibraries[index].ODEmail
    var foldersIds = []
    foldersIds.push(oDLibraries[index].folderId)

    scanFolders(0, foldersIds, oDEmail, oDMCollection, function () {

      // Go to next library only when previous scan finishes
      index = index + 1
      scanEachLibrary(index, oDLibraries, oDMCollection, callback)
    })
  }
  else {
    callback()
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
  setTimeout(function () {
    oDClient.listChildren(oDEmail, folderId, 'audio', function (err, response) {
      if (!err) {
        var audioFiles = response.value
        oDMCService.upsertAudioFiles(audioFiles, oDEmail, oDMCollection)
        callback()
      }
      else{
        console.error('Error al scanear el folder: ' + folderId)
        callback()
      }
    })

  }, 400)

}


exports.getScanStatus   = getScanStatus
exports.inProgressScans = inProgressScan
exports.scanLibraries   = scanLibraries
