const fs = require('fs');
const path = require('path');
const helper = require('../helper');

module.exports = (message, env) => {
  // 如果status不为0，表示服务器已经做出响应，那么可以直接返回（response已经产生了）
  // 如果status为0，表示服务器没有做出响应
  if (message.response.status) {
    return message;
  }

  // 如果路径不合法，返回403
  if (message.request.path.indexOf('.') === 0) {
    message.response.status = 403;
    return message;
  }

  helper.setHeader(message.response.headers, "Access-Control-Allow-Origin", "http://a.com");
  helper.setHeader(message.response.headers, "Access-Control-Allow-Credentials", "true");

  return message;
}