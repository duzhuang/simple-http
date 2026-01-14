// 解析 HTTP 请求
function parseHttpRequest(buffer) {
    // 检查是否包含完整的 HTTP 请求头
    const headerEnd = buffer.indexOf('\r\n\r\n');
    if (headerEnd === -1) {
        return null;
    }

    // 提取请求的头
    const headerPart = buffer.slice(0, headerEnd);
    // 解析请求行
    const requestLines = headerPart.split('\r\n');
    // 解析请求方法、路径和 HTTP 版本
    const [method, path, version] = requestLines[0].split(' ');

    const headers = {};
    // 解析请求头
    for (let i = 1; i < requestLines.length; i++) {
        const line = requestLines[i];
        const [key, value] = line.split(': ');
        headers[key.toLowerCase()] = value;
    }

    // 提取请求体
    let body = "";
    if (headers['content-length']) {
        const length = parseInt(headers['content-length'], 10);
        body = buffer.slice(headerEnd + 4, headerEnd + 4 + length);
    }

    return {
        method,
        path,
        version,
        headers,
        body
    };
}

module.exports = {
    parseHttpRequest
}