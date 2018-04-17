module.exports = function(RED) {
    function NewNode(config) {
        RED.nodes.createNode(this,config);
        var node = this;
        node.on('input', function(msg) {
            var tempObj = Object.assign({},config);
            console.log("tempObj: ",tempObj);
            msg.payload = tempObj;
            msg.topic = "CO2METER";
            node.send(msg);

        });
    }
    RED.nodes.registerType('CO2METER',NewNode);

    var net = require('net');
    var connectionPoolClient = {};
    var connectionPoolServer = {};
    var reconnectTime = 10000;
    var socketTimeout = null;
    var host = "127.0.0.1";
    var port = 4000;
    function co2Input(config) {
        console.log("tcp in: ",config);
        RED.nodes.createNode(this,config);
        var node = this;
        node.closing = false;
        node.connected = false;
        function tcpClient(){
            var client;
            var reconnectTimeout;
            var end = false;
            var setupTcpClient = function() {
                var id = (1+Math.random()*4294967295).toString(16);
                client = net.connect(port, host, function() {
                    console.log("已经连接到远程服务器");
                    node.connected = true;
                });
                client.setKeepAlive(true,120000);
                connectionPoolClient[id] = client;

                client.on('data', function (data) {
                    console.log("客户端tcp接收到的数据");
                    var str = data.toString("utf8");
                    //console.log("tcpClient接收到的地址： ",str);
                    var reciveObj = JSON.parse(str);
                    //console.log("reviceObj: ",reciveObj);
                    //console.log("config: ",config);

                    var msg={};
                    msg.payload = {aid:"outlet",iid:"OnOff",value:true};
                    msg.topic = "outlet";
                    node.send(msg);
                    
                });
                client.on('end', function() {
                    console.log("tcpClient关闭");
                    
                    
                });
                client.on('close', function() {
                    node.connected = false;
                    delete connectionPoolClient[id];
                    if (!node.closing) {
                        if (end) { // if we were asked to close then try to reconnect once very quick.
                            end = false;
                            reconnectTimeout = setTimeout(setupTcpClient, 20);
                        }
                        else {
                            reconnectTimeout = setTimeout(setupTcpClient, reconnectTime);
                        }
                    } else {
                        if (node.done) { node.done(); }
                    }
                });
                client.on('error', function(err) {
                    console.error(err);
                    node.log(err);
                });
            }
            setupTcpClient();
            
            node.on("input",function(msg){
                
            })
            node.on('close', function(done) {
                node.done = done;
                node.closing = true;
                if (client) { client.destroy(); }
                clearTimeout(reconnectTimeout);
                if (!node.connected) { done(); }
            });
        }
        tcpClient();
        
    }
    RED.nodes.registerType('CO2METER in',co2Input);

    function co2Output(config){
        console.log("output config: ",config);
        RED.nodes.createNode(this,config);
        var node = this;
        node.connected = false;
        node.on("input",function(msg){
            var clientOutput = net.connect(port, host, function() {
                    console.log("已经连接到远程服务器");
                    node.connected = true;
                    var tempObj = Object.assign(msg,config);
                    clientOutput.write(JSON.stringify(tempObj));
                    clientOutput.end();
                });
                //client.setKeepAlive(true,120000);
                
                clientOutput.on('end', function() {
                    console.log("tcpClientOutput关闭");
                    
                    
                });
                clientOutput.on("data", function(data) {
                    clientOutput.write(msg);
                    clientOutput.end();
                })
                clientOutput.on('close', function() {
                    node.connected = false;
                    //node.done();
                });
                clientOutput.on('error', function(err) {
                    //console.error(err);
                    node.log(err);
                });
        })
        node.on('close', function(done) {
            node.done = done;
            if (clientOutput) { clientOutput.destroy(); }
            if (!node.connected) { done(); }
        });
        
        
    }
    RED.nodes.registerType('CO2METER out',co2Output);
}