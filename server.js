
/**
 * Backend server for the TREEM Project
 *
 */

var bodyParser = require('body-parser')
var express    = require('express')
var passport   = require('passport')

var mongoose = require('mongoose')
var bson     = require('bson')

var APIRouter = require('./routers/APIRouter')


//
// Application midleware initialization

var app = express()
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))
app.use(passport.initialize())


//
// DB Connection params

var DBParams = {
  host: '172.17.0.1',
  port: '27017',
  db: 'treem'
}

var connUrl = "mongodb://" + DBParams.host + '/' + DBParams.db
mongoose.connect(connUrl)

//
// Routes configuration

app.use('/api', APIRouter)


//
// Application startup

var server = app.listen(3000, function () {

  var host = server.address().address;
  var port = server.address().port;

  console.log('API Listening at:  http://', host, port);
});
