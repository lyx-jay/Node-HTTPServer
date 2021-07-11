const net  = require('net');
const worker = require('./worker');

// connection 是一个Socket类型

net
  .createServer((connection) => {
    worker(connection);
})
  .listen(80);  // 默认监听80端口