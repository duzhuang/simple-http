function handleRequest(req) {    
    const keepAlive = req.headers['connection'] === 'keep-alive';

    if (req.path === '/index.html') {
        return buildResponse(200, 'OK', '<h1>Hello, Node.js HTTP!</h1>', keepAlive);
    }

    if (req.path === "/test") {
        return buildResponse(200, 'OK', '<h1>Test Content Length</h1>', keepAlive);
    }

    if (req.path === "/stream") {
        // 模拟流式响应        
        return buildChunkedResponse(['Hello ', 'World ', 'from ', 'chunked!'], keepAlive);
    }

    return buildResponse(404, 'Not Found', '<h1>404 Not Found</h1>', keepAlive);
}

function buildResponse(status, message, body, keepAlive = true) {
    return `HTTP/1.1 ${status} ${message}\r\n` +
        `Content-Type: text/html\r\n` +
        `Content-Length: ${Buffer.byteLength(body)}\r\n` +
        `Connection: ${keepAlive ? 'keep-alive' : 'close'}\r\n` +
        `\r\n` +
        body;
}

function buildChunkedResponse(chunks, keepAlive = true) {
    let response = 'HTTP/1.1 200 OK\r\n' +
        'Content-Type: text/plain\r\n' +
        'Transfer-Encoding: chunked\r\n' +
        `Connection: ${keepAlive ? 'keep-alive' : 'close'}\r\n` +
        '\r\n';
    for (const chunk of chunks) {
        response += chunk.length.toString(16) + '\r\n'; // 长度用十六进制 
        response += chunk + '\r\n';
    }
    response += '0\r\n\r\n'; // 结束块 return response;        
    return response;
}

module.exports = { handleRequest };
