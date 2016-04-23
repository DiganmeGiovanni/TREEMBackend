
/**
 * Error controller
 *
 * Creates and send errors in json format to clients
 *
 * @author Giovanni Aguirre
 * @Created on: Apr 25, 2014
 */

/**
 * Sends a JSON formated error to the client
 *
 * @param {Response} res      Response to cliente (From expressjs)
 * @param {Integer}  status   Http status code [500, 404 etc.]
 * @param {String}   message  Message with short description about error
 * @param {JSON Obj} extra    A Json object with any extra info for client
 *
 */
exports.sendError = function(res, status, message, extra) {
  if (!extra) {
    extra = {}
  }

  res.status(status)
  res.json({
    message: message,
    extra: extra,
  })
}

exports.send500 = function (res) {
  res.status(500)
  res.json({
    message: 'Internal Server Error'
  })
}

exports.sendBadParams = function (res) {
  res.status(400)
  res.json({
    message: 'Bad params in request'
  })
}
