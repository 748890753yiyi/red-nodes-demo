const commandUtil = {
    generateCommand:function(data){
        return Buffer.from(data,'hex')
    }
}

module.exports = commandUtil;