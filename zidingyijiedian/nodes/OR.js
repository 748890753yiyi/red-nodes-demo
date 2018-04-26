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
                var flag = false;
                for(var i=0; i<arr.length; i++){
                    if(node.context().flow.get(arr[i]) == true || node.context().flow.get(arr[i]) == "true"){
                        console.log("and false topic: ",arr[i],node.context().flow.get(arr[i]));
                        flag = true;
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
        });
        node.on("close", function() {

        })
    }
    RED.nodes.registerType('OR',NewNode);
}