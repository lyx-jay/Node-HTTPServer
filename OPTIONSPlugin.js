const fs = require('fs');
const path = require('path');
const helper = require('./helper');

module.exports = (message, env) => {
  // 如果status不为0，表示服务器已经做出响应，那么可以直接返回（response已经产生了）
  // 如果status为0，表示服务器没有做出响应
  if (message.response.status) {
    return message;
  }

  if (message.request.method !== 'OPTIONS') {
    return message;
  }
  // 如果路径不合法，返回403
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

  if (requestPathStat.isFile()) {
    helper.setHeader(message.response.headers, "Access-Control-Allow-Methods", "GET, PUT, DELETE");
    message.response.status = 200;
    return message;
  }

  helper.setHeader(message.response.headers, "Access-Control-Allow-Methods", "GET, POST");
  message.response.status = 200;
  return message;
}