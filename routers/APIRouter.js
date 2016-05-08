
/**
 * Manages all supported routes for api endpoints.
 *
 * @author Giovanni Aguirre
 * @Created on: December 13, 2015
 */

var express = require('express')
var router  = express.Router();

/*var authController      = require('../controllers/AuthController')*/
var userController      = require('../controllers/UserController')
var oDUserController    = require('../controllers/ODUserController')
var oDLibraryController = require('../controllers/ODLibraryController')


/**
 * Enables CORS and Authorization headers for
 * api endpoints.
 */
router.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*")
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Authorization, Accept")

  next()
})

/**
 * Single check route to verify API server is alive
 *
 */
router.get('/', function (req, res) {
  res.status = 200
  res.send("API Backend is working")
})


// *****************************************************************************
// ** ROUTING FOR USERS

router.get('/user',  userController.getUser)
router.post('/user', userController.postUser)


// *****************************************************************************
// ** ROUTING FOR ONE DRIVE
//
router.get('/od/accounts', oDUserController.getODUsersForUser)
router.get('/od/user',     oDUserController.getODUser)

router.get('/od/codelogin',oDUserController.oDCodeLogin)
router.get('/od/redirect', oDUserController.oDRedirect)

router.get('/od/children', oDUserController.getChildren)

router.get('/od/libraries',  oDLibraryController.getODLibraries)
router.get('/od/scanlibs',   oDLibraryController.scanLibraries)
router.get('/od/scanstatus', oDLibraryController.scanStatus)

router.post('/od/user',    oDUserController.postODUser)
router.post('/od/library', oDLibraryController.postODLibrary)


module.exports = router
