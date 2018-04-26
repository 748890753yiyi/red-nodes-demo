var express = require('express');
var process=require('process');
var app = express();
var logger = require('morgan');



function cors(req,res,next){
    res.header("Access-Control-Allow-Origin", req.headers.origin);
    res.header("Access-Control-Allow-Headers", "Content-Type,Content-Length, Authorization, Accept,X-Requested-With,pragma");
    res.header("Access-Control-Allow-Methods","PUT,GET,POST,DELETE,OPTIONS");
    res.header("Access-Control-Allow-Credentials", true);
    if (req.method === 'OPTIONS') {
        res.send(200);
    } else {
        next();
    }
}

app.use(cors);
app.use(logger('dev'));

  app.get('/room1', function(req, res){
    res.end(JSON.stringify([{rid:1,name:"卧室"},{rid:2,name:"客厅"},{rid:3,name:"厨房"},{rid:4,name:"卫生间"}]));
  });

  app.get("/device/:rid/:deviceType", function(req,res){
      var rid = req.param("rid");
      var deviceType = req.param("deviceType");
      if(deviceType == "LIGHT"){
        if(parseInt(rid) == 1){
          res.end(JSON.stringify([{did:1,name:"床头灯"}]));
        }else if(parseInt(rid) == 2){
          res.end(JSON.stringify([{did:2,name:"顶灯"},{did:3,name:"地灯"},{did:4,name:"壁灯"}]));
        }else if(parseInt(rid) == 3){
          res.end(JSON.stringify([{did:4,name:"顶灯"}]));
        }else if(parseInt(rid) == 4){
          res.end(JSON.stringify([{did:5,name:"顶灯"}]));
        }
      }else if(deviceType == "CAMERA"){
        if(parseInt(rid) == 1 || parseInt(rid) == 2 || parseInt(rid) == 3 || parseInt(rid) == 4){
          res.end(JSON.stringify([{did:4,name:"相机"}]));
        }
      }else if(deviceType == "CO2METER"){
        if(parseInt(rid) == 1 || parseInt(rid) == 2 || parseInt(rid) == 3 || parseInt(rid) == 4){
          res.end(JSON.stringify([{did:4,name:"CO2浓度传感器"}]));
        }
      }else if(deviceType == "DISHWASHER"){
        if(parseInt(rid) == 1 || parseInt(rid) == 2 || parseInt(rid) == 3 || parseInt(rid) == 4){
          res.end(JSON.stringify([{did:4,name:"洗碗机"}]));
        }
      }else if(deviceType == "DRYER"){
        if(parseInt(rid) == 1 || parseInt(rid) == 2 || parseInt(rid) == 3 || parseInt(rid) == 4){
          res.end(JSON.stringify([{did:4,name:"烘干机"}]));
        }
      }else if(deviceType == "GASLEAKALARM"){
        if(parseInt(rid) == 1 || parseInt(rid) == 2 || parseInt(rid) == 3 || parseInt(rid) == 4){
          res.end(JSON.stringify([{did:4,name:"燃气泄漏报警器"}]));
        }
      }else if(deviceType == "GASMETER"){
        if(parseInt(rid) == 1 || parseInt(rid) == 2 || parseInt(rid) == 3 || parseInt(rid) == 4){
          res.end(JSON.stringify([{did:4,name:"燃气流量传感器"}]));
        }
      }else if(deviceType == "HUMIDITYMETER"){
        if(parseInt(rid) == 1 || parseInt(rid) == 2 || parseInt(rid) == 3 || parseInt(rid) == 4){
          res.end(JSON.stringify([{did:4,name:"空气湿度传感器"}]));
        }
      }else if(deviceType == "OXYGENMETER"){
        if(parseInt(rid) == 1 || parseInt(rid) == 2 || parseInt(rid) == 3 || parseInt(rid) == 4){
          res.end(JSON.stringify([{did:4,name:"氧气浓度传感器"}]));
        }
      }else if(deviceType == "PM25METER"){
        if(parseInt(rid) == 1 || parseInt(rid) == 2 || parseInt(rid) == 3 || parseInt(rid) == 4){
          res.end(JSON.stringify([{did:4,name:"PM2.5传感器"}]));
        }
      }else if(deviceType == "POWERMETER"){
        if(parseInt(rid) == 1 || parseInt(rid) == 2 || parseInt(rid) == 3 || parseInt(rid) == 4){
          res.end(JSON.stringify([{did:4,name:"用电量传感器"}]));
        }
      }else if(deviceType == "RIPALARM"){
        if(parseInt(rid) == 1 || parseInt(rid) == 2 || parseInt(rid) == 3 || parseInt(rid) == 4){
          res.end(JSON.stringify([{did:4,name:"人体感应报警器"}]));
        }
      }else if(deviceType == "SCENE"){
        if(parseInt(rid) == 1 || parseInt(rid) == 2 || parseInt(rid) == 3 || parseInt(rid) == 4){
          res.end(JSON.stringify([{did:4,name:"场景"}]));
        }
      }else if(deviceType == "SMOKEALARM"){
        if(parseInt(rid) == 1 || parseInt(rid) == 2 || parseInt(rid) == 3 || parseInt(rid) == 4){
          res.end(JSON.stringify([{did:4,name:"烟雾报警器"}]));
        }
      }else if(deviceType == "SWITCH"){
        if(parseInt(rid) == 1 || parseInt(rid) == 2 || parseInt(rid) == 3 || parseInt(rid) == 4){
          res.end(JSON.stringify([{did:4,name:"开关"}]));
        }
      }else if(deviceType == "THERMOMETER"){
        if(parseInt(rid) == 1 || parseInt(rid) == 2 || parseInt(rid) == 3 || parseInt(rid) == 4){
          res.end(JSON.stringify([{did:4,name:"空气温度传感器"}]));
        }
      }else if(deviceType == "THERMOSTAT"){
        if(parseInt(rid) == 1 || parseInt(rid) == 2 || parseInt(rid) == 3 || parseInt(rid) == 4){
          res.end(JSON.stringify([{did:4,name:"恒温器"}]));
        }
      }else if(deviceType == "VACUUM"){
        if(parseInt(rid) == 1 || parseInt(rid) == 2 || parseInt(rid) == 3 || parseInt(rid) == 4){
          res.end(JSON.stringify([{did:4,name:"吸尘器机器人"}]));
        }
      }else if(deviceType == "WASHER"){
        if(parseInt(rid) == 1 || parseInt(rid) == 2 || parseInt(rid) == 3 || parseInt(rid) == 4){
          res.end(JSON.stringify([{did:4,name:"洗衣机"}]));
        }
      }else if(deviceType == "WATERLEAKALARM"){
        if(parseInt(rid) == 1 || parseInt(rid) == 2 || parseInt(rid) == 3 || parseInt(rid) == 4){
          res.end(JSON.stringify([{did:4,name:"水流量传感器"}]));
        }
      }else if(deviceType == "WATERMETER"){
        if(parseInt(rid) == 1 || parseInt(rid) == 2 || parseInt(rid) == 3 || parseInt(rid) == 4){
          res.end(JSON.stringify([{did:4,name:"漏水报警器"}]));
        }
      }else if(deviceType == "OUTLET"){
        if(parseInt(rid) == 1 || parseInt(rid) == 2 || parseInt(rid) == 3 || parseInt(rid) == 4){
          res.end(JSON.stringify([{did:4,name:"插座"}]));
        }
      }
  })

  app.get('/traits/:type/:did', function(req, res){
    var type = req.param("type");
    var did = req.param("did");
    console.log("type: ",type);
    console.log("did: ",did);
    if((type == "CAMERA" || 
      type == "CO2METER" || 
      type == "DISHWASHER" ||
      type == "DRYER" ||
      type == "GASLEAKALARM" ||
      type == "GASMETER" || 
      type == "HUMIDITYMETER" ||
      type == "OXYGENMETER" ||
      type == "PM25METER" || 
      type == "POWERMETER" || 
      type == "RIPALARM" || 
      type == "SCENE" ||
      type == "SMOKEALARM" ||
      type == "SWITCH" ||
      type == "THERMOMETER" ||
      type == "THERMOSTAT" || 
      type == "VACUUM" ||
      type == "WASHER" ||
      type == "WATERLEAKALARM" ||
      type == "WATERMETER" ||
      type == "OUTLET") && did != "undefined"){
        res.end(JSON.stringify([{tid:1,name:"开关"}]));
      }else if(type == "LIGHT" && did != "undefined"){
        res.end(JSON.stringify([{tid:1,name:"开关"},{tid:2,name:"亮度"}]));
      }
  });



process.on('uncaughtException',function(err){
    console.log("要看一看是什么错误: "+err.stack);
    // throw err;
});
  app.listen(3000,function(){
      console.log("server start on 3000")
  });