/**
 * 路由分发（类似 Express 的简化版）
 */
class Router {
    constructor() {
        this.routes = {};
    }

    /**
     * 注册路由
     * @param {string} path - 路由路径
     * @param {function} handler - 路由处理函数
     */
    use(path, handler) {
        this.routes[path] = handler;
    }

    /**
     * 路由分发
     * @param {object} req - 请求对象
     */
    dispatch(req) {
        const handler = this.routes[req.path];
        if (handler) {
            return handler(req);
        } else {
            return this.buildResponse(404, 'Not Found', '<h1>404 Not Found</h1>', req.headers['connection'] === 'keep-alive');
        }
    }

    /**
     * 构建响应
     * @param {number} status - 状态码
     * @param {string} message - 状态消息
     * @param {string} body - 响应体
     * @param {boolean} keepAlive - 是否保持连接
     * @returns {string} - 响应字符串
     */
    buildResponse(status, message, body, keepAlive) {
        return `HTTP/1.1 ${status} ${message}\r\n` +
            `Content-Type: text/html\r\n` +
            `Content-Length: ${Buffer.byteLength(body)}\r\n` +
            `Connection: ${keepAlive ? 'keep-alive' : 'close'}\r\n` +
            `\r\n` +
            `${body}`;
    }
}


module.exports = Router;