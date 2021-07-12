const RequestParser  = require('./RequestParser');
const makeResponse = require('./makeResponse');

const POSTPlugin = require('./plugin/POSTPlugin');
const GETPlugin = require('./plugin/GETPlugin');
const PUTPlugin = require('./plugin/PUTPlugin');
const DELETEPlugin = require('./plugin/DELETEPlugin');
const AUTHPlugin = require('./plugin/AUTHPlugin');
const CORSPlugin = require('./plugin/CORSPlugin');
const OPTIONSPlugin = require('./plugin/OPTIONSPlugin');
const CACHEPlugin = require('./plugin/CACHEPlugin');


const path = require('path');

module.exports = (connection) => {

  const parser = new RequestParser();
  const env = {
    root: path.resolve('./www'),
    session: path.resolve('./session')
  }
  /**
   * buffer:<Buffer 47 45 54 20 2f 31 2e 74 78 74 20 48 54 54 50 2f 31 2e 31 0d 0a 55 73 65 72 2d 41 67 65 6e 74 3a 20 50 6f 73 74 6d 61 6e 52 75 6e 74 69 6d 65 2f 37 2e ... 151 more bytes>
   */
  connection.on('data', (buffer) => {
    parser.append(buffer);
  });

  parser.on('finish', (message) => {
    // Auth 鉴权
    // plugin 0
    // ...
    // make response

    message = CORSPlugin(message, env);
    message = OPTIONSPlugin(message, env);
    message = AUTHPlugin(message, env);
    message = CACHEPlugin(message, env);
    message = POSTPlugin(message, env);
    message = GETPlugin(message, env);
    message = PUTPlugin(message, env);
    message = DELETEPlugin(message, env);

    connection.end(makeResponse(message));
  })


}