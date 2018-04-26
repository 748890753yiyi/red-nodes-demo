var net = require('net');
var process=require('process');

var server = net.createServer();
//接受新的客户端连接
server.on('connection', function(socket){
    console.log('got a new connection');

    setInterval(function(){
        socket.write(JSON.stringify({"aid":"door111","iid":"doorStatus","value":19}));
    },5000)

    //socket.write(JSON.stringify({"aid":"sound","iid":"decibel","value":30}));
    //从连接中读取数据
    var str = "";
    socket.on('data', function(data){
         str += data.toString("utf8");
        //删除被关闭的连接
        socket.on('close', function(){
            console.log('connection closed');
            console.log('server got data:', str);
        });
    });
});

server.on('error', function(err){
    console.log('Server error:', err.message);
});

server.on('close', function(){
    console.log('Server closed');
});
process.on('uncaughtException',function(err){
    console.log("要看一看是什么错误: "+err.stack);
    // throw err;
});
server.listen(4000);