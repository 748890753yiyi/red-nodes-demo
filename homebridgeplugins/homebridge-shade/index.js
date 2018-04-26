const SerialPort = require('serialport');
const commandUtil = require("./commandUtil");
let Accessory,
    Service,
    Characteristic,
    UUIDGen;
module.exports = function(homebridge){
    Accessory = homebridge.platformAccessory;
    Service = homebridge.hap.Service;
    Characteristic = homebridge.hap.Characteristic;
    UUIDGen = homebridge.hap.uuid;
    homebridge.registerPlatform("homebridge-shade","shadePlatform",shadePlatform,true);
}
class shadePlatform{
    constructor(log, config, api){
        const self = this;
        this.log = log;
        this.config = config;
        this.accessories = {};
        //this.switchOpenState = false;
        //this.switchCloseState = false;
        if(api){
            this.api = api;
            this.api.on("didFinishLaunching",this.didFinishLaunching.bind(this))
        }
    }

    didFinishLaunching(){
        //打开串口
        this.port = new SerialPort('/dev/ttyUSB0',{
            baudRate: 115200
        })
        //打开网络
        let openNetworkHex = 'FE0B02010200000088FF83';
        const openNetworkCommand = commandUtil.generateCommand(openNetworkHex);
        this.port.write(openNetworkCommand, (err) =>{
            if(err){
                console.error("openNetWorkError: ",err);
            }
        })
        //接收数据，根据数据进行分别处理
        this.port.on("data", (data) => {
            data = data.toString('hex').toLowerCase();
            console.log("serialport recive data: ",data);
            const addr = data.substr(10,4);//网络地址(可变)
            const mac = data.substr(22,16);//mac地址(不变)
            if(data.startsWith('fe') && data.substr(4,4) === '0282'){
                //返回设备addr,通过设备addr查询设备的端点数
                let getPointNumCommandHex = `FE0A020302${addr}00887F`;
                let getPointNumCommand = commandUtil.generateCommand(getPointNumCommandHex);
                this.port.write(getPointNumCommand, (err) => {
                    if(err) console.error("serialport on getPointNumCommand data error: ",err);
                })

            }else if(data.startsWith('fe') && data.substr(4,4) === '0283'){
                console.log(`0283 data: ${data}`);
                //获取到了端点数，并且通过端点查询设备类型
                let endPointNum = parseInt(data.substr(20,2));//端点数
                let pointArr = [];
                console.log("getPointsNum: ",endPointNum);
                let point = "0F";
                let getDeviceTypeHex = `FE0A020402${addr}${point}8866`;
                let getDeviceTypeCommand = commandUtil.generateCommand(getDeviceTypeHex);
                this.port.write(getDeviceTypeCommand, (err) => {
                    if (err) {
                        console.log(`serialport ${point} getDeviceType write err: `,err);
                    }
                });
                // if(endPointNum > 0){
                //     let startIndex = 22;//第一个端点的开始位置
                //     for(let i = 0; i < endPointNum; i++){
                //         pointArr[i] = data.substr(startIndex + (i * 2), 2)
                //     }
                // }
                // for(let point of pointArr){
                //     //搜索设备类型
                //     let getDeviceTypeHex = `FE0A020402${addr}${point}8866`;
                //     let getDeviceTypeCommand = commandUtil.generateCommand(getDeviceTypeHex);
                //     this.port.write(getDeviceTypeCommand, (err) => {
                //         if (err) {
                //             console.log(`serialport ${point} getDeviceType write err: `,err);
                //         }
                //     });
                // }

            }else if(data.startsWith('fe') && data.substr(4,4) === '0284'){
                console.log(`0284 data: ${data}`);
                //获取设备类型,并处理
                let info_l = data.substr(24,2),
                    info_h = data.substr(26,2),
                    endpoint = data.substr(14,2),
                    deviceType = info_h+info_l;//0202
                console.log(`端点号: ${endpoint}-----设备类型: ${deviceType}`);
                if(deviceType === '0202'){
                    for(let i = 1; i <= 2; i++){
                        let uuid = UUIDGen.generate(mac + endpoint + i);
                        if(this.accessories[uuid] === undefined){
                            let accessory = new Accessory("Shade", uuid);
                            accessory.context.addr = addr;
                            accessory.context.endpoint = endpoint;
                            accessory.context.mac = mac;
                            let serviceName = '';
                            if(i === 1){
                                serviceName = 'open';
                                accessory.context.covering = 'open';
                                accessory.context.switchState = false;
                            }else{
                                serviceName = 'close';
                                accessory.context.covering = 'close';
                                accessory.context.switchState = false;
                            }
                            let service = new Service.Switch(serviceName);
                            let characteristic = service.getCharacteristic(Characteristic.On);
                            if(i === 1){
                                characteristic
                                .on('set', (value, callback) => {
                                    if(value){
                                        //置反关闭服务
                                        accessory.context.switchState = true;
                                        let uuid = UUIDGen.generate(accessory.context.mac + accessory.context.endpoint + '2');
                                        let closeSwitch = this.accessories[uuid];
                                        closeSwitch.getService(Service.Switch).getCharacteristic(Characteristic.On).setValue(false);
                                    }else{
                                        accessory.context.switchState = false;
                                    }
                                    
                                    let val = value ? '00' : '02';
                                    const data = `FE0B080102${addr}${endpoint}88${val}FF`;
                                    let command = commandUtil.generateCommand(data);
                                    this.port.write(command, (err) => {
                                        if (err) throw err;
                                        
                                    });
                                    callback(null);
                                    
                                })
                                .on('get', callback => {
                                    callback(null,accessory.context.switchState);
                                });
                            }else{
                                characteristic
                                .on('set', (value, callback) => {
                                    if(value){
                                        //置反关闭服务
                                        accessory.context.switchState = true;
                                        
                                        let uuid = UUIDGen.generate(accessory.context.mac + accessory.context.endpoint + '1');
                                        let openSwitch = this.accessories[uuid];
                                            openSwitch.getService(Service.Switch).getCharacteristic(Characteristic.On).setValue(false);
                                        
                                    }else{
                                        accessory.context.switchState = false;
                                    }
                                    
                                    let val = value ? '01' : '02';
                                    const data = `FE0B080102${addr}${endpoint}88${val}FF`;
                                    let command = commandUtil.generateCommand(data);
                                    this.port.write(command, (err) => {
                                        if (err) throw err;
                                        callback(null);
                                    });
                                })
                                .on('get', callback => {
                                    callback(null,accessory.context.switchState);
                                });
                            }
                            accessory.reachable = true;
                            accessory.addService(service);
                            this.accessories[uuid] = accessory;
                            this.api.registerPlatformAccessories("homebridge-shade","shadePlatform", [accessory]);
                        }else{
                            let accessory = this.accessories[uuid];
                            accessory.context.addr = addr;
                            accessory.context.endpoint = endpoint;
                            accessory.context.mac = mac;
                        }
                    }
                }
            }
            
        })
    }

    

