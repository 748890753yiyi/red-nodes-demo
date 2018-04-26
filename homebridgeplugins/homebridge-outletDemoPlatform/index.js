var http = require("http");
let Accessory, Service, Characteristic, UUIDGen;
module.exports = function(homebridge) {
    console.log("homebridge API version: " + homebridge.version);
    Accessory = homebridge.platformAccessory;
    Service = homebridge.hap.Service;
    Characteristic = homebridge.hap.Characteristic;
    UUIDGen = homebridge.hap.uuid;
    homebridge.registerPlatform("homebridge-outletDemoPlatform", "OutletDemoPlatform", OutletDemoPlatform, true);
}

class OutletDemoPlatform{
    constructor(log, config, api){
        const self = this;
        this.log = log;
        this.config = config;
        this.accessories = {};
        this.state = false;
        if(api){
            this.api = api;
            this.api.on("didFinishLaunching",this.didFinishLaunching.bind(this));
        }

        this.requestServer = http.createServer(function(request, response) {
            if (request.url == "/remove") {
                this.accessories = {};
                response.writeHead(204);
                response.end();
            }
        }.bind(this));
        this.requestServer.listen(18085, function() {
            console.log("Server Listening...18085");
        });
    }

    didFinishLaunching(){
        var SerialPort = require('serialport');
        this.port = new SerialPort('/dev/ttyUSB0', {
            baudRate: 115200
        });
        //打开网络
        var command = Buffer.from("FE0B02010200000088FF83", 'hex');
        console.log("command: ",command);
        this.port.write(Buffer.from(command, 'hex'), (err) => {
            if (err) {
                console.log("serialport write err: ",err);
            }
        });
        
        this.port.on('data',(data)=>{
            console.log("serialport on data: ",data);
            data = data.toString('hex').toLowerCase();
            console.log(`data reviced...${data}`);
            const addr = data.substr(10, 4);//变化的
            const mac = data.substr(22, 16);//不变的
            if(data.startsWith("fe") && data.substr(4,4)=='0282'){
                
                console.log("addr: ",addr);
                console.log("mac: ",mac);
                var command1 = Buffer.from(`FE0A020302${addr}00887F`, 'hex');
                console.log("command1: ",command1);
                this.port.write(Buffer.from(command1, 'hex'), (err) => {
                    if (err) {
                        console.log("serialport write err: ",err);
                    }
                });
            }else if(data.startsWith("fe") && data.substr(4,4)=='0283'){
                //查询有几个短点
                var num = parseInt(data.substr(20,2));
                console.log("获取到的端点数num: ",num);
                var ep = data.substr(22,2);//端点号
                //搜索设备类型信息
                var command2 = Buffer.from(`FE0A020402${addr}${ep}8866`, 'hex');
                console.log("command2: ",command2);
                this.port.write(Buffer.from(command2, 'hex'), (err) => {
                    if (err) {
                        console.log("serialport write err: ",err);
                    }
                });

            }else if(data.startsWith("fe") && data.substr(4,4)=='0284'){
                //获取到的设备类型信息
                var info_l = data.substr(24,2);
                var info_h = data.substr(26,2);
                var endpoint = data.substr(14,2);
                var deviceType = info_h+info_l;//0051
                console.log("info_l: ",info_l);
                console.log("info_h: ",info_h);
                console.log("deviceType: ",deviceType);
                console.log("endpoint: ",endpoint);
                if(deviceType == "0051"){
                    let uuid = UUIDGen.generate(mac + endpoint);
                    if (this.accessories[uuid] === undefined) {
                        console.log("设备不存在")
                        let accessory = new Accessory("outlet", uuid);
                        accessory.context.addr = addr;
                        accessory.context.endpoint = endpoint;
                        accessory.context.mac = mac;
                        let service = new Service.Outlet('zigbeeOutlet');
                        var count = 88;
                        service.getCharacteristic(Characteristic.On)
                            .on('set', (value, callback) => {
                                //发送set,操作开关灯
                                count +=1;
                                if(count>95){
                                    count = 88;
                                }
                                value = value ? "01":"00"; 
                                var command3 = Buffer.from(`fe0b050102${addr}${endpoint}${count}${value}65`, 'hex');
                                console.log("command3: ",command3);
                                this.port.write(Buffer.from(command3, 'hex'), (err) => {
                                    if (err) {
                                        console.log("serialport write err: ",err);
                                    }
                                    this.state = value == "01" ? true : false;
                                    callback(null);
                                });
                                
                            })
                            .on('get', callback => {
                                //FE 0C 05 05 02 2C 33 01 88 00 00 66
                                var command4 = Buffer.from(`fe0c050502${addr}${endpoint}88000066`, 'hex');
                                console.log("command4: ",command4);
                                this.port.write(Buffer.from(command4, 'hex'), (err) => {
                                    if (err) {
                                        console.log("serialport write err: ",err);
                                    }
                                    callback(null,this.state);
                                });
                                
                            });
                        accessory.reachable = true;
                        accessory.addService(service);
                        this.accessories[uuid] = accessory;
                        this.api.registerPlatformAccessories("homebridge-outletDemoPlatform", "OutletDemoPlatform", [accessory]);
                    }else{
                        console.log("设备存在")
                        let accessory = this.accessories[uuid];
                        accessory.context.addr = addr;
                        accessory.context.endpoint = endpoint;
                        accessory.context.mac = mac;
                        
                    }
                }

            }else if(data.startsWith("fe") && data.substr(4,4)=='0585'){
                //截取状态
                var endpoint = data.substr(14,2);
                var uuid = UUIDGen.generate(mac + endpoint);
                this.state = (data.substr(20,2) == "01") ? true : false;
            }
        })
    }
    configureAccessory(accessory) {
        console.log("configureAccessory");
        console.log(accessory.displayName, "Configure Accessory");
        var platform = this;
        accessory.reachable = true;
        this.log(accessory.displayName, "Configure Accessory");
        console.log("accessroy: ",accessory);
        // accessory.on('identify', function(paired, callback) {
        //     platform.log(accessory.displayName, "Identify!!!");
        //     callback();
        //  });
        var count = 88;
        if (accessory.getService('zigbeeOutlet')) {
            console.log("设备获取插座服务");
            accessory.getService('zigbeeOutlet')
                .getCharacteristic(Characteristic.On)

                .on('set', (value, callback) => {
                    console.log("configAccessory outlet on set: ",value);
                    count +=1;
                    if(count>95){
                        count = 88;
                    }
                    value = value ? "01":"00"; 
                    var command3 = Buffer.from(`fe0b050102${accessory.context.addr}${accessory.context.endpoint}${count}${value}65`, 'hex');
                    console.log("command3: ",command3);
                    this.port.write(Buffer.from(command3, 'hex'), (err) => {
                        if (err) {
                            console.log("serialport write err: ",err);
                        }
                        this.state = value == "01" ? true : false;
                        callback(null);
                    });
                    
                })
                .on('get', callback => {
                    console.log("configAccessory outlet on get");
                    //FE 0C 05 05 02 2C 33 01 88 00 00 66
                    var command4 = Buffer.from(`fe0c050502${accessory.context.addr}${accessory.context.endpoint}88000066`, 'hex');
                    console.log("command4: ",command4);
                    this.port.write(Buffer.from(command4, 'hex'), (err) => {
                        if (err) {
                            console.log("serialport write err: ",err);
                        }
                        callback(null,this.state);
                    });
                    
                });
            accessory.getService('zigbeeOutlet')
                .getCharacteristic(Characteristic.OutletInUse)
                .on('get', function(callback) {
                    console.log("configAccessory outlet OutletInUse get: ");
                    callback(null,true);
            });
            
        }

        //this.accessories[accessory.UUID] = accessory;
    }
}


