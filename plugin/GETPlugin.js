const path = require('path');
const fs = require('fs');
const helper = require('../helper');

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

  if (requestPathStat.isDirectory()) {
    // 200, DIRECTORY CONTENT
    const directoryContent = fs.readdirSync(requestPath);
    let contentHTML = `
      <html>
        <head>
          <title>
            Index of ${message.request.path}
          </title>
        </head>
        <body>
          <h1>Index of ${message.request.path}</h1>
          <hr/>
          <table>
    `
    contentHTML += directoryContent.map(item => {
      const itemPath = path.resolve(requestPath, item);
      const itemStat = fs.statSync(itemPath);
      let size = '-';
      if (itemStat.isFile()) {
        size = itemStat.size;
      }

      return `
        <tr><td>${item}</td><td>${itemStat.mtime}</td><td>${size}</td></tr>
      `
    }).join("");

    contentHTML += '</table><hr/></body></html>';

    message.response.body = Buffer.from(contentHTML, 'utf-8');
    message.response.status = 200;
    return message;

  } else if (requestPathStat.isFile()) {
    // 200, FILE CONTENT
    const rangeHeader = helper.readHeader(message.request.headers, "Range");

    if (rangeHeader) {

      const matchedRange = rangeHeader.match(/bytes\s*=\s*(\d+)\s*-\s*(\d+)/i);
      if (matchedRange) {
        const content = Buffer.alloc(matchedRange[2] - matchedRange[1] + 1);

        const fd = fs.openSync(requestPath);
        fs.readSync(fd, content, 0, content.length, parseInt(matchedRange[1]));
        fs.closeSync(fd);

        message.response.status = 206;
        message.response.body = content;
        helper.setHeader(
          message.response.headers, 
          "Content-Range", 
          `bytes ${matchedRange[1]}-${matchedRange[2]}/${requestPathStat.size}`
        )
        return message;
      }
    }

    message.response.status = 200;
    message.response.body = fs.readFileSync(requestPath)
    return message;
  }

  message.response.status = 404;
  return message;
}