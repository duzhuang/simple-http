// 启动 TCP 服务器
const net = require('net');
const Parser = require("./parser")
const HTTPConnectionState = require('./stateMachine');
const Router = require('./Router');

const router = new Router();

// 日志中间件 
router.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
    next();
});

// 错误处理中间件 
router.use((req, res, next) => {
    try {
        next();
    } catch (err) {
        console.error("Error:", err); res(500, 'Internal Server Error', '<h1>500 Internal Server Error</h1>', false);
    }
});

router.route("/index.html", (req) => {
    return router.buildResponse(200, 'OK', '<h1>Hello World</h1>', req.headers['connection'] === 'keep-alive');
})

router.route("/test", (req) => {
    return router.buildResponse(200, 'OK', '<h1>Test</h1>', req.headers['connection'] === 'keep-alive');
})

router.route("/stream", (req) => {
    // 返回 chundked 响应
    let response = 'HTTP/1.1 200 OK\r\n' +
        'Content-Type: text/plain\r\n' +
        'Transfer-Encoding: chunked\r\n' +
        `Connection: ${req.headers['connection'] === 'keep-alive' ? 'keep-alive' : 'close'}\r\n` +
        '\r\n';

    const chunks = ['Hello', 'World', 'From', 'Chunked'];
    chunks.forEach((chunk) => {
        response += chunk.length.toString(16) + '\r\n';
        response += chunk + '\r\n';
    });
    response += '0\r\n\r\n';
    return response;
})



const server = net.createServer((socket) => {

    let buffer = '';
    const parser = new Parser();
    const stateMachine = new HTTPConnectionState(parser, socket);

    // 尝试解析 HTTP 请求
    socket.on('data', (chunk) => {
        // 尝试解析完整的 HTTP 请求
        const request = stateMachine.onData(chunk);

        if (request) {
            const response = router.dispatch(request);

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
