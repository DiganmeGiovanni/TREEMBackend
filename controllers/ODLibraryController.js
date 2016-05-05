
/**
 * ODLibrary Controller
 * Manage request related to the OneDrive libraries
 *
 */

var errController    = require('./ErrorController')
var oDLibraryScanner = require('../services/ODLibraryScanner')

var ODLibrary        = require('../entities/ODLibrary')



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
  if (!req.query.odemail) {
    errController.sendBadParams(res)
  }
  else {
    // TODO Check for other scans in progress
    oDLibraryScanner.scanLibraries(req.query.odemail)

    res.status(200)
    res.json({
      'message': 'Library background scanning programed'
    })
  }
}

exports.scanLibrary = function (req, res) {
  if (!req.query.odemail || !req.query.folderid) {
    errController.sendBadParams(res)
  }
  else {
    var oDEmail = req.query.odemail
    var folderId= req.query.folderid

    ODLibrary.find({ODEmail: oDEmail, folderId: folderId}, function (err, oDLibrary) {
      if (err) {
        errController.send500(res)
      }
      else {
        // TODO Check for other scans in progress
        oDLibraryScanner.scanLibrary(oDLibrary)

        res.status(200)
        res.json({
          message: 'Library background scanning started'
        })
      }
    })
  }
}
