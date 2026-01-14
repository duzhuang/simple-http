function handleRequest(req) {
    if (req.path === '/index.html') {
        return buildResponse(200, 'OK', '<h1>Hello, Node.js HTTP!</h1>');
    }
    return buildResponse(404, 'Not Found', '<h1>404 Not Found</h1>');
}

function buildResponse(status, message, body) {
    return `HTTP/1.1 ${status} ${message}\r\n` +
        `Content-Type: text/html\r\n` +
        `Content-Length: ${Buffer.byteLength(body)}\r\n` +
        `Connection: close\r\n` +
        `\r\n` +
        body;
}

module.exports = { handleRequest };
