const fs = require('fs');
const path = require('path');

module.exports = (message, env) => {
  // 如果status不为0，表示服务器已经做出响应，那么可以直接返回（response已经产生了）
  // 如果status为0，表示服务器没有做出响应
  if (message.response.status) {
    return message;
  }

  if (message.request.method !== 'POST') {
    return message;
  }

  // 如果路径不合法，直接返回
  if (message.request.path.indexOf('.') === 0) {
    message.response.status = 403;
    return message;
  }

  const requestPath = path.resolve(env.root + message.request.path);

  // 对于已经存在的资源，不应该使用POST创建
  if (fs.existsSync(requestPath)) {
    message.response.status = 403;
    return message;
  }

  fs.mkdirSync(path.dirname(requestPath), {recursive: true});
  fs.writeFileSync(requestPath, message.request.body);

  message.response.status = 201;
  return message;

}