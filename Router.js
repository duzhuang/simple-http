/**
 * 路由分发（类似 Express 的简化版）
 */
class Router {
    constructor() {
        // 路由
        this.routes = {};
        // 中间件
        this.middlewares = [];
    }

    /**
     * 注册中间件
     * @param {function} middleware - 中间件函数
     */
    use(middleware) {
        this.middlewares.push(middleware);
    }

    /**
     * 注册路由
     * @param {string} path - 路由路径
     * @param {function} handler - 路由处理函数
     */
    route(path, handler) {
        this.routes[path] = handler;
    }

    /**
     * 执行中间件链
     * @param {object} req - 请求对象
     * @param {function} resBuilder - 响应构建函数
     * @param {function} done - 完成回调函数
     */
    runMiddleware(req, resBuilder, done) {
        let index = 0;
        // 执行下一步
        const next = () => {            
            if (index >= this.middlewares.length) {
                done();
                return;
            }            
            const mw = this.middlewares[index++];
            mw(req, resBuilder, next);
        }
        next();
    }

    /**
     * 路由分发
     * @param {object} req - 请求对象
     */
    dispatch(req) {

        let response = null;

        const resBuilder = (status, message, body, keepAlive) => {            
            response = this.buildResponse(status, message, body, keepAlive);            
        };

        this.runMiddleware(req, resBuilder, () => {
            const handler = this.routes[req.path];
            if (handler) {
                response = handler(req);
            } else {
                response = this.buildResponse(404, 'Not Found', '<h1>404 Not Found</h1>', req.headers['connection'] === 'keep-alive');
            }
        })

        return response;
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