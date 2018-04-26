var net = require('net');

var server = net.createServer();
//接受新的客户端连接
server.on('connection', function(socket){
    console.log('got a new connection');

    //socket.write(JSON.stringify({"aid":"door","iid":"doorStatus","value":"open"}));
    socket.write(JSON.stringify({"aid":"sound","iid":"decibel","value":30}));
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

server.listen(4001);