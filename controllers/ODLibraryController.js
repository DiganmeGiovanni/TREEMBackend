
/**
 * ODLibrary Controller
 * Manage request related to the OneDrive libraries
 *
 */
var request = require('request');
var errController    = require('./ErrorController')
var oDLibScanService = require('../services/ODLibScanService')
var oDMCollectionService = require('../services/ODMCollectionService')
var oDClient = require('../RClients/ODClient')

var ODLibrary        = require('../entities/ODLibrary')


exports.albumCoverUrl = function (req, res) {
  if (!req.query.odemail || !req.query.albumtitle || !req.query.artistname ||
      !req.query.fileid) {
    errController.sendBadParams(res)
  }
  else {
    var fileId = req.query.fileid
    var oDEmail = req.query.odemail
    var albumTitle = req.query.albumtitle
    var artistName = req.query.artistname

    //
    // Try to search in spotify
    var query = "artist:" + artistName + " album:" + albumTitle
    var params = {
      method: 'GET',
      url: 'https://api.spotify.com/v1/search',
      qs: {
        q: query,
        type: 'album'
      }
    }

    request(params, function (err, response, body) {
      if (!err && res.statusCode >= 200 && res.statusCode < 300) {
        body = JSON.parse(body)

        if (body.albums && body.albums.items[0]) {
          var coverUrl = body.albums.items[0].images[0].url
          res.status(200)
          res.json({
            coverUrl: coverUrl
          })
        }
        else {
          oDClient.itemThumbnails(oDEmail, fileId, function (err, thumbnails) {
            if (err) { errController.send500(res) }
            else {
              if (thumbnails.value[0]) {
                var coverUrl = thumbnails.value[0].small.url
                if (thumbnails.value[0].medium) {
                  coverUrl = thumbnails.value[0].medium.url
                }
                if (thumbnails.value.large) {
                  coverUrl = thumbnails.value[0].large.url
                }

                res.status(200)
                res.json({
                  coverUrl: coverUrl
                })
              }
              else {
                res.status(200)
                res.json({
                  coverUrl: 'data:image/png;base64,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'
                })
              }
            }
          })
        }
      }
    })
  }
}

exports.getODLibraries = function (req, res) {
  if (!req.query.odemail) {
    errController.sendBadParams(res)
  }
  else {
    var oDEmail = req.query.odemail

    ODLibrary.find({ODEmail: oDEmail}, function (err, oDLibraries) {
      if (err) { errController.send500(res) }
      else {
        res.status(200)
        res.json(oDLibraries)
      }
    })
  }
}

exports.getODMCollection = function (req, res) {
  if (!req.query.email) {
    errController.sendBadParams(res)
  }
  else {
    oDMCollectionService.retrieveODMCollection(req.query.email, function (err, oDMCollection) {
      if (err) {
        errController.send500(res)
      }
      else {
        res.status(200)
        res.json(oDMCollection)
      }
    })
  }
}

exports.getItem = function (req, res) {
  if (!req.query.odemail || !req.query.itemid) {
    errController.sendBadParams(res)
  }
  else {
    var oDEmail = req.query.odemail
    var itemId  = req.query.itemid

    oDClient.itemData(oDEmail, itemId, function (err, itemData) {
      if (err) {
        errController.send500(res)
      }
      else {
        res.status(200)
        res.json(itemData)
      }
    })
  }
}

exports.itemContentsUrl = function (req, res) {
  if (!req.query.odemail || !req.query.itemid) {
    errController.sendBadParams(res)
  }
  else {
    var oDEmail = req.query.odemail
    var itemId  = req.query.itemid

    oDClient.itemData(oDEmail, itemId, function (err, itemData) {
      if (err) {
        errController.send500(res)
      }
      else {
        res.status(200)
        res.json({
          itemId: itemId,
          contentsUrl: itemData['@content.downloadUrl']
        })
      }
    })
  }
}

exports.postODLibrary = function (req, res) {
  if (!req.body.folderid || !req.body.odemail || !req.body.foldername) {
    console.log(req.body)
    errController.sendBadParams(res)
  }
  else {
    var oDEmail    = req.body.odemail
    var folderId   = req.body.folderid
    var folderName = req.body.foldername

    var oDLibrary = new ODLibrary({
      ODEmail: oDEmail,
      folderName: folderName,
      folderId: folderId
    })

    oDLibrary.save(function (err, oDLibrary) {
      if (err) { errController.send500(res) }
      else {
        res.status(201)
        res.json(oDLibrary)
      }
    })
  }
}

exports.scanLibraries = function (req, res) {
  if (!req.query.email) {
    errController.sendBadParams(res)
  }
  else {
    var email = req.query.email

    oDLibScanService.inProgressScans(email, function (oDBScan) {
      if (oDBScan) {
        res.status(409)
        res.json({
          message: 'Currently there is another scan in progress'
        })
      }
      else {
        oDLibScanService.scanLibraries(email)
        res.status(200)
        res.json({
          message: 'Libraries background scan started'
        })
      }
    })
  }
}

exports.scanStatus = function (req, res) {
  if (!req.query.email) {
    errController.sendBadParams(res)
  }
  else {
    oDLibScanService.getScanStatus(req.query.email, function (err, oDBScan) {
      if (err || !oDBScan) {
        errController.send500(res)
      }
      else {
        res.status(200)
        res.json(oDBScan)
      }
    })
  }
}
