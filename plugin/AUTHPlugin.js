const fs = require('fs');
const path = require('path');
const helper = require('../helper');

module.exports = (message, env) => {
  // 如果status不为0，表示服务器已经做出响应，那么可以直接返回（response已经产生了）
  // 如果status为0，表示服务器没有做出响应
  if (message.response.status) {
    return message;
  }

  const authData = helper.readHeader(message.request.headers, "Authorization");
  // username:admin password: 123456
  if (authData) {
    const parsedAuthData = authData.match(/basic\s*(\w+)/i);
    if (parsedAuthData[1]) {
      const authPair = Buffer.from(parsedAuthData[1], 'base64').toString().split(":");
      if (authPair[0] === 'admin' && authPair[1] === '123456') {
        // make session, set cookie
        const sessionID = 'session_' + new Date().getTime();

        const sessionPath = path.resolve(env.session, sessionID);
        fs.writeFileSync(sessionPath, authPair[0]);

        helper.setHeader(message.response.headers, "Set-Cookie", 'sessionID=' + sessionID);

        return message;
      } else {
        // 当信息不正确的时候，让用户重新输入 authData
        message.response.status = 401;
        helper.setHeader(message.response.headers, "WWW-Authenticate", 'Basic realme="login"');
        return message;
      }
    }
  }

  const cookieData = helper.readHeader(message.request.headers, "Cookie");
  if (cookieData) {
    const parsedCookieData = cookieData.match(/sessionid=(session_\d+)/);
    if (parsedCookieData && parsedCookieData[1]) {
      const sessionPath = path.resolve(env.session, parsedCookieData[1]);
      if (fs.existsSync(sessionPath)) {
        if (fs.readFileSync(sessionPath).toString() === 'admin') {
          return message;
        }
      }
    }
  }

  message.response.status = 401;
  helper.setHeader(message.response.headers, "WWW-Authenticate", 'Basic realme="login"');
  return message;

}