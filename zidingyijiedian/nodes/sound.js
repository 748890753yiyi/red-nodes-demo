module.exports = function(RED) {
    function NewNode(config) {
        RED.nodes.createNode(this,config);
        var node = this;
        node.on('input', function(msg) {
            if(node.context().flow.get("counter")!= undefined && typeof node.context().flow.get("counter") == "number" ){
                console.log("sound counter 已经定义");
                node.context().flow.set('counter', node.context().flow.get("counter")+1);
            }else{
                console.log("sound counter 未定义");
                node.context().flow.set('counter', 1);
            }
            //node.context().flow.set('counter',node.context().flow.get("counter") ? node.context().flow.get("counter")+1 : 1);
            console.log("sound input flow: ",node.context().flow.get("counter"));
            msg.payload = {sound: msg.payload.value};
            node.send(msg);
            //node.context().flow.set('counter',(node.context().flow.get("counter") && node.context().flow.get("counter")>=1)? node.context().flow.get("counter")-1 : 0);
            //console.log("sound close flow: ",node.context().flow.get("counter"));
            /*if(msg.payload.aid == "sound" && msg.payload.iid =="decibel" && msg.payload.value >= 25){
                msg.payload = {doorStatus1: "open"};
                node.send(msg);
            }*/

        });
        node.on("close", function() {

        })
    }
    RED.nodes.registerType('sound',NewNode);
}