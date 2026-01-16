class Parser {

    /**
     * 解析 HTTP 请求头
     * @param {string} headerPart - 原始头部字符串
     * @returns {object} headers - 解析后的头部键值对
     */
    parseHeaders(headerPart) {
        const lines = headerPart.split('\r\n');
        const [method, path, version] = lines[0].split(' ');

        const headers = {};
        for (let i = 1; i < lines.length; i++) {
            const [key, value] = lines[i].split(': ');
            if (key && value) {
                headers[key.toLowerCase()] = value;
            }
        }        

        return { method, path, version, headers };
    }

    /**
     * 解析带 Content-Length 的消息体
     * @param {string} buffer - 当前缓冲区
     * @param {number} length - 消息体长度
     * @returns {object} { body, remaining, complete }
     */
    parseContentLengthBody(buffer, length) {
        if (buffer.length < length) {
            return { body: '', remaining: buffer, complete: false };
        }
        const body = buffer.slice(0, length);
        const remaining = buffer.slice(length);
        return { body, remaining, complete: true };
    }

    /**
     * 解析 chunked 编码的消息体
     * @param {string} buffer - 当前缓冲区
     * @returns {object} { body, remaining, complete }
     */
    parseChunkedBody(buffer) {
        let pos = 0;
        let body = '';

        while (true) {
            const lineEnd = buffer.indexOf('\r\n', pos);
            if (lineEnd === -1) {
                return { body, remaining: buffer, complete: false }; // 数据未完整
            }

            const sizeHex = buffer.slice(pos, lineEnd);
            const size = parseInt(sizeHex, 16);
            pos = lineEnd + 2;

            if (size === 0) {
                // chunked 结束
                const endMarker = buffer.indexOf('\r\n', pos);
                if (endMarker === -1) {
                    return { body, remaining: buffer, complete: false };
                }
                const remaining = buffer.slice(endMarker + 2);
                return { body, remaining, complete: true };
            }

            if (buffer.length < pos + size + 2) {
                return { body, remaining: buffer, complete: false }; // 数据未完整
            }

            body += buffer.slice(pos, pos + size);
            pos += size + 2; // 跳过数据和结尾的 \r\n
        }
    }

    /**
     * 解析完整 HTTP 请求（头部 + 消息体）
     * @param {string} buffer - 当前缓冲区
     * @returns {object|null} request - 解析后的请求对象
     */
    parseHttpRequest(buffer) {
        const headerEnd = buffer.indexOf('\r\n\r\n');
        if (headerEnd === -1) return null;

        const headerPart = buffer.slice(0, headerEnd);
        const { method, path, version, headers } = this.parseHeaders(headerPart);

        let body = '';
        let remaining = buffer.slice(headerEnd + 4);

        if (headers['content-length']) {
            const length = parseInt(headers['content-length'], 10);
            const parsed = this.parseContentLengthBody(remaining, length);
            if (!parsed.complete) return null;
            body = parsed.body;
            remaining = parsed.remaining;
        } else if (headers['transfer-encoding'] === 'chunked') {
            const parsed = this.parseChunkedBody(remaining);
            if (!parsed.complete) return null;
            body = parsed.body;
            remaining = parsed.remaining;
        }

        return { method, path, version, headers, body, remaining };
    }
}

module.exports = Parser;
