const VK = require('vk-fast-longpoll');


class Bot {

    //token
    //commands

    constructor(token){
        this.group = new VK(token);
        this.init();

        this.commands = [];
    }

    init(){
        this.group.longpoll.start();

        this.group.longpoll.on('message', (message) => {
            if(!message.isOutbox){
                this.fireCommand(message);
            }
        });
    }

    command(command, handler){
        if(typeof command === "string"){
            command = command.toLocaleLowerCase();
        }
        this.commands.push({command: command, handler: handler});
    }

    async fireCommand(message){
        let _this = this;
        for(let i = 0; i < this.commands.length; i++){
            let command = this.commands[i];
            if((typeof command.command !== "string" && command.command.test(message._text)) || message._text.toLocaleLowerCase().indexOf(command.command) !== -1){
                let messageCall = {
                    sender: message._sender,

                    text: message._text,

                    api: _this.group.api,

                    reply: async function (text, keyboard) {
                        let flag = false;
                        let msg;
                        if(text.indexOf("|") !== -1){
                            var params = text.split("|");
                            if(Number.isInteger(parseInt(params[0]))){
                                _this.group.api.messages.send({user_id: message._sender, sticker_id: params[0]});
                                msg = params[1];
                            }else{
                                flag = true;
                                msg = params[0];
                            }
                        }
                        if(keyboard){
                            await _this.group.api.messages.send({user_id: message._sender, message: msg, keyboard: JSON.stringify(keyboard)});
                        }else{
                            await _this.group.api.messages.send({user_id: message._sender, message: msg}); 
                        }
                        if(flag){
                            _this.group.api.messages.send({user_id: message._sender, sticker_id: params[1]});
                        }
                    },

                    sendSticker: function(id){
                        _this.group.api.messages.send({user_id: message._sender, sticker_id: id});
                    }
                };

                messageCall.text.__proto__.startsWith = function(text){
                    text = text.toLocaleLowerCase();
                    let position =  0; 
                    return this.toLocaleLowerCase().indexOf(text, position) === position;
                }

                let status = await command.handler(messageCall);
                
                if(status){
                    break;
                };
            }
        }
    }

}

module.exports = Bot;