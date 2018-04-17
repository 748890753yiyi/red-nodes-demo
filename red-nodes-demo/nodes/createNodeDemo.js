module.exports = function(RED) {
    function CreateNodeDemoNode(config) {
        RED.nodes.createNode(this,config);
        var node = this;
        var fs = require("fs");
        var eventproxy = require('eventproxy');
        node.on('input', function(msg) {
            msg.payload.forEach(function(tempObj){
                console.log("tempObj: ",JSON.stringify(tempObj));
                var tempKey = Object.keys(tempObj)[0];
                console.log("tempKey: ",tempKey);
                if(!fs.existsSync("D:/software/nvm/node_global/node_modules/node-red/nodes/"+tempKey+".html")){
                    createNode(tempObj,tempKey);
                }else{
                    //updateValue(tempObj)
                }
            })

            function updateValue(data){
                var replace = require('replace-in-file');
                var tempKey = Object.keys(data)[0];
                var tempObj = {};
                for(var key1 in data[tempKey]){
                    tempObj[key1] = {"value":data[tempKey][key1]}
                }
                var options = {
                    files: 'D:\\software\\nvm\\node_global\\node_modules\\node-red\\nodes\\'+tempKey+'.html',
                    from: /defaults:.+}},/g,
                    to: "defaults:"+JSON.stringify(tempObj)+",",
                };

                try {
                    let changedFiles = replace.sync(options);
                    console.log('Modified files:', changedFiles.join(', '));
                    msg.payload = "update success";
                    node.send(msg);
                }
                catch (error) {
                    console.error('Error occurred:', error);
                }
            }

            function createNode(msg,key) {
                var ep = new eventproxy();
                //模拟数据


                var keysArr = Object.keys(msg[key]);
                console.log("内层对象的所有属性：",JSON.stringify(keysArr));
                var attrObj = {};

                //组装第二部分字符串
                var tempStr1 = `<script type="text/x-red" data-template-name=${"'"+key+"'"}>`;
                for(var i=0;i<keysArr.length;i++){
                    var tmp = `<div class="form-row">
								<label for="node-input-${keysArr[i]}"><i class="icon-tag"></i>${"'"+keysArr[i]+"'"}</label>
								<input type="text" id="node-input-${keysArr[i]}" placeholder=${"'"+keysArr[i]+"'"}>
							</div>`
                    tempStr1 += tmp;
                }
                tempStr1 += `</script>`;

                //生成第一部分字符串的默认属性对象
                for(var i=0; i<keysArr.length;i++){
                    attrObj[keysArr[i]] = {"value":msg[key][keysArr[i]]}
                }

                var thirdHtmlStr = `<script type="text/x-red" data-help-name=${"'"+key+"'"}>
                                    <p>status open/close</p>
                                </script>`;
                //整体html字符串
                var htmlStr = `<script type="text/javascript">
							RED.nodes.registerType(${"'"+key+"'"},{
								category: 'function',
								color: '#a6bbcf',
								defaults:${JSON.stringify(attrObj)},
								inputs:1,
								outputs:1,
								icon: "file.png",
								label: function() {
									return this.name||${"'"+key+"'"};
								}
							});
						</script>
						${tempStr1}
						${thirdHtmlStr}
						`;

                var jsStr = `module.exports = function(RED) {
                                function NewNode(config) {
                                    RED.nodes.createNode(this,config);
                                    var node = this;
                                    node.on('input', function(msg) {
                                        node.send(msg);
                                    });
                                }
                                RED.nodes.registerType(${"'"+key+"'"},NewNode);
                            }`;


                fs.writeFile('D:\\software\\nvm\\node_global\\node_modules\\node-red\\nodes\\'+key+'.html', htmlStr, function(err) {
                    if(err) {
                        return console.log(err);
                    }
                    fs.writeFile('D:\\software\\nvm\\node_global\\node_modules\\node-red\\nodes\\'+key+'.js', jsStr, function (err) {
                        console.log("The file was saved!");
                        msg.payload = "success";
                        node.send(msg);
                    })
                });
            }

        });
    }
    RED.nodes.registerType("createNodeDemo",CreateNodeDemoNode);
}