// 启动 TCP 服务器
const net = require('net');
const { parseHttpRequest } = require('./parser');
const { handleRequest } = require('./handlers');

const server = net.createServer((socket) => {

    let buffer = '';

    // 尝试解析 HTTP 请求
    socket.on('data', (chunk) => {
        console.log("收到的TCP数据流:", chunk);
        // 将当前数据块转换为字符串并追加到缓冲区
        buffer += chunk.toString();
        console.log("当前缓冲区原始数据:", JSON.stringify(buffer));
        // 尝试解析完整的 HTTP 请求
        const request = parseHttpRequest(buffer);
        console.log("解析后的HTTP请求:", request);
        // 如果解析成功，处理请求
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


// 如何测试
// 在浏览器中访问 http://localhost:8080/index.html
