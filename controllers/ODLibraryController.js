
/**
 * ODLibrary Controller
 * Manage request related to the OneDrive libraries
 *
 */

var errController    = require('./ErrorController')
var oDLibScanService = require('../services/ODLibScanService')
var oDMCollectionService = require('../services/ODMCollectionService')
var oDClient = require('../RClients/ODClient')

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

exports.getODMCollection = function (req, res) {
  if (!req.query.odemail) {
    errController.sendBadParams(res)
  }
  else {
    oDMCollectionService.retrieveODMCollection(req.query.odemail, function (err, oDMCollection) {
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
    var oDEmail = req.query.odemail
    oDLibScanService.inProgressScans(oDEmail, function (oDBScan) {
      if (oDBScan) {
        res.status(409)
        res.json({
          message: 'Currently there is another scan in progress'
        })
      }
      else {
        oDLibScanService.scanLibraries(oDEmail)
        res.status(200)
        res.json({
          message: 'Libraries background scan started'
        })
      }
    })
  }
}

exports.scanStatus = function (req, res) {
  if (!req.query.odemail) {
    errController.sendBadParams(res)
  }
  else {
    oDLibScanService.getScanStatus(req.query.odemail, function (err, oDBScan) {
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