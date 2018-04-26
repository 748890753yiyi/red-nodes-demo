module.exports = function(RED) {
    function NewNode(config) {
        RED.nodes.createNode(this,config);
        var node = this;
        var counter = 0;
        node.on('input', function(msg) {
            //循环获取msg中的topic
            //console.log(config);
            var sum = config.sum;
            console.log("sum: ",sum);
            node.context().flow.set(msg.topic,msg.payload);
            console.log("flow get ",node.context().flow.get(msg.topic));
            counter++;
            if(counter == sum){
                var arr = node.context().flow.keys();
                console.log("keys: ",arr);
                var flag = true;
                for(var i=0; i<arr.length; i++){
                    if(node.context().flow.get(arr[i]) == false || node.context().flow.get(arr[i]) == "false"){
                        console.log("and false topic: ",arr[i],node.context().flow.get(arr[i]));
                        flag = false;
                        break;
                    }
                }
                if(flag){
                    msg.payload = {status:true};
                    msg.topic = "and";
                    node.send(msg);
                    counter = 0;
                }


            }
            /*if(node.context().flow.get("counter")!= undefined && typeof node.context().flow.get("counter") == "number" ){
                console.log("A counter 已经定义");
                node.context().flow.set('counter', node.context().flow.get("counter")+1);
            }else{
                console.log("A counter 未定义");
                node.context().flow.set('counter', 1);
            }*/
            //console.log("A input flow: ",node.context().flow.get("counter"));
            //node.send(msg);
        });
        node.on("close", function() {

        })
    }
    RED.nodes.registerType('AND',NewNode);
}