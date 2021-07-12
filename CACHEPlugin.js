const path = require('path');
const fs = require('fs');
const helper = require('./helper');

module.exports = (message, env) => {

  if (message.response.status) {
    return message;
  }

  if (message.request.method !== 'GET') {
    return message;
  }

  // 如果路径不合法，直接返回
  if (message.request.path.indexOf('.') === 0) {
    message.response.status = 403;
    return message;
  }

  const requestPath = path.resolve(env.root + message.request.path);

  if (!fs.existsSync(requestPath)) {
    message.response.status = 404;
    return message;
  }

  const requestPathStat = fs.statSync(requestPath);

  if(requestPathStat.isFile()) {
    const requestEtag = helper.readHeader(message.request.headers, "If-None-Match");
    if (requestEtag && requestEtag.trim() === (requestPathStat.mtimeMs.toString(16) + requestPathStat.size.toString(16))) {
      message.response.status = 304;
      return message;
    }
  }


  helper.setHeader(message.response.headers, "Cache-Control", "max-age=3600");
  helper.setHeader(message.response.headers, "Last-Modified", requestPathStat.mtime);
  helper.setHeader(message.response.headers, "Etag", requestPathStat.mtimeMs.toString(16) + requestPathStat.size.toString(16));
  return message;
}