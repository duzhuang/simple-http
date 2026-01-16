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
    const bodyRaw = buffer.slice(headerEnd + 4);
    
    // 请求的类别
    if (headers["content-length"]) {
        const length = parseInt(headers["content-length"], 10);
        body = bodyRaw.slice(0, length);
    } else if (headers["transfer-encoding"] === "chunked") {
        // 解析 chunked 编码的请求体
        body = parseChunkedBody(bodyRaw);
    } else {
        body = bodyRaw;
    }

    return {
        method,
        path,
        version,
        headers,
        body
    };
}

function parseChunkedBody(data) {
    let pos = 0;
    let body = '';

    while (true) {
        // 找到 chunk 长度行
        const lineEnd = data.indexOf('\r\n', pos);
        if (lineEnd === -1) {
            break;
        }

        const sizeHex = data.slice(pos, lineEnd);
        const size = parseInt(sizeHex, 16);

        pos = lineEnd + 2; // 跳过 '\r\n'

        if (size === 0) {
            break; // 结束
        }

        // 读取 chunk 数据
        body += data.slice(pos, pos + size);
        pos += size + 2; // 跳过数据和结尾的 '\r\n'
    }

    return body;
}

module.exports = {
    parseHttpRequest
}