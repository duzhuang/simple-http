// 启动 TCP 服务器
const net = require('net');
const Parser = require("./parser")
const { handleRequest } = require('./handlers');
const HTTPConnectionState = require('./stateMachine');

const server = net.createServer((socket) => {

    let buffer = '';
    const parser = new Parser();
    const stateMachine = new HTTPConnectionState(parser, socket);

    // 尝试解析 HTTP 请求
    socket.on('data', (chunk) => {
        // 尝试解析完整的 HTTP 请求
        const request = stateMachine.onData(chunk);

        if (request) {
            const response = handleRequest(request);            

            socket.write(response);

            //判断链接是否关闭
            if (request.headers['connection'] === 'close') {
                socket.end();
            } else {
                // 清空缓冲区，准备处理下一个请求
                buffer = '';
            }
        }
    });

});



server.listen(8080, () => {
    console.log('Server is running on port 8080');
});
