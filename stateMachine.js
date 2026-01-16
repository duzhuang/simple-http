/** 状态管理类 */
class HTTPConnectionState {

    constructor(parser, socket) {
        this.state = 'READING_HEADERS';
        this.buffer = '';
        this.headers = null;
        this.parser = parser;
        this.socket = socket;
    }

    onData(chunk) {
        this.buffer += chunk.toString();

        while (true) {

            // 读取请求头
            if (this.state === 'READING_HEADERS') {
                const headerEnd = this.buffer.indexOf('\r\n\r\n');
                if (headerEnd === -1) break;
                const headerPart = this.buffer.slice(0, headerEnd);
                const parsedHeader = this.parser.parseHeaders(headerPart);  
                
                // 保存完整的请求头信息
                this.method = parsedHeader.method;
                this.path = parsedHeader.path;
                this.version = parsedHeader.version;
                this.headers = parsedHeader.headers;
                
                this.buffer = this.buffer.slice(headerEnd + 4);

                if (this.headers["content-length"]) {
                    this.state = 'READING_BODY';
                } else if (this.headers['transfer-encoding'] === 'chunked') {
                    this.state = 'READING_BODY';
                } else {
                    this.state = 'COMPLETE';
                    return {
                        method: this.method,
                        path: this.path,
                        version: this.version,
                        headers: this.headers,
                        body: ''
                    };
                }
            }

            // 读取请求体
            if (this.state === 'READING_BODY') {
                let body = "";
                if (this.headers["content-length"]) {
                    const length = parseInt(this.headers["content-length"], 10);
                    const parsed = this.parser.parseContentLengthBody(this.buffer, length);
                    body = parsed.body;
                    this.buffer = parsed.remaining;
                } else if (this.headers['transfer-encoding'] === 'chunked') {
                    const parsed = this.parser.parseChunkedBody(this.buffer);
                    if (!parsed.complete) break;
                    body = parsed.body;
                    this.buffer = parsed.remaining;
                }

                this.state = 'COMPLETE';

                return {
                    method: this.method,
                    path: this.path,
                    version: this.version,
                    headers: this.headers,
                    body: body
                };
            }

            // 处理完成一个请求后，重置状态
            if (this.state === "COMPLETE") {
                this.state = 'READING_HEADERS';
            }
        }
    }

}

module.exports = HTTPConnectionState;