    configureAccessory(accessory){
        //const tmpUUID = accessory.uuid;
        var platform = this;
        accessory.on('identify', function(paired, callback) {
            platform.log(accessory.displayName, "Identify!!!");
            callback();
        });

        accessory.reachable = true;
        console.log(accessory);
        console.log(`accessory context covering ${accessory.context.covering}`);
        this.accessories[accessory.UUID] = accessory;

        if(accessory.getService(Service.Switch)){
            let characteristic = accessory.getService(Service.Switch).getCharacteristic(Characteristic.On);
            if(accessory.context.covering === 'open'){
                console.log('this.switchOpenState: ',accessory.context.switchState);
                characteristic
                .on('set', (value, callback) => {
                    if(value){
                        //置反关闭服务
                        console.log("open服务 打开");
                        accessory.context.switchState = true;
                        let uuid = UUIDGen.generate(accessory.context.mac + accessory.context.endpoint + '2');
                        console.log("包含close服务 关闭close服务");
                        let closeSwitch = this.accessories[uuid];
                        closeSwitch.getService(Service.Switch).getCharacteristic(Characteristic.On).setValue(false);
                        
                    }else{
                        accessory.context.switchState = false;
                    }
                    let val = value ? '00' : '02';
                    const data = `FE0B080102${accessory.context.addr}${accessory.context.endpoint}88${val}FF`;
                    let command = commandUtil.generateCommand(data);
                    this.port.write(command, (err) => {
                        if (err) throw err;
                        
                    });
                    callback(null);
                })
                .on('get', callback => {
                    console.log("open get")
                    let state = accessory.context.switchState? accessory.context.switchState : false;
                    callback(null,state);
                });
            }else{
                characteristic
                .on('set', (value, callback) => {
                    if(value){
                        //置反关闭服务
                        console.log("close服务, 打开");
                        accessory.context.switchState = true;
                        let uuid = UUIDGen.generate(accessory.context.mac + accessory.context.endpoint + '1');
                        console.log("包含open服务 关闭open服务");
                        let openSwitch = this.accessories[uuid];
                        openSwitch.getService(Service.Switch).getCharacteristic(Characteristic.On).setValue(false);
                        
                        
                    }else{
                        accessory.context.switchState = false;
                    }
                    
                    let val = value ? '01' : '02';
                    const data = `FE0B080102${accessory.context.addr}${accessory.context.endpoint}88${val}FF`;
                    let command = commandUtil.generateCommand(data);
                    this.port.write(command, (err) => {
                        if (err) throw err;
                        
                    });
                    callback(null);
                })
                .on('get', callback => {
                    console.log("close get")
                    let state = accessory.context.switchState? accessory.context.switchState : false;
                    callback(null,state);
                });
            }
        }
        
    }
}

